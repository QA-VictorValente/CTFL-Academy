import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { recoverPasswordSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';

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
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message || 'Dados inválidos.',
        },
        { status: 400 }
      );
    }

    const { email, newPassword } = parsed.data;
    const user = await prisma.userProfile.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    // No modo local compatível, permite redefinir senha quando informada
    if (user && newPassword) {
      await prisma.userProfile.update({
        where: { id: user.id },
        data: {
          passwordHash: hashPassword(newPassword),
        },
      });
      await logAuditEvent({
        actorId: user.id,
        action: 'USER_PASSWORD_RECOVERED',
        entityType: 'UserProfile',
        entityId: user.id,
        ipAddress: ip,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        'Se o endereço de e-mail estiver cadastrado, o procedimento de recuperação de acesso foi processado com sucesso.',
    });
  } catch (error) {
    console.error('[Auth Recover] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar recuperação de acesso.' },
      { status: 500 }
    );
  }
}
