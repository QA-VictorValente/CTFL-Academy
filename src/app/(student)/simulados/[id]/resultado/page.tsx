import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  BookOpen,
  ArrowLeft,
  Target,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import {
  computeExamScore,
  type ShuffledOptionSnapshot,
} from '@/lib/exam-engine';
import {
  cn,
  formatDateTimeBR,
  formatDurationSeconds,
} from '@/lib/utils';
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
import { RetakeExamButton } from '@/components/student/retake-exam-button';

export default async function ExamResultPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireAuth();

  const attempt = await prisma.examAttempt.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
    include: {
      examQuestions: {
        orderBy: { orderIndex: 'asc' },
        include: { userAnswer: true },
      },
      configuration: true,
    },
  });

  if (!attempt) {
    notFound();
  }

  if (attempt.status === 'IN_PROGRESS') {
    redirect(`/simulados/${attempt.id}`);
  }

  const topics = await prisma.topic.findMany({
    where: { deletedAt: null },
    include: { chapter: true },
  });
  const topicByCode = new Map(topics.map((t) => [t.code, t]));

  const scoreDetails = computeExamScore({
    questions: attempt.examQuestions.map((eq) => ({
      id: eq.id,
      correctDisplayLabel: eq.correctDisplayLabel,
      chapterNumberSnapshot: eq.chapterNumberSnapshot,
      topicCodeSnapshot: eq.topicCodeSnapshot,
      selectedLabel: eq.userAnswer?.selectedLabel ?? null,
    })),
    passingScorePoints:
      attempt.mode === 'FULL' ? attempt.configuration.passingScore : undefined,
    pointsPerQuestion: attempt.configuration.pointsPerQuestion,
    passingPercentFallback: 65,
  });

  const strongTopics = Object.entries(scoreDetails.byTopic)
    .filter(([, stat]) => stat.accuracyPercent >= 70)
    .map(([code, stat]) => ({ code, ...stat, topic: topicByCode.get(code) }));

  const weakTopics = Object.entries(scoreDetails.byTopic)
    .filter(([, stat]) => stat.accuracyPercent < 70)
    .map(([code, stat]) => ({ code, ...stat, topic: topicByCode.get(code) }));

  const wrongQuestions = attempt.examQuestions.filter(
    (eq) => eq.userAnswer?.selectedLabel !== eq.correctDisplayLabel
  );

  const filterMeta = (attempt.filterMetadata as Record<string, unknown>) || {};
  const chapterIdFilter =
    typeof filterMeta.chapterId === 'string' ? filterMeta.chapterId : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/historico">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Histórico de Simulados
          </Button>
        </Link>

        <RetakeExamButton
          mode={attempt.mode}
          chapterId={chapterIdFilter}
          questionCount={attempt.totalQuestions}
        />
      </div>

      {/* Painel Principal de Resultado */}
      <Card
        className={cn(
          'border-2',
          attempt.passed ? 'border-emerald-500/40' : 'border-rose-500/40'
        )}
      >
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant={attempt.passed ? 'success' : 'destructive'}>
                {attempt.passed
                  ? 'APROVADO NO CRITÉRIO ISTQB (≥ 65%)'
                  : 'REPROVADO (< 65%)'}
              </Badge>
              <Badge variant="outline">
                Finalizado em {formatDateTimeBR(attempt.completedAt)}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              Tempo utilizado:{' '}
              <strong>
                {formatDurationSeconds(attempt.timeSpentSeconds ?? 0)}
              </strong>{' '}
              de {formatDurationSeconds(attempt.durationSeconds)}
            </span>
          </div>

          <CardTitle className="pt-2 text-2xl sm:text-3xl font-extrabold">
            {attempt.title}
          </CardTitle>
          <CardDescription>
            Revisão oficial da tentativa (somente leitura — os registros da
            tentativa são imutáveis)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="rounded-xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs text-muted-foreground">Pontuação</p>
              <p className="mt-1 text-2xl font-extrabold text-indigo-400">
                {attempt.scorePoints} pts
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs text-muted-foreground">Percentual</p>
              <p className="mt-1 text-2xl font-extrabold">
                {attempt.accuracyPercent}%
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs text-muted-foreground">Total de Acertos</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-400">
                {attempt.correctCount}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs text-muted-foreground">Total de Erros</p>
              <p className="mt-1 text-2xl font-extrabold text-rose-400">
                {attempt.wrongCount}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/50 p-4">
              <p className="text-xs text-muted-foreground">Não Respondidas</p>
              <p className="mt-1 text-2xl font-extrabold text-amber-400">
                {attempt.unansweredCount}
              </p>
            </div>
          </div>

          <Progress
            value={attempt.accuracyPercent}
            indicatorClassName={
              attempt.passed
                ? 'from-emerald-500 to-teal-500'
                : 'from-rose-500 to-amber-500'
            }
          />
        </CardContent>
      </Card>

      {/* Desempenho por Capítulo e Diagnóstico de Pontos Fortes / Revisão */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-indigo-400" />
              Resultado por Capítulo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(scoreDetails.byChapter).map(([chNum, stat]) => (
              <div key={chNum} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Capítulo {chNum}</span>
                  <span>
                    {stat.correct}/{stat.total} acertos ({stat.accuracyPercent}%)
                  </span>
                </div>
                <Progress value={stat.accuracyPercent} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5 text-violet-400" />
              Diagnóstico: Pontos Fortes & Conteúdos para Revisar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <p className="font-bold text-emerald-400 mb-2">
                Pontos Fortes (≥ 70% de acerto):
              </p>
              {strongTopics.length === 0 ? (
                <p className="text-muted-foreground">
                  Nenhum tópico atingiu 70% nesta tentativa.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {strongTopics.map((item) => (
                    <Badge key={item.code} variant="success">
                      Tópico {item.code} ({item.accuracyPercent}%)
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border/60 pt-3">
              <p className="font-bold text-amber-400 mb-2">
                Conteúdos que Precisam ser Revisados (&lt; 70% de acerto):
              </p>
              {weakTopics.length === 0 ? (
                <p className="text-muted-foreground">
                  Excelente! Nenhum tópico ficou abaixo de 70% nesta prova.
                </p>
              ) : (
                <div className="space-y-2">
                  {weakTopics.map((item) => (
                    <div
                      key={item.code}
                      className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2"
                    >
                      <span>
                        <strong>Tópico {item.code}</strong>:{' '}
                        {item.topic?.title || ''} ({item.correct}/{item.total})
                      </span>
                      {item.topic && (
                        <Link
                          href={`/capitulos/${item.topic.chapter.slug}/topicos/${item.topic.slug}`}
                        >
                          <Button variant="outline" size="sm">
                            Estudar Conteúdo
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Rápido das Questões Erradas / Não Respondidas */}
      {wrongQuestions.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Resumo de Questões Erradas ou Não Respondidas (
              {wrongQuestions.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Clique em qualquer item para revisar o enunciado, gabarito e aula
              correspondente abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {wrongQuestions.map((wq) => (
                <a
                  key={wq.id}
                  href={`#questao-${wq.orderIndex}`}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                >
                  Questão {wq.orderIndex} ({wq.learningObjectiveSnapshot})
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gabarito Comentado Questão por Questão */}
      <div className="space-y-5">
        <h2 className="text-xl font-bold">
          Revisão Detalhada das Questões ({attempt.examQuestions.length})
        </h2>

        {attempt.examQuestions.map((eq) => {
          const selected = eq.userAnswer?.selectedLabel ?? null;
          const isCorrect = selected === eq.correctDisplayLabel;
          const options = Array.isArray(eq.optionsSnapshot)
            ? (eq.optionsSnapshot as unknown as ShuffledOptionSnapshot[])
            : [];
          const relatedTopic = topicByCode.get(eq.topicCodeSnapshot);

          return (
            <Card
              key={eq.id}
              id={`questao-${eq.orderIndex}`}
              className={cn(
                'border',
                isCorrect ? 'border-emerald-500/30' : 'border-rose-500/30'
              )}
            >
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={isCorrect ? 'success' : 'destructive'}>
                      {isCorrect ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      Questão {eq.orderIndex} •{' '}
                      {isCorrect
                        ? 'Acertou'
                        : selected
                        ? 'Errou'
                        : 'Não Respondida'}
                    </Badge>
                    <Badge variant="outline">
                      Cap. {eq.chapterNumberSnapshot} • Tópico{' '}
                      {eq.topicCodeSnapshot}
                    </Badge>
                    <Badge variant="purple">
                      {eq.learningObjectiveSnapshot} ({eq.cognitiveLevelSnapshot}
                      )
                    </Badge>
                  </div>

                  {relatedTopic && (
                    <Link
                      href={`/capitulos/${relatedTopic.chapter.slug}/topicos/${relatedTopic.slug}`}
                    >
                      <Button variant="outline" size="sm">
                        <BookOpen className="h-3.5 w-3.5" />
                        Estudar Tópico {eq.topicCodeSnapshot}
                      </Button>
                    </Link>
                  )}
                </div>

                <CardTitle className="pt-3 whitespace-pre-line text-base font-medium leading-relaxed">
                  {eq.statementSnapshot}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {options.map((opt) => {
                    const isUserChoice = selected === opt.displayLabel;
                    const isRightAnswer =
                      opt.displayLabel === eq.correctDisplayLabel;

                    return (
                      <div
                        key={opt.displayLabel}
                        className={cn(
                          'rounded-xl border p-3.5 text-sm',
                          isRightAnswer
                            ? 'border-emerald-500/50 bg-emerald-500/10'
                            : isUserChoice
                            ? 'border-rose-500/50 bg-rose-500/10'
                            : 'border-border/60 bg-background/40'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border text-xs font-bold">
                              {opt.displayLabel}
                            </span>
                            <div>
                              <p className="font-medium">{opt.content}</p>
                              {opt.justification && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {opt.justification}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1.5">
                            {isUserChoice && (
                              <Badge
                                variant={isRightAnswer ? 'success' : 'destructive'}
                              >
                                Sua Resposta
                              </Badge>
                            )}
                            {isRightAnswer && (
                              <Badge variant="success">Resposta Correta</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-xs space-y-1">
                  <p className="font-bold text-indigo-300">
                    Explicação Oficial da Questão (Gabarito:{' '}
                    {eq.correctDisplayLabel}):
                  </p>
                  <p className="leading-relaxed">{eq.explanationSnapshot}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
