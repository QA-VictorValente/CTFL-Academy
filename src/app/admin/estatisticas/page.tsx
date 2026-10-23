import {
  BarChart2,
  ClipboardCheck,
  HelpCircle,
  Layers,
  Target,
  Users,
} from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { Progress } from '@/components/ui/progress';

export const dynamic = 'force-dynamic';

export default async function AdminEstatisticasPage() {
  await requireAdmin();

  const [
    studentsCount,
    completedAttempts,
    allUserAnswers,
    flashcardReviewsCount,
    topicsWithStats,
  ] = await Promise.all([
    prisma.userProfile.count({
      where: { role: 'STUDENT', deletedAt: null },
    }),
    prisma.examAttempt.findMany({
      where: { status: 'COMPLETED' },
      select: {
        id: true,
        mode: true,
        scorePoints: true,
        totalQuestions: true,
        accuracyPercent: true,
        passed: true,
        timeSpentSeconds: true,
      },
    }),
    prisma.userAnswer.findMany({
      select: {
        isCorrect: true,
        context: true,
        question: {
          select: {
            chapterId: true,
            topicId: true,
            cognitiveLevel: true,
          },
        },
      },
    }),
    prisma.flashcardReview.count(),
    prisma.topic.findMany({
      where: { deletedAt: null },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        title: true,
        chapter: { select: { number: true } },
      },
    }),
  ]);

  const totalExams = completedAttempts.length;
  const passedExams = completedAttempts.filter((a) => a.passed).length;
  const examPassRate =
    totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

  const avgAccuracyExams =
    totalExams > 0
      ? Math.round(
          completedAttempts.reduce((acc, a) => acc + a.accuracyPercent, 0) /
            totalExams
        )
      : 0;

  const totalAnswers = allUserAnswers.length;
  const correctAnswers = allUserAnswers.filter((a) => a.isCorrect).length;
  const globalAnswerAccuracy =
    totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  // Tópicos com maior índice de erro agregado
  const topicAgg = topicsWithStats.map((t) => {
    const answers = allUserAnswers.filter((a) => a.question.topicId === t.id);
    const total = answers.length;
    const correct = answers.filter((a) => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return {
      ...t,
      total,
      correct,
      wrong: total - correct,
      accuracy,
    };
  });

  const rankedTopics = [...topicAgg].sort((a, b) => {
    if (a.total === 0 && b.total === 0) return 0;
    if (a.total === 0) return 1;
    if (b.total === 0) return -1;
    return a.accuracy - b.accuracy;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Estatísticas Agregadas de Utilização e Desempenho
        </h1>
        <p className="text-sm text-muted-foreground">
          Indicadores consolidados de simulados, taxa de aprovação, resoluções de questões e desempenho por tópico do Syllabus CTFL 4.0.1.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Estudantes Cadastrados"
          value={studentsCount}
          subtitle="Contas ativas de alunos"
          icon={Users}
        />
        <StatCard
          title="Taxa de Aprovação em Provas"
          value={`${examPassRate}%`}
          subtitle={`${passedExams} aprovados de ${totalExams} simulados`}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Respostas Registradas"
          value={totalAnswers}
          subtitle={`Acerto global: ${globalAnswerAccuracy}%`}
          icon={HelpCircle}
        />
        <StatCard
          title="Revisões de Flashcards"
          value={flashcardReviewsCount}
          subtitle={`Média em provas: ${avgAccuracyExams}%`}
          icon={Layers}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart2 className="h-4 w-4 text-primary" />
            Desempenho Agregado por Tópico do Syllabus
          </CardTitle>
          <CardDescription>
            Ordenado pelos tópicos com menor taxa de acerto para orientar reforço pedagógico e novas questões autorais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rankedTopics.map((item) => (
            <div
              key={item.id}
              data-ui
              className="rounded-xl border border-border bg-secondary/20 p-3.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Cap. {item.chapter.number}</Badge>
                  <span className="font-bold">
                    {item.code} — {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="text-muted-foreground">
                    {item.correct} acertos / {item.total} respostas
                  </span>
                  <Badge
                    variant={
                      item.total === 0
                        ? 'outline'
                        : item.accuracy >= 65
                          ? 'success'
                          : 'warning'
                    }
                  >
                    <Target className="mr-1 h-3 w-3" />
                    {item.total > 0 ? `${item.accuracy}%` : 'Sem amostra'}
                  </Badge>
                </div>
              </div>
              <Progress
                value={item.accuracy}
                className="mt-2 h-2"
                indicatorClassName={
                  item.accuracy >= 65 ? 'bg-emerald-500' : 'bg-amber-500'
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
