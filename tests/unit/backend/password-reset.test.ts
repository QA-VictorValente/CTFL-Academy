import crypto from 'crypto';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma } = vi.hoisted(() => {
  const m = {
    userProfile: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      if (typeof arg === 'function') {
        return (arg as (tx: unknown) => unknown)(m);
      }
      return arg;
    }),
  };
  return { mockPrisma: m };
});

vi.mock('@/backend/db/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

const mockCheckRateLimit = vi.fn().mockReturnValue({ allowed: true, resetInSeconds: 0 });
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

const mockLogAuditEvent = vi.fn().mockResolvedValue({ id: 'audit-event-1' });
vi.mock('@/lib/audit', () => ({
  logAuditEvent: (...args: unknown[]) => mockLogAuditEvent(...args),
}));

const mockSendPasswordResetEmail = vi.fn().mockResolvedValue({ success: true, messageId: 'email-1' });
vi.mock('@/lib/email', () => ({
  sendPasswordResetEmail: (...args: unknown[]) => mockSendPasswordResetEmail(...args),
}));

vi.mock('@/lib/auth', () => ({
  hashPassword: vi.fn((pwd: string) => `scrypt_mock_${pwd}`),
  verifyPassword: vi.fn(),
}));

import { POST as handleRecover } from '@/app/api/auth/recover/route';
import { POST as handleResetPassword } from '@/app/api/auth/reset-password/route';
import { sendPasswordResetEmail } from '@/lib/email';

describe('Fluxo de Recuperação e Redefinição Segura de Senha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockReturnValue({ allowed: true, resetInSeconds: 0 });
  });

  describe('1. Solicitação de Recuperação (POST /api/auth/recover)', () => {
    it('gera token seguro de 32 bytes (64 hex chars), armazena hash SHA-256 e expira em 15 minutos', async () => {
      const now = Date.now();
      mockPrisma.userProfile.findFirst.mockResolvedValue({
        id: 'usr-valid-1',
        email: 'aluno@ctfl.com.br',
      });
      mockPrisma.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.passwordResetToken.create.mockResolvedValue({
        id: 'tok-id-1',
        email: 'aluno@ctfl.com.br',
        tokenHash: 'abc',
        expiresAt: new Date(now + 15 * 60 * 1000),
      });

      const req = new Request('http://localhost:3000/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'aluno@ctfl.com.br' }),
      });

      const res = await handleRecover(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Se o e-mail informado estiver cadastrado');

      // Invalida tokens anteriores
      expect(mockPrisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { email: 'aluno@ctfl.com.br' },
      });

      // Valida criação do token com expiração de 15 minutos
      expect(mockPrisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
      const createCall = mockPrisma.passwordResetToken.create.mock.calls[0][0];
      expect(createCall.data.email).toBe('aluno@ctfl.com.br');

      const expiresAt = new Date(createCall.data.expiresAt).getTime();
      const diffMinutes = (expiresAt - now) / (60 * 1000);
      expect(diffMinutes).toBeGreaterThanOrEqual(14.8);
      expect(diffMinutes).toBeLessThanOrEqual(15.2);

      // Valida que o token armazenado é um hash SHA-256 de 64 caracteres hex
      const storedHash = createCall.data.tokenHash;
      expect(storedHash).toMatch(/^[0-9a-f]{64}$/);

      // Valida que o e-mail foi disparado com o rawToken correspondente ao hash
      expect(mockSendPasswordResetEmail).toHaveBeenCalledTimes(1);
      const [emailSentTo, resetUrl] = mockSendPasswordResetEmail.mock.calls[0];
      expect(emailSentTo).toBe('aluno@ctfl.com.br');
      expect(resetUrl).toContain('/redefinir-senha?token=');

      const urlObj = new URL(resetUrl);
      const rawToken = urlObj.searchParams.get('token')!;
      expect(rawToken).toHaveLength(64); // 32 bytes hex = 64 chars

      // Confirma que SHA-256 do rawToken equivale ao tokenHash persistido
      const expectedHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      expect(expectedHash).toBe(storedHash);

      // Valida log de auditoria
      expect(mockLogAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: 'usr-valid-1',
          action: 'USER_PASSWORD_RESET_REQUESTED',
          entityType: 'UserProfile',
          entityId: 'usr-valid-1',
        })
      );
    });

    it('Hardening Anti-Enumeração: retorna HTTP 200 genérico sem vazar ausência de usuário', async () => {
      mockPrisma.userProfile.findFirst.mockResolvedValue(null);

      const req = new Request('http://localhost:3000/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'inexistente@ctfl.com.br' }),
      });

      const res = await handleRecover(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Se o e-mail informado estiver cadastrado');

      // Não deve persistir token nem enviar e-mail para usuário inexistente
      expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('rejeita formato de e-mail inválido com HTTP 400', async () => {
      const req = new Request('http://localhost:3000/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'email-invalido-sem-arroba' }),
      });

      const res = await handleRecover(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it('aplica rate-limit estrito retornando HTTP 429 quando limite de requisições estoura', async () => {
      mockCheckRateLimit.mockReturnValue({ allowed: false, resetInSeconds: 45 });

      const req = new Request('http://localhost:3000/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'aluno@ctfl.com.br' }),
      });

      const res = await handleRecover(req);
      expect(res.status).toBe(429);

      const json = await res.json();
      expect(json.error).toContain('Muitas solicitações');
    });
  });

  describe('2. Redefinição de Senha com Validação de Token (POST /api/auth/reset-password)', () => {
    it('rejeita tokens expirados (expiresAt < now) com HTTP 400', async () => {
      const rawToken = 'a'.repeat(64);
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      // Token expirado há 5 minutos
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'tok-exp-1',
        email: 'aluno@ctfl.com.br',
        tokenHash,
        expiresAt: new Date(Date.now() - 5 * 60 * 1000),
        usedAt: null,
      });

      const req = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: rawToken,
          newPassword: 'NovaSenhaForte123!',
        }),
      });

      const res = await handleResetPassword(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain('Link expirado ou já utilizado');

      // Não pode alterar usuário nem marcar token
      expect(mockPrisma.userProfile.update).not.toHaveBeenCalled();
      expect(mockPrisma.passwordResetToken.update).not.toHaveBeenCalled();
    });

    it('rejeita tokens já utilizados (usedAt !== null) com HTTP 400', async () => {
      const rawToken = 'b'.repeat(64);
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      // Token com usedAt preenchido
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'tok-used-1',
        email: 'aluno@ctfl.com.br',
        tokenHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        usedAt: new Date(Date.now() - 2 * 60 * 1000),
      });

      const req = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: rawToken,
          newPassword: 'OutraNovaSenhaForte456!',
        }),
      });

      const res = await handleResetPassword(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain('Link expirado ou já utilizado');

      // Não pode reatualizar senha
      expect(mockPrisma.userProfile.update).not.toHaveBeenCalled();
    });

    it('rejeita tokens não encontrados / hash divergente com HTTP 400', async () => {
      mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

      const req = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'token-completamente-falso',
          newPassword: 'NovaSenhaForte123!',
        }),
      });

      const res = await handleResetPassword(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain('Link expirado ou já utilizado');
    });

    it('rejeita requisição quando a nova senha é fraca (< 8 caracteres) com HTTP 400', async () => {
      const req = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'c'.repeat(64),
          newPassword: '123',
        }),
      });

      const res = await handleResetPassword(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it('conclui redefinição com sucesso: atualiza senha com hash seguro, invalida token e gera log de auditoria', async () => {
      const rawToken = 'd'.repeat(64);
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'tok-valid-1',
        email: 'aluno@ctfl.com.br',
        tokenHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // válido por mais 10 min
        usedAt: null,
      });

      mockPrisma.userProfile.findFirst.mockResolvedValue({
        id: 'usr-100',
        email: 'aluno@ctfl.com.br',
        deletedAt: null,
      });

      mockPrisma.userProfile.update.mockResolvedValue({ id: 'usr-100' });
      mockPrisma.passwordResetToken.update.mockResolvedValue({ id: 'tok-valid-1' });

      const req = new Request('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: rawToken,
          newPassword: 'NovaSenhaUltraSegura2026!',
        }),
      });

      const res = await handleResetPassword(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Senha redefinida com sucesso');

      // Verifica chamada atômica
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrisma.userProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'usr-100' },
          data: {
            passwordHash: 'scrypt_mock_NovaSenhaUltraSegura2026!',
          },
        })
      );
      expect(mockPrisma.passwordResetToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tok-valid-1' },
          data: expect.objectContaining({
            usedAt: expect.any(Date),
          }),
        })
      );

      // Verifica log de auditoria de conclusão
      expect(mockLogAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: 'usr-100',
          action: 'USER_PASSWORD_RESET_COMPLETED',
          entityType: 'UserProfile',
          entityId: 'usr-100',
        })
      );
    });
  });

  describe('3. Serviço de Notificação por E-mail (src/lib/email.ts)', () => {
    it('executa fallback gracioso em modo de desenvolvimento (sem RESEND_API_KEY)', async () => {
      const actualEmailModule = await vi.importActual<{
        sendPasswordResetEmail: typeof sendPasswordResetEmail;
      }>('@/lib/email');

      const originalApiKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await actualEmailModule.sendPasswordResetEmail(
        'teste.dev@ctfl.com.br',
        'http://localhost:3000/redefinir-senha?token=abc123mock'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('mock-dev-email');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEV MOCK EMAIL]')
      );

      consoleSpy.mockRestore();
      if (originalApiKey) process.env.RESEND_API_KEY = originalApiKey;
    });
  });
});
