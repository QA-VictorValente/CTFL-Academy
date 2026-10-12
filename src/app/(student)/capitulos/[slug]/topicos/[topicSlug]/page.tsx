import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LessonViewer } from '@/components/student/lesson-viewer';

export default async function TopicLessonPage({
  params,
}: {
  params: { slug: string; topicSlug: string };
}) {
  const user = await requireAuth();

  const chapter = await prisma.chapter.findFirst({
    where: { slug: params.slug, isPublished: true, deletedAt: null },
    include: {
      topics: {
        where: { deletedAt: null },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!chapter) {
    notFound();
  }

  const topic = await prisma.topic.findFirst({
    where: {
      chapterId: chapter.id,
      slug: params.topicSlug,
      deletedAt: null,
    },
    include: {
      lessons: {
        where: { deletedAt: null, isPublished: true },
        orderBy: { orderIndex: 'asc' },
      },
      questions: {
        where: { status: 'PUBLISHED', deletedAt: null },
        include: {
          options: { orderBy: { orderIndex: 'asc' } },
        },
        orderBy: { code: 'asc' },
      },
    },
  });

  if (!topic || topic.lessons.length === 0) {
    notFound();
  }

  const topicProgress = await prisma.topicProgress.findUnique({
    where: {
      userId_topicId: {
        userId: user.id,
        topicId: topic.id,
      },
    },
  });

  const completedLessonIds: string[] = Array.isArray(
    topicProgress?.completedLessonIds
  )
    ? (topicProgress?.completedLessonIds as string[])
    : [];

  const currentIdx = chapter.topics.findIndex((t) => t.id === topic.id);
  const prevTopic = currentIdx > 0 ? chapter.topics[currentIdx - 1] : null;
  const nextTopic =
    currentIdx >= 0 && currentIdx < chapter.topics.length - 1
      ? chapter.topics[currentIdx + 1]
      : null;

  const primaryLesson = topic.lessons[0];
  const definitions = Array.isArray(primaryLesson.definitions)
    ? (primaryLesson.definitions as unknown as {
        term: string;
        definition: string;
      }[])
    : [];

  return (
    <div className="space-y-8">
      {/* Navegação Superior */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/capitulos/${chapter.slug}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Capítulo {chapter.number}: {chapter.title}
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/flashcards?chapterId=${chapter.id}&topicId=${topic.id}`}>
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4" />
              Flashcards do Tópico {topic.code}
            </Button>
          </Link>
        </div>
      </div>

      {/* Cabeçalho do Tópico */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">Capítulo {chapter.number}</Badge>
          <Badge variant="outline">Tópico {topic.code}</Badge>
          <Badge variant="purple">Nível Cognitivo Máx: {topic.kLevelMax}</Badge>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {topic.title}
        </h1>
      </div>

      {/* Visualizador da Aula e Exercícios do Tópico */}
      <LessonViewer
        lesson={{
          id: primaryLesson.id,
          slug: primaryLesson.slug,
          title: primaryLesson.title,
          explanation: primaryLesson.explanation,
          definitions,
          practicalExamples: primaryLesson.practicalExamples,
          qaRoutineExamples: primaryLesson.qaRoutineExamples,
          summary: primaryLesson.summary,
          estimatedMinutes: primaryLesson.estimatedMinutes,
          isCompleted: completedLessonIds.includes(primaryLesson.id),
        }}
        exercises={topic.questions.map((q) => ({
          id: q.id,
          code: q.code,
          statement: q.statement,
          learningObjectiveCode: q.learningObjectiveCode,
          cognitiveLevel: q.cognitiveLevel,
          difficulty: q.difficulty,
          options: q.options.map((o) => ({
            label: o.label,
            content: o.content,
          })),
        }))}
      />

      {/* Navegação entre Tópicos */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6">
        {prevTopic ? (
          <Link href={`/capitulos/${chapter.slug}/topicos/${prevTopic.slug}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Anterior: {prevTopic.title}
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextTopic ? (
          <Link href={`/capitulos/${chapter.slug}/topicos/${nextTopic.slug}`}>
            <Button>
              Próximo Tópico: {nextTopic.title}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link href={`/simulados?chapterId=${chapter.id}`}>
            <Button>
              Realizar Simulado do Capítulo {chapter.number}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
