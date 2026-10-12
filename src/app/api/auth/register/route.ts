import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rl = checkRateLimit(`register:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: `Muitas requisições. Tente novamente em ${rl.resetInSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message || 'Dados de cadastro inválidos.',
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { fullName, email, password } = parsed.data;

    const existing = await prisma.userProfile.findUnique({
      where: { email },
    });

    if (existing && !existing.deletedAt) {
      return NextResponse.json(
        { error: 'Este endereço de e-mail já está cadastrado.' },
        { status: 409 }
      );
    }

    const studentRole = await prisma.role.findUnique({
      where: { code: 'STUDENT' },
    });

    const passwordHash = hashPassword(password);

    const user = existing
      ? await prisma.userProfile.update({
          where: { id: existing.id },
          data: {
            fullName,
            passwordHash,
            role: 'STUDENT',
            roleId: studentRole?.id ?? null,
            deletedAt: null,
          },
        })
      : await prisma.userProfile.create({
          data: {
            email,
            fullName,
            passwordHash,
            role: 'STUDENT',
            roleId: studentRole?.id ?? null,
          },
        });

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    setSessionCookie(token);

    await logAuditEvent({
      actorId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'UserProfile',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress: ip,
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Auth Register] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar o cadastro.' },
      { status: 500 }
    );
  }
}
