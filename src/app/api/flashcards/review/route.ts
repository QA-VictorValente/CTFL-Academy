import {
  handleFlashcardReview,
  handleFlashcardReset,
} from '@/backend/controllers/flashcard.controller';

export async function POST(req: Request) {
  return handleFlashcardReview(req);
}

export async function DELETE(req: Request) {
  return handleFlashcardReset(req);
}
