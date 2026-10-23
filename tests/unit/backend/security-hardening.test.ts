import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => {
  const m = {
    userProfile: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    examAttempt: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    examQuestion: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    userAnswer: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    question: {
      findMany: vi.fn(),
    },
    topicProgress: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb: (tx: unknown) => unknown) => cb(m)),
  };
  return { mockPrisma: m };
});

vi.mock('@/backend/db/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    id: 'user-sec-123',
    email: 'sec@ctfl.local',
    fullName: 'Aluno Sec',
    role: 'STUDENT',
  }),
  hashPassword: vi.fn((p) => `hashed_${p}`),
  AuthError: class AuthError extends Error {
    status = 401;
  },
}));

vi.mock('@/lib/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue({ id: 'audit-1' }),
}));

vi.mock('@/backend/services/gamification.service', () => ({
  awardXpAndRecordActivity: vi.fn().mockResolvedValue({ awarded: true }),
  XP_RULES: {
    EXAM_COMPLETED: 50,
    EXAM_PASSED: 100,
  },
}));

import { POST as handleRecover } from '@/app/api/auth/recover/route';
import { POST as handleAnswer } from '@/app/api/exams/[id]/answer/route';
import { finalizeExamAttemptIdempotent } from '@/backend/services/exam.service';
import * as gamificationService from '@/backend/services/gamification.service';

describe('Security Hardening & Anti-Side-Channel Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OWASP Top 10 — Prevenção de Enumeração de E-mails (/api/auth/recover)', () => {
    it('retorna HTTP 200 genérico quando o e-mail não existe no sistema', async () => {
      mockPrisma.userProfile.findFirst.mockResolvedValue(null);

      const req = new Request('http://localhost:3000/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'naoexiste@dominio.com',
          newPassword: 'NovaSenhaForte123!',
        }),
      });

      const res = await handleRecover(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Se o e-mail informado estiver cadastrado');
    });

    it('retorna a mesma mensagem uniforme HTTP 200 quando o e-mail existe', async () => {
      mockPrisma.userProfile.findFirst.mockResolvedValue({
        id: 'user-existent-id',
        email: 'cadastrado@ctfl.local',
      });
      mockPrisma.userProfile.update.mockResolvedValue({ id: 'user-existent-id' });

      const req = new Request('http://localhost:3000/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'cadastrado@ctfl.local',
          newPassword: 'NovaSenhaForte123!',
        }),
      });

      const res = await handleRecover(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Se o e-mail informado estiver cadastrado');
      expect(mockPrisma.userProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-existent-id' },
          data: { passwordHash: 'hashed_NovaSenhaForte123!' },
        })
      );
    });
  });

  describe('Motor de Simulados — Anti-Side-Channel Leak (/api/exams/[id]/answer)', () => {
    it('grava isCorrect como false provisório durante tentativa IN_PROGRESS mesmo se alternativa for correta', async () => {
      const futureExpires = new Date(Date.now() + 3600 * 1000);
      const pastStarted = new Date(Date.now() - 60 * 1000);

      mockPrisma.examAttempt.findFirst.mockResolvedValue({
        id: 'attempt-123',
        userId: 'user-sec-123',
        status: 'IN_PROGRESS',
        startedAt: pastStarted,
        expiresAt: futureExpires,
      });

      mockPrisma.examQuestion.findFirst.mockResolvedValue({
        id: 'eq-456',
        attemptId: 'attempt-123',
        questionId: 'q-real-789',
        correctDisplayLabel: 'B',
      });

      const req = new Request('http://localhost:3000/api/exams/attempt-123/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Aluno envia alternativa 'B', que bate com correctDisplayLabel 'B'
        body: JSON.stringify({
          examQuestionId: 'eq-456',
          selectedLabel: 'B',
        }),
      });

      const res = await handleAnswer(req, { params: { id: 'attempt-123' } });
      expect(res.status).toBe(200);

      // Invariante inegociável de segurança: NUNCA grava isCorrect: true durante IN_PROGRESS
      expect(mockPrisma.userAnswer.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { examQuestionId: 'eq-456' },
          update: expect.objectContaining({
            selectedLabel: 'B',
            isCorrect: false,
          }),
          create: expect.objectContaining({
            selectedLabel: 'B',
            isCorrect: false,
          }),
        })
      );
    });
  });

  describe('Concorrência e Idempotência — Trava Atômica CAS em finalizeExamAttemptIdempotent', () => {
    it('se updateMany retornar count === 0, não reprocessa XP nem duplica registros', async () => {
      const mockAttempt = {
        id: 'attempt-race-999',
        userId: 'user-sec-123',
        status: 'IN_PROGRESS',
        startedAt: new Date(Date.now() - 1000),
        expiresAt: new Date(Date.now() + 3600000),
        mode: 'FULL',
        configuration: { passingScore: 26, pointsPerQuestion: 1 },
        examQuestions: [],
      };

      mockPrisma.examAttempt.findFirst.mockResolvedValue(mockAttempt);
      mockPrisma.examAttempt.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.examAttempt.findUniqueOrThrow.mockResolvedValue({
        ...mockAttempt,
        status: 'COMPLETED',
      });

      const awardSpy = vi.spyOn(gamificationService, 'awardXpAndRecordActivity');

      const result = await finalizeExamAttemptIdempotent('attempt-race-999', 'user-sec-123');

      expect(result.status).toBe('COMPLETED');
      // Não deve chamar awardXpAndRecordActivity quando count === 0 (derrota no CAS)
      expect(awardSpy).not.toHaveBeenCalled();
      // Não deve ter chamado updates de userAnswer nem topicProgress
      expect(mockPrisma.userAnswer.updateMany).not.toHaveBeenCalled();
    });
  });
});
