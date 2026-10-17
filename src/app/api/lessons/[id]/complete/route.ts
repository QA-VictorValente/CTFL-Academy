import { handleLessonComplete } from '@/backend/controllers/lesson.controller';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  return handleLessonComplete(req, params.id);
}
