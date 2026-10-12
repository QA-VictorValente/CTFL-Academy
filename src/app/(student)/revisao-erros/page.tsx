import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTimePtBr } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function RevisaoErrosPage({
  searchParams,
}: {
  searchParams?: { chapter?: string; mode?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const chapterFilter = searchParams?.chapter ? Number(searchParams.chapter) : undefined;
  const modeFilter = searchParams?.mode || 'ALL';

  const chapters = await prisma.chapter.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: { number: 'asc' },
    select: { id: true, number: true, title: true, slug: true },
  });

  // Buscar respostas erradas do estudante
  const wrongUserAnswers = await prisma.userAnswer.findMany({
    where: {
      userId: user.id,
      isCorrect: false,
      question: {
        status: 'PUBLISHED',
        deletedAt: null,
        ...(chapterFilter ? { chapter: { number: chapterFilter } } : {}),
      },
      ...(modeFilter === 'EXAM'
        ? { context: 'EXAM' }
        : modeFilter === 'PRACTICE'
          ? { context: 'EXERCISE' }
          : {}),
    },
    include: {
      attempt: {
        select: { id: true, mode: true, status: true, completedAt: true },
      },
      question: {
        include: {
          chapter: { select: { number: true, title: true, slug: true } },
          topic: { select: { code: true, title: true, slug: true } },
          source: { select: { name: true, referenceDocument: true } },
          options: { orderBy: { orderIndex: 'asc' } },
        },
      },
    },
    orderBy: { answeredAt: 'desc' },
    take: 100,
  });

  // Proteção extra: nunca exibir gabarito de simulado em andamento
  const safeWrongAnswers = wrongUserAnswers.filter(
    (ans) => !ans.attempt || ans.attempt.status !== 'IN_PROGRESS'
  );

  // Deduplicar por questionId mantendo o erro mais recente e contando total de erros
  const groupedByQuestion = new Map<
    string,
    {
      latestAnswer: (typeof safeWrongAnswers)[0];
      errorCount: number;
    }
  >();

  for (const ans of safeWrongAnswers) {
    const existing = groupedByQuestion.get(ans.questionId);
    if (!existing) {
      groupedByQuestion.set(ans.questionId, { latestAnswer: ans, errorCount: 1 });
    } else {
      existing.errorCount += 1;
    }
  }

  const uniqueWrongItems = Array.from(groupedByQuestion.values());

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Caderno de Revisão de Erros
          </h1>
          <p className="text-sm text-muted-foreground">
            Analise detalhadamente as questões que você errou em simulados ou exercícios, entenda a justificativa de cada alternativa e domine os pontos fracos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/exercicios">
            <Button variant="outline" size="sm" className="gap-1.5">
              <HelpCircle className="h-4 w-4" />
              Praticar Exercícios
            </Button>
          </Link>
          <Link href="/simulados">
            <Button size="sm" className="gap-1.5">
              <ClipboardCheck className="h-4 w-4" />
              Novo Simulado
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros por capítulo e origem */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Filter className="h-3.5 w-3.5" /> Capítulo:
              </span>
              <Link
                href={`/revisao-erros?mode=${modeFilter}`}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  !chapterFilter
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Todos
              </Link>
              {chapters.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/revisao-erros?chapter=${ch.number}&mode=${modeFilter}`}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    chapterFilter === ch.number
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Cap. {ch.number}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Origem:</span>
              {[
                { key: 'ALL', label: 'Todas' },
                { key: 'EXAM', label: 'Simulados' },
                { key: 'PRACTICE', label: 'Exercícios' },
              ].map((m) => (
                <Link
                  key={m.key}
                  href={`/revisao-erros?${chapterFilter ? `chapter=${chapterFilter}&` : ''}mode=${m.key}`}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    modeFilter === m.key
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {m.label}
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {uniqueWrongItems.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Nenhuma questão com erro encontrada para este filtro"
          description="Excelente trabalho! Quando você errar questões em simulados finalizados ou na bateria de exercícios, elas aparecerão automaticamente aqui com gabarito comentado."
          action={
            <Link href="/exercicios">
              <Button>Resolver Exercícios de Fixação</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Exibindo <strong>{uniqueWrongItems.length}</strong> questão(ões) distinta(s) com registro de erro
            </span>
          </div>

          {uniqueWrongItems.map(({ latestAnswer, errorCount }) => {
            const q = latestAnswer.question;
            const correctOption = q.options.find((o) => o.isCorrect);

            return (
              <Card key={q.id} className="border-amber-500/30">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="warning">
                        {errorCount}x {errorCount === 1 ? 'erro registrado' : 'erros registrados'}
                      </Badge>
                      <Badge variant="outline">
                        Cap. {q.chapter.number} • {q.topic.code}
                      </Badge>
                      <Badge variant="info">{q.learningObjectiveCode}</Badge>
                      <Badge variant="default">{q.cognitiveLevel}</Badge>
                      <Badge variant="outline">
                        {latestAnswer.context === 'EXERCISE' ? 'Exercício de Fixação' : 'Simulado'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Último erro em {formatDateTimePtBr(latestAnswer.answeredAt)}
                    </span>
                  </div>
                  <CardTitle className="mt-3 text-base leading-relaxed">
                    {q.statement}
                  </CardTitle>
                  <CardDescription>
                    Tópico: {q.topic.title}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    {q.options.map((opt) => {
                      const isUserWrongSelection =
                        latestAnswer.selectedLabel === opt.label && !opt.isCorrect;

                      return (
                        <div
                          key={opt.id}
                          className={`rounded-lg border p-3 text-sm ${
                            opt.isCorrect
                              ? 'border-emerald-500/40 bg-emerald-500/10'
                              : isUserWrongSelection
                                ? 'border-destructive/40 bg-destructive/10'
                                : 'border-border bg-card/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold">{opt.label})</span> {opt.content}
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                              {isUserWrongSelection && (
                                <Badge variant="danger" className="gap-1">
                                  <XCircle className="h-3 w-3" /> Sua marcação
                                </Badge>
                              )}
                              {opt.isCorrect && (
                                <Badge variant="success" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Correta
                                </Badge>
                              )}
                            </div>
                          </div>
                          {opt.justification && (
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              • {opt.justification}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs leading-relaxed">
                    <div className="flex items-center gap-1.5 font-semibold text-primary">
                      <AlertCircle className="h-4 w-4" />
                      Explicação Didática (Gabarito: Alternativa {correctOption?.label}):
                    </div>
                    <p className="mt-1 text-foreground/90">{q.explanation}</p>
                    <p className="mt-1.5 text-muted-foreground">
                      Referência: {q.referenceSection} ({q.source.referenceDocument})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <Link
                      href={`/capitulos/${q.chapter.slug}/topicos/${q.topic.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Revisar aula teórica: {q.topic.code} — {q.topic.title}
                    </Link>
                    <Link href={`/exercicios?chapterId=${q.chapterId}&topicId=${q.topicId}`}>
                      <Button variant="outline" size="sm">
                        Treinar este tópico
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
