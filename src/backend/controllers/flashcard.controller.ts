import { NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/backend/middlewares/auth.middleware';
import { flashcardReviewInputSchema } from '@/shared/validations';
import {
  reviewFlashcard,
  resetFlashcardReview,
} from '@/backend/services/flashcard.service';
import { z } from 'zod';

const resetInputSchema = z.object({
  flashcardId: z.string().min(1, 'ID do flashcard obrigatório.'),
});

export async function handleFlashcardReview(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = flashcardReviewInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados de revisão de flashcard inválidos.' },
        { status: 400 }
      );
    }

    const result = await reviewFlashcard({
      userId: user.id,
      flashcardId: parsed.data.flashcardId,
      rating: parsed.data.rating,
    });

    if ('notFound' in result && result.notFound) {
      return NextResponse.json(
        { error: 'Flashcard não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Flashcard Review Controller Error]:', error);
    return NextResponse.json(
      { error: 'Erro interno ao registrar revisão do flashcard.' },
      { status: 500 }
    );
  }
}

export async function handleFlashcardReset(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    let flashcardId = searchParams.get('flashcardId');

    if (!flashcardId) {
      try {
        const body = await req.json();
        const parsed = resetInputSchema.safeParse(body);
        if (parsed.success) {
          flashcardId = parsed.data.flashcardId;
        }
      } catch {
        // sem body json
      }
    }

    if (!flashcardId) {
      return NextResponse.json(
        { error: 'flashcardId é obrigatório.' },
        { status: 400 }
      );
    }

    const result = await resetFlashcardReview(user.id, flashcardId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Flashcard Reset Controller Error]:', error);
    return NextResponse.json(
      { error: 'Erro interno ao redefinir flashcard.' },
      { status: 500 }
    );
  }
}
