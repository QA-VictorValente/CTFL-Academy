import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rl = checkRateLimit(`reset-pwd:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: `Muitas solicitações. Aguarde ${rl.resetInSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
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

    const { token, newPassword } = parsed.data;
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    const now = new Date();
    if (!resetToken || resetToken.usedAt !== null || resetToken.expiresAt < now) {
      return NextResponse.json(
        { error: 'Link expirado ou já utilizado.' },
        { status: 400 }
      );
    }

    const user = await prisma.userProfile.findFirst({
      where: {
        email: resetToken.email,
        deletedAt: null,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo.' },
        { status: 400 }
      );
    }

    // Atualiza a senha e invalida o token atomicamente
    await prisma.$transaction([
      prisma.userProfile.update({
        where: { id: user.id },
        data: {
          passwordHash: hashPassword(newPassword),
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          usedAt: now,
        },
      }),
    ]);

    await logAuditEvent({
      actorId: user.id,
      action: 'USER_PASSWORD_RESET_COMPLETED',
      entityType: 'UserProfile',
      entityId: user.id,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode realizar o login com suas novas credenciais.',
    });
  } catch (error) {
    console.error('[Auth Reset Password] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao redefinir senha.' },
      { status: 500 }
    );
  }
}
