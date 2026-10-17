import { handleFlashcardReset } from '@/backend/controllers/flashcard.controller';

export async function POST(req: Request) {
  return handleFlashcardReset(req);
}
