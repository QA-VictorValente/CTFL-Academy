import { NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/backend/middlewares/auth.middleware';
import { exerciseAnswerSchema } from '@/shared/validations';
import { processExerciseAnswer } from '@/backend/services/exercise.service';

export async function handleExerciseAnswer(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = exerciseAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados de resposta inválidos.' },
        { status: 400 }
      );
    }

    const result = await processExerciseAnswer({
      userId: user.id,
      questionId: parsed.data.questionId,
      selectedLabel: parsed.data.selectedLabel,
    });

    if ('notFound' in result && result.notFound) {
      return NextResponse.json(
        { error: 'Questão não encontrada ou não publicada.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Exercise Controller Error]:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar resposta do exercício.' },
      { status: 500 }
    );
  }
}
