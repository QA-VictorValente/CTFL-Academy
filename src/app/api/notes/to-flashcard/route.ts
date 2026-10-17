import { handleConvertToFlashcard } from '@/backend/controllers/notes.controller';

export async function POST(req: Request) {
  return handleConvertToFlashcard(req);
}
