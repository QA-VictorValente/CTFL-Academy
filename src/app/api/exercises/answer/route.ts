import { handleExerciseAnswer } from '@/backend/controllers/exercise.controller';

export async function POST(req: Request) {
  return handleExerciseAnswer(req);
}
