import {
  handleGetNoteById,
  handleUpdateNote,
  handleDeleteNote,
} from '@/backend/controllers/notes.controller';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  return handleGetNoteById(params.id);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  return handleUpdateNote(req, params.id);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  return handleDeleteNote(params.id);
}
