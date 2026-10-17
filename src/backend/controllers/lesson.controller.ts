import { NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/backend/middlewares/auth.middleware';
import { completeLesson } from '@/backend/services/lesson.service';

export async function handleLessonComplete(
  _req: Request,
  lessonId: string
) {
  try {
    const user = await requireAuth();
    const result = await completeLesson(user.id, lessonId);

    if ('notFound' in result && result.notFound) {
      return NextResponse.json(
        { error: 'Aula não encontrada.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Lesson Complete Controller Error]:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar conclusão da aula.' },
      { status: 500 }
    );
  }
}
