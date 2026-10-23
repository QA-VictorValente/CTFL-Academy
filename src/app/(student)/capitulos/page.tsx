import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Layers,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getCachedPublishedChapters } from '@/lib/curriculum-cache';
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
import { FormattedText } from '@/components/ui/formatted-text';

export default async function CapitulosListPage() {
  const user = await requireAuth();

  const [chapters, topicProgresses] = await Promise.all([
    getCachedPublishedChapters(),
    prisma.topicProgress.findMany({
      where: { userId: user.id },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge variant="default">Currículo Oficial ISTQB® CTFL v4.0.1</Badge>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Capítulos e Trilha de Estudos
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Estude os 6 capítulos oficiais do Syllabus 4.0.1. Cada capítulo reúne
          introdução, objetivos de aprendizagem formais (FL-x.x.x), aulas
          didáticas com exemplos de rotina de QA, flashcards e simulado dedicado.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {chapters.map((ch) => {
          const chTp = topicProgresses.filter((tp) => tp.chapterId === ch.id);
          const completedCount = chTp.filter((tp) => tp.lessonsCompleted).length;
          const totalTopics = ch.topics.length;
          const pct =
            totalTopics > 0
              ? Math.round((completedCount / totalTopics) * 100)
              : 0;

          return (
            <Card
              key={ch.id}
              className="border-border/80 hover:border-primary/40 transition-colors"
            >
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Capítulo {ch.number}</Badge>
                    <Badge variant="outline">
                      Peso Oficial: {ch.examWeightQuestions} questões na prova (
                      {Math.round((ch.examWeightQuestions / 40) * 100)}%)
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    {pct}% concluído ({completedCount}/{totalTopics} tópicos)
                  </span>
                </div>
                <CardTitle className="pt-2 text-xl">
                  {ch.number}. {ch.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  <FormattedText text={ch.description} />
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <Progress value={pct} />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ch.topics.map((topic) => {
                    const tp = chTp.find((t) => t.topicId === topic.id);
                    const isDone = tp?.lessonsCompleted ?? false;
                    return (
                      <Link
                        key={topic.id}
                        href={`/capitulos/${ch.slug}/topicos/${topic.slug}`}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/50 px-3.5 py-2.5 text-xs hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2
                            className={
                              isDone
                                ? 'h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400'
                                : 'h-4 w-4 shrink-0 text-muted-foreground/40'
                            }
                          />
                          <span className="truncate font-medium">
                            {topic.title}
                          </span>
                        </div>
                        <Badge variant="secondary">{topic.kLevelMax}</Badge>
                      </Link>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/40 p-3.5">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      {totalTopics} tópicos
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      {ch._count.questions} questões publicadas
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      {ch._count.flashcards} flashcards
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/flashcards?chapterId=${ch.id}`}>
                      <Button variant="outline" size="sm">
                        <Layers className="h-3.5 w-3.5" />
                        Flashcards
                      </Button>
                    </Link>
                    <Link href={`/simulados?chapterId=${ch.id}`}>
                      <Button variant="outline" size="sm">
                        <Clock className="h-3.5 w-3.5" />
                        Simulado do Cap. {ch.number}
                      </Button>
                    </Link>
                    <Link href={`/capitulos/${ch.slug}`}>
                      <Button size="sm">
                        Abrir Capítulo {ch.number}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
