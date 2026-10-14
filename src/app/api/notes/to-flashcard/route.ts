import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();

    const { front, back, chapterId, topicId, tags = [] } = body;

    if (!front || !back) {
      return NextResponse.json(
        { error: 'Frente (pergunta/conceito) e verso (resposta) são obrigatórios.' },
        { status: 400 }
      );
    }

    // Se chapterId ou topicId não forem fornecidos, usar o primeiro tópico do capítulo 1 como padrão
    let targetChapterId = chapterId;
    let targetTopicId = topicId;

    if (!targetChapterId || !targetTopicId) {
      const defaultTopic = await prisma.topic.findFirst({
        where: { deletedAt: null },
        orderBy: { orderIndex: 'asc' },
      });
      if (defaultTopic) {
        targetChapterId = defaultTopic.chapterId;
        targetTopicId = defaultTopic.id;
      }
    }

    if (!targetChapterId || !targetTopicId) {
      return NextResponse.json(
        { error: 'Não foi possível associar um capítulo/tópico ao flashcard.' },
        { status: 400 }
      );
    }

    const cardTags = Array.isArray(tags) && tags.length > 0 ? tags : ['Caderno', 'Autoral'];

    const flashcard = await prisma.flashcard.create({
      data: {
        chapterId: targetChapterId,
        topicId: targetTopicId,
        front: front.trim(),
        back: back.trim(),
        tags: cardTags,
        difficulty: 'MEDIUM',
        isAuthorial: true,
        isPublished: true,
      },
      include: {
        chapter: { select: { number: true, title: true } },
        topic: { select: { code: true, title: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        flashcard,
        message: 'Flashcard gerado e adicionado à sua rotina de repetição espaçada!',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[API Notes to Flashcard] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar flashcard a partir da anotação.' },
      { status: 500 }
    );
  }
}
