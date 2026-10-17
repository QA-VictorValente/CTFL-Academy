import { apiFetch } from './client';

export interface CompleteLessonResponse {
  success: boolean;
  lessonsCompleted: boolean;
  xpAwarded: number;
  unlockedAchievements: string[];
}

export async function markLessonComplete(
  lessonId: string
): Promise<CompleteLessonResponse> {
  return apiFetch<CompleteLessonResponse>(`/api/lessons/${lessonId}/complete`, {
    method: 'POST',
  });
}
