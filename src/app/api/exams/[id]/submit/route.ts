import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import { finalizeExamAttemptIdempotent } from '@/lib/exam-service';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'Tentativa não encontrada ou acesso negado.' },
        { status: 404 }
      );
    }

    const finalized = await finalizeExamAttemptIdempotent(attempt.id, user.id);

    return NextResponse.json({
      success: true,
      attemptId: finalized.id,
      status: finalized.status,
      scorePoints: finalized.scorePoints,
      correctCount: finalized.correctCount,
      wrongCount: finalized.wrongCount,
      unansweredCount: finalized.unansweredCount,
      accuracyPercent: finalized.accuracyPercent,
      passed: finalized.passed,
      timeSpentSeconds: finalized.timeSpentSeconds,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Submit Exam Attempt] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao finalizar simulado.' },
      { status: 500 }
    );
  }
}
