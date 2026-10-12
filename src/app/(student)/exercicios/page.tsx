import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { ExercisesHub } from '@/components/student/exercises-hub';

export default async function ExerciciosPage({
  searchParams,
}: {
  searchParams: { chapterId?: string };
}) {
  await requireAuth();

  const [chapters, questions] = await Promise.all([
    prisma.chapter.findMany({
      where: { isPublished: true, deletedAt: null },
      select: { id: true, number: true, title: true },
      orderBy: { number: 'asc' },
    }),
    prisma.question.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, isExercise: true },
      include: {
        chapter: { select: { id: true, number: true, title: true } },
        topic: { select: { id: true, code: true, title: true } },
        options: { orderBy: { orderIndex: 'asc' } },
      },
      orderBy: { code: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="default">Prática Dirigida com Feedback Imediato</Badge>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Exercícios de Fixação
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Pratique questões por capítulo, nível cognitivo (K1, K2, K3) e
          dificuldade. Ao responder, você recebe imediatamente a correção, a
          explicação técnica e a justificativa de cada alternativa.
        </p>
      </div>

      <ExercisesHub
        chapters={chapters}
        initialChapterId={searchParams.chapterId}
        questions={questions.map((q) => ({
          id: q.id,
          code: q.code,
          statement: q.statement,
          chapterId: q.chapterId,
          chapterNumber: q.chapter.number,
          chapterTitle: q.chapter.title,
          topicId: q.topicId,
          topicCode: q.topic.code,
          topicTitle: q.topic.title,
          learningObjectiveCode: q.learningObjectiveCode,
          cognitiveLevel: q.cognitiveLevel,
          difficulty: q.difficulty,
          options: q.options.map((o) => ({
            label: o.label,
            content: o.content,
          })),
        }))}
      />
    </div>
  );
}
