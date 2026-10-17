import { prisma } from '@/backend/db/prisma';
import { computeNextFlashcardReview } from '@/backend/services/spaced-repetition.service';
import {
  awardXpAndRecordActivity,
  toDateKey,
  XP_RULES,
} from '@/backend/services/gamification.service';
import type { FlashcardRating, Prisma } from '@prisma/client';

export async function reviewFlashcard(params: {
  userId: string;
  flashcardId: string;
  rating: FlashcardRating;
}) {
  const { userId, flashcardId, rating } = params;

  const flashcard = await prisma.flashcard.findFirst({
    where: { id: flashcardId, deletedAt: null, isPublished: true },
  });

  if (!flashcard) {
    return { notFound: true };
  }

  const existing = await prisma.flashcardReview.findUnique({
    where: {
      userId_flashcardId: {
        userId,
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
        userId,
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
      userId,
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
    userId,
    eventType: 'FLASHCARD_REVIEWED',
    points: XP_RULES.FLASHCARD_REVIEWED,
    idempotencyKey: `fc:${userId}:${flashcard.id}:${dateKey}`,
    activityType: 'FLASHCARD_REVIEW',
    description: `Flashcard revisado (${rating})`,
    referenceId: flashcard.id,
  });

  return {
    review,
    xpAwarded: xpRes.pointsAdded,
    unlockedAchievements: xpRes.unlockedAchievements,
  };
}

export async function resetFlashcardReview(userId: string, flashcardId: string) {
  await prisma.flashcardReview.deleteMany({
    where: {
      userId,
      flashcardId,
    },
  });

  return {
    success: true,
    message: 'Cartão redefinido para Novo com sucesso.',
    flashcardId,
  };
}
