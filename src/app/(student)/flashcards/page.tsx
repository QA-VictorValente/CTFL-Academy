import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { FlashcardsStudy } from '@/components/student/flashcards-study';

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: { chapterId?: string };
}) {
  const user = await requireAuth();

  const [chapters, flashcards, reviews] = await Promise.all([
    prisma.chapter.findMany({
      where: { isPublished: true, deletedAt: null },
      select: { id: true, number: true, title: true },
      orderBy: { number: 'asc' },
    }),
    prisma.flashcard.findMany({
      where: { isPublished: true, deletedAt: null },
      include: {
        chapter: { select: { id: true, number: true, title: true } },
        topic: { select: { id: true, code: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.flashcardReview.findMany({
      where: { userId: user.id },
    }),
  ]);

  const reviewMap = new Map(reviews.map((r) => [r.flashcardId, r]));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="default">Memorização Ativa & Repetição Espaçada</Badge>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Flashcards CTFL 4.0.1
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Estude os conceitos, definições e fórmulas do Syllabus usando nosso
          algoritmo de repetição espaçada. Classifique cada cartão como Fácil,
          Médio ou Difícil para agendar automaticamente sua próxima revisão.
        </p>
      </div>

      <FlashcardsStudy
        chapters={chapters}
        initialChapterId={searchParams.chapterId}
        flashcards={flashcards.map((fc) => {
          const rev = reviewMap.get(fc.id);
          return {
            id: fc.id,
            chapterId: fc.chapterId,
            chapterNumber: fc.chapter.number,
            chapterTitle: fc.chapter.title,
            topicId: fc.topicId,
            topicCode: fc.topic.code,
            front: fc.front,
            back: fc.back,
            tags: Array.isArray(fc.tags) ? (fc.tags as string[]) : [],
            difficulty: fc.difficulty,
            review: rev
              ? {
                  rating: rev.rating,
                  state: rev.state,
                  intervalDays: rev.intervalDays,
                  repetitions: rev.repetitions,
                  reviewedAt: rev.reviewedAt.toISOString(),
                  nextReviewAt: rev.nextReviewAt.toISOString(),
                }
              : null,
          };
        })}
      />
    </div>
  );
}
