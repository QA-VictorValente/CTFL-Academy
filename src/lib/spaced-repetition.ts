import type { FlashcardRating, FlashcardReviewState } from '@prisma/client';

export interface SpacedRepetitionInput {
  rating: FlashcardRating;
  previousIntervalDays: number;
  previousEaseFactor: number;
  previousRepetitions: number;
  now?: Date;
}

export interface SpacedRepetitionResult {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  state: FlashcardReviewState;
  nextReviewAt: Date;
}

/**
 * Algoritmo determinístico de repetição espaçada (inspirado no SM-2 simplificado):
 * - HARD (Difícil): Reinicia repetições para 1, intervalo de 1 dia, reduz easeFactor (-0.2, mínimo 1.3), estado LEARNING.
 * - MEDIUM (Médio): Mantém easeFactor, incrementa repetições, intervalo de 1 -> 2 -> round(interval * 1.4), estado REVIEW.
 * - EASY (Fácil): Aumenta easeFactor (+0.15, máximo 3.0), incrementa repetições, intervalo de 2 -> 5 -> round(interval * easeFactor), estado MASTERED quando >= 7 dias.
 */
export function computeNextFlashcardReview(
  input: SpacedRepetitionInput
): SpacedRepetitionResult {
  const now = input.now ?? new Date();
  let easeFactor = input.previousEaseFactor || 2.5;
  let repetitions = input.previousRepetitions || 0;
  let intervalDays = input.previousIntervalDays || 0;
  let state: FlashcardReviewState = 'LEARNING';

  if (input.rating === 'HARD') {
    repetitions = 1;
    intervalDays = 1;
    easeFactor = Math.max(1.3, Number((easeFactor - 0.2).toFixed(2)));
    state = 'LEARNING';
  } else if (input.rating === 'MEDIUM') {
    repetitions += 1;
    if (repetitions === 1) {
      intervalDays = 1;
    } else if (repetitions === 2) {
      intervalDays = 3;
    } else {
      intervalDays = Math.max(3, Math.round(intervalDays * 1.5));
    }
    state = intervalDays >= 10 ? 'MASTERED' : 'REVIEW';
  } else {
    // EASY
    repetitions += 1;
    easeFactor = Math.min(3.0, Number((easeFactor + 0.15).toFixed(2)));
    if (repetitions === 1) {
      intervalDays = 3;
    } else if (repetitions === 2) {
      intervalDays = 7;
    } else {
      intervalDays = Math.max(7, Math.round(intervalDays * easeFactor));
    }
    state = intervalDays >= 7 ? 'MASTERED' : 'REVIEW';
  }

  const nextReviewAt = new Date(
    now.getTime() + intervalDays * 24 * 60 * 60 * 1000
  );

  return {
    intervalDays,
    easeFactor,
    repetitions,
    state,
    nextReviewAt,
  };
}
