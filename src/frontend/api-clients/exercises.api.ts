import { apiFetch } from './client';

export interface ExerciseAnswerResponse {
  isCorrect: boolean;
  correctOptionLabel: string;
  explanation: string;
  referenceSection: string;
  options: {
    label: string;
    isCorrect: boolean;
    justification?: string | null;
  }[];
  xpAwarded: number;
  unlockedAchievements: string[];
}

export async function submitExerciseAnswer(
  questionId: string,
  selectedLabel: 'A' | 'B' | 'C' | 'D'
): Promise<ExerciseAnswerResponse> {
  return apiFetch<ExerciseAnswerResponse>('/api/exercises/answer', {
    method: 'POST',
    body: JSON.stringify({ questionId, selectedLabel }),
  });
}
