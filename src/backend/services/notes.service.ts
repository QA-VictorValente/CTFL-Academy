import { prisma } from '@/backend/db/prisma';
import { NoteType } from '@prisma/client';

export interface NoteFilters {
  type?: 'NOTE' | 'MINDMAP';
  chapterId?: string | null;
  topicId?: string | null;
  search?: string | null;
}

export interface CreateNoteInput {
  title: string;
  type?: 'NOTE' | 'MINDMAP';
  content?: string;
  mindMapData?: unknown;
  color?: string;
  tags?: string[];
  chapterId?: string | null;
  topicId?: string | null;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  mindMapData?: unknown;
  color?: string;
  tags?: string[];
  isPinned?: boolean;
  chapterId?: string | null;
  topicId?: string | null;
}

export async function findUserNotes(userId: string, filters: NoteFilters = {}) {
  const typeFilter =
    filters.type === 'NOTE'
      ? NoteType.NOTE
      : filters.type === 'MINDMAP'
      ? NoteType.MINDMAP
      : undefined;

  return prisma.studyNote.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(filters.chapterId ? { chapterId: filters.chapterId } : {}),
      ...(filters.topicId ? { topicId: filters.topicId } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { content: { contains: filters.search, mode: 'insensitive' } },
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
}

export async function findUserNoteById(userId: string, noteId: string) {
  return prisma.studyNote.findFirst({
    where: {
      id: noteId,
      userId,
      deletedAt: null,
    },
    include: {
      chapter: { select: { id: true, number: true, title: true, slug: true } },
      topic: { select: { id: true, code: true, title: true, slug: true } },
    },
  });
}

export async function createUserNote(userId: string, input: CreateNoteInput) {
  const noteType = input.type === 'MINDMAP' ? NoteType.MINDMAP : NoteType.NOTE;

  return prisma.studyNote.create({
    data: {
      userId,
      type: noteType,
      title: input.title.trim(),
      content: input.content || '',
      mindMapData: (input.mindMapData as any) ?? undefined,
      color: input.color || '#6366f1',
      tags: Array.isArray(input.tags) ? input.tags : [],
      chapterId: input.chapterId || null,
      topicId: input.topicId || null,
    },
    include: {
      chapter: { select: { id: true, number: true, title: true, slug: true } },
      topic: { select: { id: true, code: true, title: true, slug: true } },
    },
  });
}

export async function updateUserNote(
  userId: string,
  noteId: string,
  input: UpdateNoteInput
) {
  const existing = await findUserNoteById(userId, noteId);
  if (!existing) {
    return null;
  }

  return prisma.studyNote.update({
    where: { id: existing.id },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.mindMapData !== undefined ? { mindMapData: input.mindMapData as any } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.tags !== undefined ? { tags: Array.isArray(input.tags) ? input.tags : [] } : {}),
      ...(input.isPinned !== undefined ? { isPinned: Boolean(input.isPinned) } : {}),
      ...(input.chapterId !== undefined ? { chapterId: input.chapterId || null } : {}),
      ...(input.topicId !== undefined ? { topicId: input.topicId || null } : {}),
    },
    include: {
      chapter: { select: { id: true, number: true, title: true, slug: true } },
      topic: { select: { id: true, code: true, title: true, slug: true } },
    },
  });
}

export async function deleteUserNote(userId: string, noteId: string) {
  const existing = await findUserNoteById(userId, noteId);
  if (!existing) {
    return false;
  }

  await prisma.studyNote.update({
    where: { id: existing.id },
    data: { deletedAt: new Date() },
  });
  return true;
}

export async function convertNoteToFlashcard(input: {
  front: string;
  back: string;
  chapterId?: string | null;
  topicId?: string | null;
  tags?: string[];
}) {
  let targetChapterId = input.chapterId;
  let targetTopicId = input.topicId;

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
    throw new Error('Não foi possível associar um capítulo/tópico ao flashcard.');
  }

  const cardTags =
    Array.isArray(input.tags) && input.tags.length > 0
      ? input.tags
      : ['Caderno', 'Autoral'];

  return prisma.flashcard.create({
    data: {
      chapterId: targetChapterId,
      topicId: targetTopicId,
      front: input.front.trim(),
      back: input.back.trim(),
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
}
