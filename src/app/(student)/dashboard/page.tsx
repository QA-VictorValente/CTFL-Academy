import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  Zap,
  Award,
  AlertTriangle,
  ArrowRight,
  PlayCircle,
  Target,
  BarChart3,
  Layers,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getCachedPublishedChapters } from '@/lib/curriculum-cache';
import { formatDateTimeBR } from '@/lib/utils';
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
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';

export default async function StudentDashboardPage() {
  const user = await requireAuth();

  const [
    chapters,
    topicProgresses,
    totalAnswers,
    correctAnswers,
    examAttempts,
    completedExamsCount,
    inProgressAttempt,
    lastActivity,
    userAchievements,
    lastLesson,
  ] = await Promise.all([
    getCachedPublishedChapters(),
    prisma.topicProgress.findMany({
      where: { userId: user.id },
      include: {
        topic: { select: { id: true, code: true, slug: true, title: true } },
        chapter: { select: { id: true, number: true, slug: true, title: true } },
      },
    }),
    prisma.userAnswer.count({
      where: {
        userId: user.id,
        OR: [
          { attemptId: null },
          { attempt: { status: { in: ['COMPLETED', 'EXPIRED'] } } },
        ],
      },
    }),
    prisma.userAnswer.count({
      where: {
        userId: user.id,
        isCorrect: true,
        OR: [
          { attemptId: null },
          { attempt: { status: { in: ['COMPLETED', 'EXPIRED'] } } },
        ],
      },
    }),
    prisma.examAttempt.findMany({
      where: {
        userId: user.id,
        status: { in: ['COMPLETED', 'EXPIRED'] },
      },
      orderBy: { completedAt: 'desc' },
      take: 5,
    }),
    prisma.examAttempt.count({
      where: {
        userId: user.id,
        status: { in: ['COMPLETED', 'EXPIRED'] },
      },
    }),
    prisma.examAttempt.findFirst({
      where: {
        userId: user.id,
        status: 'IN_PROGRESS',
        expiresAt: { gt: new Date() },
      },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.studyActivity.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    }),
    user.lastLessonId
      ? prisma.lesson.findUnique({
          where: { id: user.lastLessonId },
          select: {
            id: true,
            topic: {
              select: {
                code: true,
                slug: true,
                chapter: { select: { slug: true } },
              },
            },
          },
        })
      : null,
  ]);

  const totalTopicsCount = chapters.reduce(
    (acc, ch) => acc + ch.topics.length,
    0
  );
  const completedTopicsCount = topicProgresses.filter(
    (tp) => tp.lessonsCompleted
  ).length;
  const overallProgressPercent =
    totalTopicsCount > 0
      ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
      : 0;

  const studiedChapterIds = new Set(topicProgresses.map((tp) => tp.chapterId));
  const chaptersStudiedCount = studiedChapterIds.size;

  const accuracyRate =
    totalAnswers > 0
      ? Number(((correctAnswers / totalAnswers) * 100).toFixed(1))
      : 0;

  // Assuntos com maior dificuldade baseados no histórico real (mínimo de 1 questão respondida e acerto < 70%)
  const weakTopics = topicProgresses
    .filter((tp) => tp.questionsAnswered > 0 && tp.accuracyPercent < 70)
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent)
    .slice(0, 4);

  const firstTopicUrl =
    chapters[0]?.topics[0]
      ? `/capitulos/${chapters[0].slug}/topicos/${chapters[0].topics[0].slug}`
      : '/capitulos';

  const continueUrl = lastLesson
    ? `/capitulos/${lastLesson.topic.chapter.slug}/topicos/${lastLesson.topic.slug}`
    : firstTopicUrl;

  const hasAnyHistory =
    topicProgresses.length > 0 || totalAnswers > 0 || completedExamsCount > 0;

  return (
    <div className="space-y-8">
      {/* Saudação e Botão Continuar de Onde Parou */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-primary/25 bg-card p-6 sm:flex-row sm:items-center">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="default">Estudante CTFL v4.0.1</Badge>
            {lastActivity && (
              <span className="text-xs text-muted-foreground">
                Última atividade: {lastActivity.description} (
                {formatDateTimeBR(lastActivity.createdAt)})
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Olá, {user.fullName}!
          </h1>
          <p className="text-sm text-muted-foreground">
            {hasAnyHistory
              ? `Você já concluiu ${completedTopicsCount} de ${totalTopicsCount} tópicos oficiais (${overallProgressPercent}% do Syllabus).`
              : 'Bem-vindo à plataforma! Comece pelo Capítulo 1 para iniciar sua trilha rumo à certificação.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {inProgressAttempt && (
            <Link href={`/simulados/${inProgressAttempt.id}`}>
              <Button variant="success">
                <Clock className="h-4 w-4" />
                Retomar Simulado em Andamento
              </Button>
            </Link>
          )}
          <Link href={continueUrl}>
            <Button>
              <PlayCircle className="h-4 w-4" />
              {lastLesson
                ? `Continuar: ${lastLesson.topic.code}`
                : 'Começar a Estudar Agora'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra de Progresso Geral */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-sm font-medium mb-2">
            <span>Progresso Geral no Syllabus CTFL 4.0.1</span>
            <span className="font-bold text-primary tabular-nums">
              {overallProgressPercent}% ({completedTopicsCount}/{totalTopicsCount}{' '}
              tópicos concluídos)
            </span>
          </div>
          <Progress value={overallProgressPercent} />
        </CardContent>
      </Card>

      {/* Cards de Estatísticas Reais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Capítulos Estudados"
          value={`${chaptersStudiedCount} / ${chapters.length}`}
          subtitle="Com atividade registrada"
          icon={BookOpen}
          accent="emerald"
        />
        <StatCard
          title="Questões Respondidas"
          value={totalAnswers}
          subtitle={`${correctAnswers} acertos acumulados`}
          icon={CheckCircle2}
          accent="blue"
        />
        <StatCard
          title="Taxa de Acerto"
          value={`${accuracyRate}%`}
          subtitle="Meta oficial de corte: 65%"
          icon={Target}
          accent={accuracyRate >= 65 ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Simulados Realizados"
          value={completedExamsCount}
          subtitle="Tentativas finalizadas"
          icon={Clock}
          accent="blue"
        />
        <StatCard
          title="Sequência de Estudos"
          value={`${user.currentStreak} dias`}
          subtitle={`Recorde: ${user.longestStreak} dias`}
          icon={Flame}
          accent="amber"
        />
        <StatCard
          title="XP Acumulado"
          value={`${user.totalXp} XP`}
          subtitle={`${userAchievements.length} conquistas`}
          icon={Zap}
          accent="emerald"
        />
      </div>

      {/* Estado Inicial Orientativo quando não há histórico */}
      {!hasAnyHistory && (
        <EmptyState
          icon={Layers}
          title="Sua jornada começa aqui!"
          description="Você ainda não possui histórico de aulas ou questões respondidas. Recomendamos iniciar pelo Capítulo 1 (Fundamentos de Teste), resolver os exercícios de fixação e revisar os flashcards."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link href={firstTopicUrl}>
                <Button>
                  Estudar Tópico 1.1 Agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/simulados">
                <Button variant="outline">Realizar Simulado Diagnóstico</Button>
              </Link>
            </div>
          }
        />
      )}

      {/* Acesso Rápido aos 6 Capítulos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              Acesso Rápido aos Capítulos do Syllabus
            </h2>
            <p className="text-xs text-muted-foreground">
              Acompanhe sua evolução em cada um dos 6 capítulos oficiais
            </p>
          </div>
          <Link href="/capitulos">
            <Button variant="ghost" size="sm">
              Ver Todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chapters.map((ch) => {
            const chProgress = topicProgresses.filter(
              (tp) => tp.chapterId === ch.id
            );
            const doneTopics = chProgress.filter(
              (tp) => tp.lessonsCompleted
            ).length;
            const totalChTopics = ch.topics.length;
            const pct =
              totalChTopics > 0
                ? Math.round((doneTopics / totalChTopics) * 100)
                : 0;

            return (
              <Card
                key={ch.id}
                className="flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="default">Capítulo {ch.number}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Peso na prova: {ch.examWeightQuestions} questões
                    </span>
                  </div>
                  <CardTitle className="pt-2 text-base line-clamp-1">
                    {ch.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {ch.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {doneTopics}/{totalChTopics} tópicos concluídos
                      </span>
                      <span className="font-semibold tabular-nums">{pct}%</span>
                    </div>
                    <Progress value={pct} />
                  </div>
                  <Link href={`/capitulos/${ch.slug}`} className="block pt-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Acessar Capítulo {ch.number}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Assuntos com Maior Dificuldade & Últimos Resultados */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Assuntos com Maior Dificuldade & Sugestões de Revisão
            </CardTitle>
            <CardDescription className="text-xs">
              Calculado com base no seu histórico real de questões respondidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {weakTopics.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">
                {totalAnswers === 0
                  ? 'Responda exercícios ou realize um simulado para receber recomendações personalizadas de revisão.'
                  : 'Parabéns! Todos os tópicos que você praticou até agora estão com taxa de acerto igual ou superior a 70%.'}
              </p>
            ) : (
              <div className="space-y-3">
                {weakTopics.map((tp) => (
                  <div
                    key={tp.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"
                  >
                    <div>
                      <p className="text-xs font-semibold">
                        {tp.topic.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Acerto: {tp.accuracyPercent}% ({tp.questionsCorrect}/
                        {tp.questionsAnswered} questões)
                      </p>
                    </div>
                    <Link
                      href={`/capitulos/${tp.chapter.slug}/topicos/${tp.topic.slug}`}
                    >
                      <Button variant="outline" size="sm">
                        Revisar Tópico
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-primary" />
              Últimos Resultados de Simulados
            </CardTitle>
            <CardDescription className="text-xs">
              Histórico recente de provas finalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {examAttempts.length === 0 ? (
              <div className="flex flex-col items-start gap-3 py-4">
                <p className="text-xs text-muted-foreground">
                  Você ainda não finalizou nenhum simulado.
                </p>
                <Link href="/simulados">
                  <Button size="sm" variant="outline">
                    Iniciar Primeiro Simulado
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {examAttempts.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/70 p-3"
                  >
                    <div>
                      <p className="text-xs font-semibold line-clamp-1">
                        {att.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTimeBR(att.completedAt)} • {att.correctCount}/
                        {att.totalQuestions} acertos ({att.accuracyPercent}%)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={att.passed ? 'success' : 'destructive'}>
                        {att.passed ? 'Aprovado' : 'Reprovado'}
                      </Badge>
                      <Link href={`/simulados/${att.id}/resultado`}>
                        <Button variant="ghost" size="sm">
                          Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conquistas Desbloqueadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5 text-primary" />
              Conquistas Desbloqueadas ({userAchievements.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Medalhas ganhas por atividades efetivamente concluídas
            </CardDescription>
          </div>
          <Link href="/conquistas">
            <Button variant="ghost" size="sm">
              Ver Todas
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {userAchievements.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Conclua sua primeira aula ou resolva exercícios para desbloquear
              sua primeira medalha!
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {userAchievements.map((ua) => (
                <div
                  key={ua.id}
                  className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{ua.achievement.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTimeBR(ua.unlockedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
