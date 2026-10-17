import { prisma } from '@/backend/db/prisma';

const CURRICULUM_TTL_MS = 60 * 1000; // 60 segundos

async function fetchPublishedChaptersFromDb() {
  return prisma.chapter.findMany({
    where: { isPublished: true, deletedAt: null },
    include: {
      topics: {
        where: { deletedAt: null },
        orderBy: { orderIndex: 'asc' },
      },
      _count: {
        select: {
          questions: { where: { status: 'PUBLISHED', deletedAt: null } },
          flashcards: { where: { isPublished: true, deletedAt: null } },
        },
      },
    },
    orderBy: { number: 'asc' },
  });
}

export type CachedChapters = Awaited<ReturnType<typeof fetchPublishedChaptersFromDb>>;

let curriculumCache: {
  data: CachedChapters;
  expiresAt: number;
} | null = null;

export function invalidateCurriculumCache() {
  curriculumCache = null;
}

export async function getCachedPublishedChapters(): Promise<CachedChapters> {
  if (curriculumCache && curriculumCache.expiresAt > Date.now()) {
    return curriculumCache.data;
  }

  const chapters = await fetchPublishedChaptersFromDb();

  curriculumCache = {
    data: chapters,
    expiresAt: Date.now() + CURRICULUM_TTL_MS,
  };

  return chapters;
}
