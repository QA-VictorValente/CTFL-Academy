import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recoverPasswordSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rl = checkRateLimit(`recover:${ip}`, 8, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: `Muitas solicitações. Aguarde ${rl.resetInSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = recoverPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: firstIssue?.message || 'Dados inválidos.',
          field: firstIssue?.path?.[0] || null,
        },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const user = await prisma.userProfile.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    // Hardening contra enumeração de usuários (OWASP Top 10):
    // Não diferencia e-mails existentes de inexistentes com status 404.
    // Retorna HTTP 200 uniforme para prevenir discovery de contas cadastradas.
    const genericSuccessMessage =
      'Se o e-mail informado estiver cadastrado, as instruções para redefinição foram processadas com sucesso.';

    if (!user) {
      return NextResponse.json({
        success: true,
        message: genericSuccessMessage,
      });
    }

    // Gera token criptográfico seguro de 32 bytes (64 caracteres hex)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Remove tokens pendentes anteriores deste e-mail para manter apenas o mais recente ativo
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        tokenHash,
        expiresAt,
      },
    });

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const origin =
      req.headers.get('origin') ||
      (host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    const resetUrl = `${origin}/redefinir-senha?token=${rawToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    await logAuditEvent({
      actorId: user.id,
      action: 'USER_PASSWORD_RESET_REQUESTED',
      entityType: 'UserProfile',
      entityId: user.id,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      message: genericSuccessMessage,
    });
  } catch (error) {
    console.error('[Auth Recover] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar recuperação de acesso.' },
      { status: 500 }
    );
  }
}
