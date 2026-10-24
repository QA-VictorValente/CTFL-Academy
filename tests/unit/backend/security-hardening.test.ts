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
    passwordResetToken: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((cb: unknown) =>
      typeof cb === 'function' ? (cb as (tx: unknown) => unknown)(m) : Promise.all(cb as Promise<unknown>[])
    ),
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

vi.mock('@/lib/email', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-msg-1' }),
}));

vi.mock('@/backend/services/gamification.service', () => ({
  awardXpAndRecordActivity: vi.fn().mockResolvedValue({ awarded: true }),
  XP_RULES: {
    EXAM_COMPLETED: 50,
    EXAM_PASSED: 100,
  },
}));

import { POST as handleRecover } from '@/app/api/auth/recover/route';
import { POST as handleResetPassword } from '@/app/api/auth/reset-password/route';
import { sendPasswordResetEmail } from '@/lib/email';
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
        }),
      });

      const res = await handleRecover(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Se o e-mail informado estiver cadastrado');
      expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('retorna a mesma mensagem uniforme HTTP 200 e gera token temporário quando o e-mail existe', async () => {
      mockPrisma.userProfile.findFirst.mockResolvedValue({
        id: 'user-existent-id',
        email: 'cadastrado@ctfl.local',
      });
      mockPrisma.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.passwordResetToken.create.mockResolvedValue({
        id: 'token-1',
        email: 'cadastrado@ctfl.local',
        tokenHash: 'somehash',
      });

      const req = new Request('http://localhost:3000/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'cadastrado@ctfl.local',
        }),
      });

      const res = await handleRecover(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Se o e-mail informado estiver cadastrado');
      expect(mockPrisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { email: 'cadastrado@ctfl.local' },
      });
      expect(mockPrisma.passwordResetToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'cadastrado@ctfl.local',
          }),
        })
      );
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        'cadastrado@ctfl.local',
        expect.stringContaining('/redefinir-senha?token=')
      );
    });
  });

  describe('Fluxo Seguro de Redefinição de Senha (/api/auth/reset-password)', () => {
    it('retorna HTTP 400 se o token não existir ou for inválido', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

      const req = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'token-invalido',
          newPassword: 'NovaSenhaSegura123!',
        }),
      });

      const res = await handleResetPassword(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Link expirado ou já utilizado');
    });

    it('retorna HTTP 400 se o token já tiver sido utilizado', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'tok-123',
        email: 'user@ctfl.local',
        tokenHash: 'hash',
        usedAt: new Date(Date.now() - 1000),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      const req = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'token-ja-usado',
          newPassword: 'NovaSenhaSegura123!',
        }),
      });

      const res = await handleResetPassword(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Link expirado ou já utilizado');
    });

    it('retorna HTTP 400 se o token estiver expirado (> 15 minutos)', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'tok-123',
        email: 'user@ctfl.local',
        tokenHash: 'hash',
        usedAt: null,
        expiresAt: new Date(Date.now() - 5000), // Expirado no passado
      });

      const req = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'token-expirado',
          newPassword: 'NovaSenhaSegura123!',
        }),
      });

      const res = await handleResetPassword(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Link expirado ou já utilizado');
    });

    it('atualiza senha, marca token como utilizado e retorna 200 quando válido', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'tok-valido',
        email: 'user@ctfl.local',
        tokenHash: 'hash',
        usedAt: null,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      mockPrisma.userProfile.findFirst.mockResolvedValue({
        id: 'user-id-1',
        email: 'user@ctfl.local',
      });
      mockPrisma.userProfile.update.mockResolvedValue({ id: 'user-id-1' });
      mockPrisma.passwordResetToken.update.mockResolvedValue({ id: 'tok-valido' });

      const req = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'raw-token-123',
          newPassword: 'NovaSenhaSegura123!',
        }),
      });

      const res = await handleResetPassword(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(mockPrisma.userProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-id-1' },
          data: expect.objectContaining({
            passwordHash: 'hashed_NovaSenhaSegura123!',
          }),
        })
      );
      expect(mockPrisma.passwordResetToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tok-valido' },
          data: expect.objectContaining({
            usedAt: expect.any(Date),
          }),
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
