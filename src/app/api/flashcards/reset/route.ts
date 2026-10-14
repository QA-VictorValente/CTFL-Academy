import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import { z } from 'zod';

const resetInputSchema = z.object({
  flashcardId: z.string().min(1, 'ID do flashcard obrigatório.'),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = resetInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'ID do flashcard inválido.' },
        { status: 400 }
      );
    }

    const { flashcardId } = parsed.data;

    // Remove o registro de revisão do usuário para este flashcard
    await prisma.flashcardReview.deleteMany({
      where: {
        userId: user.id,
        flashcardId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cartão redefinido para Novo com sucesso.',
      flashcardId,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Flashcard Reset] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao redefinir flashcard.' },
      { status: 500 }
    );
  }
}
