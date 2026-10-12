import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import { flashcardReviewInputSchema } from '@/lib/validations';
import { computeNextFlashcardReview } from '@/lib/spaced-repetition';
import {
  awardXpAndRecordActivity,
  toDateKey,
  XP_RULES,
} from '@/lib/gamification';
import type { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = flashcardReviewInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados de revisão de flashcard inválidos.' },
        { status: 400 }
      );
    }

    const { flashcardId, rating } = parsed.data;
    const flashcard = await prisma.flashcard.findFirst({
      where: { id: flashcardId, deletedAt: null, isPublished: true },
    });

    if (!flashcard) {
      return NextResponse.json(
        { error: 'Flashcard não encontrado.' },
        { status: 404 }
      );
    }

    const existing = await prisma.flashcardReview.findUnique({
      where: {
        userId_flashcardId: {
          userId: user.id,
          flashcardId: flashcard.id,
        },
      },
    });

    const now = new Date();
    const srResult = computeNextFlashcardReview({
      rating,
      previousIntervalDays: existing?.intervalDays ?? 0,
      previousEaseFactor: existing?.easeFactor ?? 2.5,
      previousRepetitions: existing?.repetitions ?? 0,
      now,
    });

    const prevHistory = Array.isArray(existing?.reviewHistory)
      ? (existing.reviewHistory as Record<string, unknown>[])
      : [];

    const newHistoryEntry = {
      reviewedAt: now.toISOString(),
      rating,
      intervalDays: srResult.intervalDays,
      state: srResult.state,
    };

    const review = await prisma.flashcardReview.upsert({
      where: {
        userId_flashcardId: {
          userId: user.id,
          flashcardId: flashcard.id,
        },
      },
      update: {
        rating,
        state: srResult.state,
        intervalDays: srResult.intervalDays,
        easeFactor: srResult.easeFactor,
        repetitions: srResult.repetitions,
        reviewedAt: now,
        nextReviewAt: srResult.nextReviewAt,
        reviewHistory: [
          ...prevHistory.slice(-19),
          newHistoryEntry,
        ] as unknown as Prisma.InputJsonValue,
      },
      create: {
        userId: user.id,
        flashcardId: flashcard.id,
        rating,
        state: srResult.state,
        intervalDays: srResult.intervalDays,
        easeFactor: srResult.easeFactor,
        repetitions: srResult.repetitions,
        reviewedAt: now,
        nextReviewAt: srResult.nextReviewAt,
        reviewHistory: [newHistoryEntry] as unknown as Prisma.InputJsonValue,
      },
    });

    const dateKey = toDateKey(now);
    const xpRes = await awardXpAndRecordActivity({
      userId: user.id,
      eventType: 'FLASHCARD_REVIEWED',
      points: XP_RULES.FLASHCARD_REVIEWED,
      idempotencyKey: `fc:${user.id}:${flashcard.id}:${dateKey}`,
      activityType: 'FLASHCARD_REVIEW',
      description: `Flashcard revisado (${rating})`,
      referenceId: flashcard.id,
    });

    return NextResponse.json({
      review,
      xpAwarded: xpRes.pointsAdded,
      unlockedAchievements: xpRes.unlockedAchievements,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Flashcard Review] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao registrar revisão do flashcard.' },
      { status: 500 }
    );
  }
}
