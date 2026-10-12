import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AuthError } from '@/lib/auth';
import { createOrUpdateFlashcardSchema } from '@/lib/validations';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = createOrUpdateFlashcardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados do flashcard inválidos.' },
        { status: 400 }
      );
    }

    const fc = await prisma.flashcard.create({
      data: {
        chapterId: parsed.data.chapterId,
        topicId: parsed.data.topicId,
        front: parsed.data.front,
        back: parsed.data.back,
        tags: parsed.data.tags,
        difficulty: parsed.data.difficulty,
        isAuthorial: true,
        isPublished: parsed.data.isPublished,
      },
    });

    await logAuditEvent({
      actorId: admin.id,
      action: 'FLASHCARD_CREATED',
      entityType: 'Flashcard',
      entityId: fc.id,
    });

    return NextResponse.json({ flashcard: fc }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erro interno ao criar flashcard.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const id = String(body.id || '');
    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
    }

    const parsed = createOrUpdateFlashcardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados do flashcard inválidos.' },
        { status: 400 }
      );
    }

    const fc = await prisma.flashcard.update({
      where: { id },
      data: {
        chapterId: parsed.data.chapterId,
        topicId: parsed.data.topicId,
        front: parsed.data.front,
        back: parsed.data.back,
        tags: parsed.data.tags,
        difficulty: parsed.data.difficulty,
        isPublished: parsed.data.isPublished,
      },
    });

    await logAuditEvent({
      actorId: admin.id,
      action: 'FLASHCARD_UPDATED',
      entityType: 'Flashcard',
      entityId: fc.id,
    });

    return NextResponse.json({ flashcard: fc });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erro ao atualizar flashcard.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório.' }, { status: 400 });
    }

    await prisma.flashcard.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isPublished: false,
      },
    });

    await logAuditEvent({
      actorId: admin.id,
      action: 'FLASHCARD_DELETED',
      entityType: 'Flashcard',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Erro ao remover flashcard.' },
      { status: 500 }
    );
  }
}
