import { describe, it, expect, vi } from 'vitest';
import { resolveNextQuestionStatus } from '@/backend/services/question-workflow.service';
import { computeNextFlashcardReview } from '@/backend/services/spaced-repetition.service';
import { calculateStudyStreak } from '@/backend/services/gamification.service';

describe('Backend Services Unit Tests — Lógica Pura', () => {
  it('gerencia transição editorial de questões de forma estrita', () => {
    // DRAFT -> SUBMIT_REVIEW -> IN_REVIEW
    const t1 = resolveNextQuestionStatus('DRAFT', 'SUBMIT_REVIEW');
    expect(t1.valid).toBe(true);
    expect(t1.nextStatus).toBe('IN_REVIEW');

    // DRAFT -> APPROVE (inválido, precisa passar por revisão primeiro)
    const t2 = resolveNextQuestionStatus('DRAFT', 'APPROVE');
    expect(t2.valid).toBe(false);
    expect(t2.error).toContain('Transição editorial inválida');
  });

  it('ajusta algoritmo SM-2 para cartão marcado como HARD', () => {
    const res = computeNextFlashcardReview({
      rating: 'HARD',
      previousIntervalDays: 14,
      previousEaseFactor: 2.5,
      previousRepetitions: 5,
    });

    expect(res.intervalDays).toBe(1);
    expect(res.repetitions).toBe(1);
    expect(res.state).toBe('LEARNING');
    expect(res.easeFactor).toBe(2.3); // 2.5 - 0.2
  });

  it('calcula streak corretamente no mesmo dia (sem duplicar)', () => {
    const now = new Date('2026-10-16T15:00:00Z');
    const earlierToday = new Date('2026-10-16T08:00:00Z');

    const streak = calculateStudyStreak(earlierToday, now, 5, 10);
    expect(streak.newStreak).toBe(5);
    expect(streak.newLongestStreak).toBe(10);
  });

  it('incrementa streak em dias consecutivos', () => {
    const now = new Date('2026-10-16T15:00:00Z');
    const yesterday = new Date('2026-10-15T15:00:00Z');

    const streak = calculateStudyStreak(yesterday, now, 5, 10);
    expect(streak.newStreak).toBe(6);
    expect(streak.newLongestStreak).toBe(10);
  });
});
