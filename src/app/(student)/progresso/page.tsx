import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ProgressoPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [chapters, topicProgressList, userAnswers, completedExams] = await Promise.all([
    prisma.chapter.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { number: 'asc' },
      include: {
        topics: {
          where: { deletedAt: null },
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: { where: { isPublished: true, deletedAt: null }, select: { id: true } },
            _count: {
              select: { questions: { where: { status: 'PUBLISHED', deletedAt: null } } },
            },
          },
        },
      },
    }),
    prisma.topicProgress.findMany({
      where: { userId: user.id },
    }),
    prisma.userAnswer.findMany({
      where: { userId: user.id },
      include: {
        question: {
          select: { chapterId: true, topicId: true, cognitiveLevel: true },
        },
      },
    }),
    prisma.examAttempt.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
    }),
  ]);

  const progressMap = new Map(topicProgressList.map((tp) => [tp.topicId, tp]));

  const totalTopics = chapters.reduce((acc, ch) => acc + ch.topics.length, 0);
  const completedTopics = topicProgressList.filter((tp) => tp.lessonsCompleted).length;
  const overallTopicPercent =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const totalAnswers = userAnswers.length;
  const totalCorrect = userAnswers.filter((a) => a.isCorrect).length;
  const overallAccuracy =
    totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  const fullExams = completedExams.filter((e) => e.mode === 'FULL');
  const passedFullExams = fullExams.filter((e) => e.passed).length;

  // Desempenho por nível cognitivo (K1, K2, K3)
  const kStats = ['K1', 'K2', 'K3'].map((k) => {
    const items = userAnswers.filter((a) => a.question.cognitiveLevel === k);
    const correct = items.filter((a) => a.isCorrect).length;
    const accuracy = items.length > 0 ? Math.round((correct / items.length) * 100) : 0;
    return { level: k, total: items.length, correct, accuracy };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Progresso Detalhado por Capítulo
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe sua evolução teórica e sua taxa de acerto em cada capítulo, tópico e nível cognitivo do Syllabus CTFL 4.0.1.
          </p>
        </div>
        <Link href="/simulados">
          <Button size="sm" className="gap-1.5">
            <ClipboardCheck className="h-4 w-4" />
            Realizar Simulado
          </Button>
        </Link>
      </div>

      {/* Resumo superior */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Cobertura do Syllabus"
          value={`${overallTopicPercent}%`}
          subtitle={`${completedTopics} de ${totalTopics} tópicos concluídos`}
          icon={BookOpen}
        />
        <StatCard
          title="Taxa de Acerto Geral"
          value={`${overallAccuracy}%`}
          subtitle={`${totalCorrect} acertos em ${totalAnswers} respostas`}
          icon={Target}
          trend={overallAccuracy >= 65 ? 'positive' : totalAnswers > 0 ? 'negative' : 'neutral'}
        />
        <StatCard
          title="Simulados Completos (40q)"
          value={fullExams.length}
          subtitle={`${passedFullExams} aprovações (≥ 65%)`}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Meta de Certificação"
          value="65%"
          subtitle="26 de 40 pontos na prova oficial"
          icon={TrendingUp}
        />
      </div>

      {/* Desempenho por Nível Cognitivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Desempenho por Nível Cognitivo (K1, K2, K3)
          </CardTitle>
          <CardDescription>
            O exame ISTQB CTFL avalia Lembrar (K1), Compreender (K2) e Aplicar técnicas práticas (K3).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {kStats.map((stat) => (
              <div
                key={stat.level}
                className="rounded-xl border border-border bg-secondary/20 p-4"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="info">{stat.level}</Badge>
                  <span className="text-lg font-extrabold">{stat.accuracy}%</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.level === 'K1' && 'Lembrar definições e termos do glossário'}
                  {stat.level === 'K2' && 'Compreender conceitos, comparar e explicar'}
                  {stat.level === 'K3' && 'Aplicar técnicas de caixa-preta e estimativas'}
                </p>
                <Progress
                  value={stat.accuracy}
                  className="mt-3 h-2"
                  indicatorClassName={
                    stat.accuracy >= 65 ? 'bg-emerald-500' : 'bg-amber-500'
                  }
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {stat.correct} acertos de {stat.total} questões respondidas
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento dos 6 Capítulos */}
      <div className="space-y-4">
        {chapters.map((ch) => {
          const chAnswers = userAnswers.filter((a) => a.question.chapterId === ch.id);
          const chCorrect = chAnswers.filter((a) => a.isCorrect).length;
          const chAccuracy =
            chAnswers.length > 0 ? Math.round((chCorrect / chAnswers.length) * 100) : 0;

          const chCompletedTopics = ch.topics.filter(
            (t) => progressMap.get(t.id)?.lessonsCompleted
          ).length;
          const chStudyPercent =
            ch.topics.length > 0
              ? Math.round((chCompletedTopics / ch.topics.length) * 100)
              : 0;

          return (
            <Card key={ch.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Capítulo {ch.number}</Badge>
                      <Badge variant="outline">
                        Peso oficial: {ch.examWeightQuestions} questões
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 text-lg">{ch.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="block text-xs text-muted-foreground">
                        Aulas Concluídas
                      </span>
                      <span className="text-sm font-bold">
                        {chCompletedTopics}/{ch.topics.length} ({chStudyPercent}%)
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted-foreground">
                        Taxa de Acerto
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          chAnswers.length === 0
                            ? 'text-muted-foreground'
                            : chAccuracy >= 65
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {chAnswers.length > 0 ? `${chAccuracy}%` : 'Sem respostas'}
                      </span>
                    </div>
                  </div>
                </div>
                <Progress value={chStudyPercent} className="mt-2 h-2" />
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {ch.topics.map((topic) => {
                    const tp = progressMap.get(topic.id);
                    const isCompleted = Boolean(tp?.lessonsCompleted);
                    const tAnswered = tp?.questionsAnswered ?? 0;
                    const tCorrect = tp?.questionsCorrect ?? 0;
                    const tAccuracy =
                      tAnswered > 0 ? Math.round((tCorrect / tAnswered) * 100) : null;

                    return (
                      <div
                        key={topic.id}
                        className="flex flex-col justify-between gap-2 rounded-xl bg-secondary/35 p-3 text-sm sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 ${
                              isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/40'
                            }`}
                          />
                          <div>
                            <Link
                              href={`/capitulos/${ch.slug}/topicos/${topic.slug}`}
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {topic.code} - {topic.title}
                            </Link>
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({topic.kLevelMax})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {tAccuracy !== null ? (
                            <Badge
                              variant={tAccuracy >= 65 ? 'success' : 'warning'}
                            >
                              {tCorrect}/{tAnswered} ({tAccuracy}%)
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              0 questões respondidas
                            </span>
                          )}
                          <Link href={`/capitulos/${ch.slug}/topicos/${topic.slug}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              {isCompleted ? 'Revisar' : 'Estudar'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
