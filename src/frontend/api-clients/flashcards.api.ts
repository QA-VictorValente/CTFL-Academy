import { apiFetch } from './client';

export interface FlashcardReviewResponse {
  review: {
    id: string;
    flashcardId: string;
    rating: string;
    state: string;
    intervalDays: number;
    repetitions: number;
  };
  xpAwarded: number;
  unlockedAchievements: string[];
}

export async function submitFlashcardReview(
  flashcardId: string,
  rating: 'EASY' | 'MEDIUM' | 'HARD'
): Promise<FlashcardReviewResponse> {
  return apiFetch<FlashcardReviewResponse>('/api/flashcards/review', {
    method: 'POST',
    body: JSON.stringify({ flashcardId, rating }),
  });
}

export async function resetFlashcardProgress(
  flashcardId: string
): Promise<{ success: boolean; message: string; flashcardId: string }> {
  return apiFetch<{ success: boolean; message: string; flashcardId: string }>(
    '/api/flashcards/reset',
    {
      method: 'POST',
      body: JSON.stringify({ flashcardId }),
    }
  );
}
