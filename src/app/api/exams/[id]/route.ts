import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import {
  calculateServerTimer,
  type ShuffledOptionSnapshot,
} from '@/lib/exam-engine';
import { finalizeExamAttemptIdempotent } from '@/lib/exam-service';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    let attempt = await prisma.examAttempt.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        examQuestions: {
          orderBy: { orderIndex: 'asc' },
          include: { userAnswer: true },
        },
        configuration: true,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'Tentativa não encontrada ou acesso não autorizado.' },
        { status: 404 }
      );
    }

    const now = new Date();
    const timer = calculateServerTimer(attempt.startedAt, attempt.expiresAt, now);

    if (attempt.status === 'IN_PROGRESS' && timer.isExpired) {
      attempt = await finalizeExamAttemptIdempotent(attempt.id, user.id);
    }

    const isFinished =
      attempt.status === 'COMPLETED' || attempt.status === 'EXPIRED';

    const sanitizedQuestions = attempt.examQuestions.map((eq) => {
      const rawOptions = Array.isArray(eq.optionsSnapshot)
        ? (eq.optionsSnapshot as unknown as ShuffledOptionSnapshot[])
        : [];

      return {
        id: eq.id,
        questionId: eq.questionId,
        orderIndex: eq.orderIndex,
        statement: eq.statementSnapshot,
        chapterNumber: eq.chapterNumberSnapshot,
        topicCode: eq.topicCodeSnapshot,
        learningObjective: eq.learningObjectiveSnapshot,
        cognitiveLevel: eq.cognitiveLevelSnapshot,
        difficulty: eq.difficultySnapshot,
        markedForReview: eq.markedForReview,
        selectedLabel: eq.userAnswer?.selectedLabel ?? null,
        // Gabarito e explicações só são expostos após a finalização da prova
        correctDisplayLabel: isFinished ? eq.correctDisplayLabel : undefined,
        explanation: isFinished ? eq.explanationSnapshot : undefined,
        options: rawOptions.map((opt) => ({
          displayLabel: opt.displayLabel,
          content: opt.content,
          isCorrect: isFinished ? opt.isCorrect : undefined,
          justification: isFinished ? opt.justification : undefined,
        })),
      };
    });

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        title: attempt.title,
        mode: attempt.mode,
        status: attempt.status,
        totalQuestions: attempt.totalQuestions,
        durationSeconds: attempt.durationSeconds,
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt,
        completedAt: attempt.completedAt,
        timeSpentSeconds: attempt.timeSpentSeconds,
        remainingSeconds: isFinished ? 0 : timer.remainingSeconds,
        scorePoints: isFinished ? attempt.scorePoints : undefined,
        correctCount: isFinished ? attempt.correctCount : undefined,
        wrongCount: isFinished ? attempt.wrongCount : undefined,
        unansweredCount: isFinished ? attempt.unansweredCount : undefined,
        accuracyPercent: isFinished ? attempt.accuracyPercent : undefined,
        passed: isFinished ? attempt.passed : undefined,
        usedRepeatedQuestions: attempt.usedRepeatedQuestions,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Get Exam Attempt] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao consultar simulado.' },
      { status: 500 }
    );
  }
}
