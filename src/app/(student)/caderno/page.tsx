import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { NotebookHub } from '@/components/student/notebook-hub';
import { StudyNoteItem } from '@/types/notebook';

export const dynamic = 'force-dynamic';

export default async function CadernoPage() {
  const user = await requireAuth();

  const [rawNotes, chapters] = await Promise.all([
    prisma.studyNote.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      include: {
        chapter: {
          select: { id: true, number: true, title: true, slug: true },
        },
        topic: {
          select: { id: true, code: true, title: true, slug: true },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    }),
    prisma.chapter.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        title: true,
        topics: {
          where: { deletedAt: null },
          orderBy: { orderIndex: 'asc' },
          select: { id: true, code: true, title: true },
        },
      },
    }),
  ]);

  const notes: StudyNoteItem[] = rawNotes.map((n) => ({
    id: n.id,
    userId: n.userId,
    type: n.type as 'NOTE' | 'MINDMAP',
    title: n.title,
    content: n.content,
    mindMapData: (n.mindMapData as any) || null,
    color: n.color,
    tags: Array.isArray(n.tags) ? (n.tags as string[]) : [],
    chapterId: n.chapterId,
    topicId: n.topicId,
    chapter: n.chapter,
    topic: n.topic,
    isPinned: n.isPinned,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  }));

  return <NotebookHub initialNotes={notes} chapters={chapters} />;
}
