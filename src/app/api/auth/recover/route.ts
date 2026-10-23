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
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: firstIssue?.message || 'Dados inválidos.',
          field: firstIssue?.path?.[0] || null,
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

    if (newPassword) {
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
