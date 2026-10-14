import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth';
import { NoteType } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const typeParam = searchParams.get('type');
    const chapterId = searchParams.get('chapterId');
    const topicId = searchParams.get('topicId');
    const search = searchParams.get('search');

    const typeFilter =
      typeParam === 'NOTE'
        ? NoteType.NOTE
        : typeParam === 'MINDMAP'
        ? NoteType.MINDMAP
        : undefined;

    const notes = await prisma.studyNote.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
        ...(typeFilter ? { type: typeFilter } : {}),
        ...(chapterId ? { chapterId } : {}),
        ...(topicId ? { topicId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        chapter: { select: { id: true, number: true, title: true, slug: true } },
        topic: { select: { id: true, code: true, title: true, slug: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({ notes });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[API Notes GET] Erro:', error);
    return NextResponse.json({ error: 'Erro ao carregar anotações.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const {
      title,
      type = 'NOTE',
      content = '',
      mindMapData = null,
      color = '#6366f1',
      tags = [],
      chapterId = null,
      topicId = null,
    } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'O título da anotação ou mapa mental é obrigatório.' },
        { status: 400 }
      );
    }

    const noteType = type === 'MINDMAP' ? NoteType.MINDMAP : NoteType.NOTE;

    const note = await prisma.studyNote.create({
      data: {
        userId: user.id,
        type: noteType,
        title: title.trim(),
        content: content || '',
        mindMapData: mindMapData ?? undefined,
        color: color || '#6366f1',
        tags: Array.isArray(tags) ? tags : [],
        chapterId: chapterId || null,
        topicId: topicId || null,
      },
      include: {
        chapter: { select: { id: true, number: true, title: true, slug: true } },
        topic: { select: { id: true, code: true, title: true, slug: true } },
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[API Notes POST] Erro:', error);
    return NextResponse.json({ error: 'Erro ao criar anotação.' }, { status: 500 });
  }
}
