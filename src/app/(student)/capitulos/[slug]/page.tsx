import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  CheckSquare,
  Target,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LearningObjectiveEntry {
  code: string;
  kLevel: string;
  description: string;
}

export default async function CapituloDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await requireAuth();

  const chapter = await prisma.chapter.findFirst({
    where: { slug: params.slug, isPublished: true, deletedAt: null },
    include: {
      topics: {
        where: { deletedAt: null },
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            where: { deletedAt: null, isPublished: true },
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
      _count: {
        select: {
          questions: { where: { status: 'PUBLISHED', deletedAt: null } },
          flashcards: { where: { isPublished: true, deletedAt: null } },
        },
      },
    },
  });

  if (!chapter) {
    notFound();
  }

  const topicProgresses = await prisma.topicProgress.findMany({
    where: { userId: user.id, chapterId: chapter.id },
  });

  const completedTopics = topicProgresses.filter(
    (tp) => tp.lessonsCompleted
  ).length;
  const totalTopics = chapter.topics.length;
  const pct =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/capitulos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Capítulos
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/exercicios?chapterId=${chapter.id}`}>
            <Button variant="outline" size="sm">
              <CheckSquare className="h-4 w-4" />
              Exercícios ({chapter._count.questions})
            </Button>
          </Link>
          <Link href={`/flashcards?chapterId=${chapter.id}`}>
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4" />
              Flashcards ({chapter._count.flashcards})
            </Button>
          </Link>
          <Link href={`/simulados?chapterId=${chapter.id}`}>
            <Button size="sm">
              <Clock className="h-4 w-4" />
              Simulado do Capítulo {chapter.number}
            </Button>
          </Link>
        </div>
      </div>

      {/* Cabeçalho e Introdução do Capítulo */}
      <Card className="border-indigo-500/30">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">Capítulo {chapter.number}</Badge>
              <Badge variant="purple">
                {chapter.examWeightQuestions} questões no exame oficial
              </Badge>
            </div>
            <span className="text-xs font-semibold text-indigo-400">
              Progresso no capítulo: {pct}% ({completedTopics}/{totalTopics}{' '}
              tópicos)
            </span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold">
            {chapter.number}. {chapter.title}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {chapter.introduction}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Progress value={pct} />
          <div className="rounded-xl border border-border/70 bg-background/60 p-4">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Target className="h-4 w-4" />
              Síntese dos Objetivos de Aprendizagem do Capítulo
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {chapter.learningObjectivesSummary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tópicos e Objetivos de Aprendizagem Oficiais */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          Tópicos Oficiais e Aulas do Capítulo {chapter.number}
        </h2>

        <div className="grid grid-cols-1 gap-5">
          {chapter.topics.map((topic) => {
            const tp = topicProgresses.find((t) => t.topicId === topic.id);
            const isCompleted = tp?.lessonsCompleted ?? false;
            const objectives: LearningObjectiveEntry[] = Array.isArray(
              topic.learningObjectives
            )
              ? (topic.learningObjectives as unknown as LearningObjectiveEntry[])
              : [];

            return (
              <Card
                key={topic.id}
                className="border-border/80 hover:border-indigo-500/40 transition"
              >
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Tópico {topic.code}</Badge>
                      <Badge variant="secondary">
                        Nível Máximo: {topic.kLevelMax}
                      </Badge>
                      {isCompleted && (
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3" />
                          Aula Concluída
                        </Badge>
                      )}
                    </div>
                    {tp && tp.questionsAnswered > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Taxa de acerto em questões: {tp.accuracyPercent}% (
                        {tp.questionsCorrect}/{tp.questionsAnswered})
                      </span>
                    )}
                  </div>
                  <CardTitle className="pt-2 text-lg">{topic.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Objetivos de Aprendizagem Oficiais (Syllabus 4.0.1):
                    </p>
                    <ul className="space-y-1.5">
                      {objectives.map((lo) => (
                        <li
                          key={lo.code}
                          className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background/40 px-3 py-2 text-xs"
                        >
                          <Badge variant="default" className="shrink-0">
                            {lo.code} ({lo.kLevel})
                          </Badge>
                          <span className="text-muted-foreground">
                            {lo.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="h-4 w-4 text-indigo-400" />
                      <span>
                        {topic.lessons.length} aula(s) didática(s) completa(s)
                      </span>
                    </div>

                    <Link
                      href={`/capitulos/${chapter.slug}/topicos/${topic.slug}`}
                    >
                      <Button size="sm">
                        {isCompleted ? 'Revisar Aula e Exercícios' : 'Estudar Tópico'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
