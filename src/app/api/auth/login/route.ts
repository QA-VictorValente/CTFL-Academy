import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyPassword,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const isLocal = ip === 'local' || ip.startsWith('127.0.0.') || ip === '::1';
    const rl = checkRateLimit(`login:${ip}`, 15, 60_000);
    if (!rl.allowed && !isLocal) {
      return NextResponse.json(
        {
          error: `Muitas tentativas de login. Aguarde ${rl.resetInSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          error: firstIssue?.message || 'Dados de login inválidos.',
          field: firstIssue?.path?.[0] || null,
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.userProfile.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            'E-mail não cadastrado. Verifique o e-mail digitado ou crie uma conta.',
          field: 'email',
        },
        { status: 404 }
      );
    }

    if (user.deletedAt) {
      return NextResponse.json(
        {
          error: 'Esta conta foi excluída ou desativada.',
          field: 'email',
        },
        { status: 403 }
      );
    }

    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        {
          error:
            'Senha incorreta. Verifique sua senha ou clique em "Esqueceu a senha?".',
          field: 'password',
        },
        { status: 401 }
      );
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    setSessionCookie(token);

    await logAuditEvent({
      actorId: user.id,
      action: 'USER_LOGIN',
      entityType: 'UserProfile',
      entityId: user.id,
      details: { role: user.role },
      ipAddress: ip,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Auth Login] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao realizar o login.' },
      { status: 500 }
    );
  }
}
