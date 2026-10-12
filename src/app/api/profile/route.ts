import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAuth,
  clearSessionCookie,
  AuthError,
} from '@/lib/auth';
import {
  updateProfileSchema,
  deleteAccountSchema,
} from '@/lib/validations';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            'Dados de preferências inválidos.',
        },
        { status: 400 }
      );
    }

    const updated = await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        fullName: parsed.data.fullName,
        preferredTheme: parsed.data.preferredTheme,
        dailyGoalMinutes: parsed.data.dailyGoalMinutes,
        nonNativeLanguageBonus: parsed.data.nonNativeLanguageBonus,
      },
    });

    await logAuditEvent({
      actorId: user.id,
      action: 'USER_PROFILE_UPDATED',
      entityType: 'UserProfile',
      entityId: user.id,
      details: {
        dailyGoalMinutes: updated.dailyGoalMinutes,
        nonNativeLanguageBonus: updated.nonNativeLanguageBonus,
      },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        preferredTheme: updated.preferredTheme,
        dailyGoalMinutes: updated.dailyGoalMinutes,
        nonNativeLanguageBonus: updated.nonNativeLanguageBonus,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Profile PUT] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar preferências.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = deleteAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            'Confirmação de exclusão inválida.',
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Remove dados pessoais vinculados ao estudante e anonimiza/exclui logicamente o perfil
      await tx.examAttempt.deleteMany({ where: { userId: user.id } });
      await tx.userAnswer.deleteMany({ where: { userId: user.id } });
      await tx.flashcardReview.deleteMany({ where: { userId: user.id } });
      await tx.topicProgress.deleteMany({ where: { userId: user.id } });
      await tx.userAchievement.deleteMany({ where: { userId: user.id } });
      await tx.xPEvent.deleteMany({ where: { userId: user.id } });
      await tx.studyActivity.deleteMany({ where: { userId: user.id } });

      await tx.userProfile.update({
        where: { id: user.id },
        data: {
          email: `deleted-${user.id}@anonymized.local`,
          fullName: 'Conta Excluída',
          passwordHash: null,
          supabaseUserId: null,
          deletedAt: new Date(),
        },
      });
    });

    clearSessionCookie();

    await logAuditEvent({
      actorId: null,
      action: 'USER_ACCOUNT_DELETED',
      entityType: 'UserProfile',
      entityId: user.id,
      details: { anonymized: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Profile DELETE] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao excluir conta.' },
      { status: 500 }
    );
  }
}
