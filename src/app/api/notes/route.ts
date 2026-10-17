import {
  handleGetNotes,
  handleCreateNote,
} from '@/backend/controllers/notes.controller';

export async function GET(req: Request) {
  return handleGetNotes(req);
}

export async function POST(req: Request) {
  return handleCreateNote(req);
}
