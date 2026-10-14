import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const note = await prisma.studyNote.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        chapter: { select: { id: true, number: true, title: true, slug: true } },
        topic: { select: { id: true, code: true, title: true, slug: true } },
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Anotação ou mapa mental não encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ note });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[API Note GET] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar item.' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const existing = await prisma.studyNote.findFirst({
      where: { id: params.id, userId: user.id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Anotação não encontrada.' },
        { status: 404 }
      );
    }

    const {
      title,
      content,
      mindMapData,
      color,
      tags,
      isPinned,
      chapterId,
      topicId,
    } = body;

    const updated = await prisma.studyNote.update({
      where: { id: existing.id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(mindMapData !== undefined ? { mindMapData } : {}),
        ...(color !== undefined ? { color } : {}),
        ...(tags !== undefined ? { tags: Array.isArray(tags) ? tags : [] } : {}),
        ...(isPinned !== undefined ? { isPinned: Boolean(isPinned) } : {}),
        ...(chapterId !== undefined ? { chapterId: chapterId || null } : {}),
        ...(topicId !== undefined ? { topicId: topicId || null } : {}),
      },
      include: {
        chapter: { select: { id: true, number: true, title: true, slug: true } },
        topic: { select: { id: true, code: true, title: true, slug: true } },
      },
    });

    return NextResponse.json({ note: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[API Note PUT] Erro:', error);
    return NextResponse.json({ error: 'Erro ao atualizar item.' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const existing = await prisma.studyNote.findFirst({
      where: { id: params.id, userId: user.id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Anotação não encontrada.' },
        { status: 404 }
      );
    }

    await prisma.studyNote.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Item arquivado.' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[API Note DELETE] Erro:', error);
    return NextResponse.json({ error: 'Erro ao excluir item.' }, { status: 500 });
  }
}
