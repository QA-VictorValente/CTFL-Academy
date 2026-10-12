import { redirect } from 'next/navigation';
import {
  Award,
  CheckCircle2,
  Flame,
  Lock,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { XP_RULES } from '@/lib/gamification';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { formatDateTimePtBr } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ConquistasPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [allAchievements, userAchievements, recentActivities] = await Promise.all([
    prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { xpReward: 'asc' },
    }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    }),
    prisma.studyActivity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
  ]);

  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  );

  const xpRuleDescriptions = [
    {
      label: 'Concluir estudo de tópico oficial',
      xp: XP_RULES.LESSON_COMPLETED,
      detail: 'Concedido na primeira conclusão de cada aula do Syllabus.',
    },
    {
      label: 'Acertar exercício de fixação',
      xp: XP_RULES.EXERCISE_CORRECT,
      detail: 'Concedido na primeira resposta correta por questão no modo treino.',
    },
    {
      label: 'Revisar flashcard',
      xp: XP_RULES.FLASHCARD_REVIEWED,
      detail: 'Concedido por revisão diária de cada cartão de memorização.',
    },
    {
      label: 'Finalizar simulado',
      xp: XP_RULES.EXAM_COMPLETED,
      detail: 'Concedido ao entregar qualquer modalidade de simulado.',
    },
    {
      label: 'Ser aprovado em simulado (≥ 65%)',
      xp: XP_RULES.EXAM_PASSED,
      detail: 'Bônus adicional ao atingir a nota oficial de aprovação.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Conquistas, Medalhas e Pontos de Experiência (XP)
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe suas medalhas desbloqueadas, seu histórico auditável de pontos de experiência e as regras de gamificação da plataforma.
        </p>
      </div>

      {/* Resumo Gamificação */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="XP Acumulado"
          value={`${user.totalXp} XP`}
          subtitle="Pontuação auditada de estudo"
          icon={Sparkles}
        />
        <StatCard
          title="Medalhas Desbloqueadas"
          value={`${userAchievements.length} / ${allAchievements.length}`}
          subtitle="Conquistas oficiais CTFL Academy"
          icon={Trophy}
        />
        <StatCard
          title="Ofensiva de Estudo (Streak)"
          value={`${user.currentStreak} ${user.currentStreak === 1 ? 'dia' : 'dias'}`}
          subtitle={`Recorde pessoal: ${user.longestStreak} dias`}
          icon={Flame}
        />
      </div>

      {/* Grade de Conquistas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-primary" />
            Quadro de Medalhas
          </CardTitle>
          <CardDescription>
            As medalhas são desbloqueadas automaticamente pelo servidor quando seus critérios são atingidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allAchievements.map((ach) => {
              const unlockedAt = unlockedMap.get(ach.id);
              const isUnlocked = Boolean(unlockedAt);

              return (
                <div
                  key={ach.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                    isUnlocked
                      ? 'border-primary/40 bg-primary/5 shadow-sm'
                      : 'border-border bg-secondary/10 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          isUnlocked
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {isUnlocked ? (
                          <Trophy className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                      <Badge variant={isUnlocked ? 'success' : 'outline'}>
                        +{ach.xpReward} XP
                      </Badge>
                    </div>

                    <h3 className="mt-3 font-bold">{ach.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ach.description}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-border/60 pt-2.5 text-[11px]">
                    {isUnlocked && unlockedAt ? (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Desbloqueada em {formatDateTimePtBr(unlockedAt)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Critério: {ach.ruleType} ≥ {ach.ruleThreshold}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Regras de XP */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-amber-500" />
              Tabela Oficial de Regras de XP
            </CardTitle>
            <CardDescription>
              Regras idempotentes para evitar duplicação artificial de pontos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {xpRuleDescriptions.map((rule) => (
              <div
                key={rule.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{rule.label}</p>
                  <p className="text-xs text-muted-foreground">{rule.detail}</p>
                </div>
                <Badge variant="info" className="shrink-0">
                  +{rule.xp} XP
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Extrato de Atividades e XP */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Extrato Recente de Estudo e XP
            </CardTitle>
            <CardDescription>
              Últimos eventos de estudo registrados na sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum evento de XP registrado ainda. Conclua uma aula ou resolva exercícios para ganhar seus primeiros pontos!
              </p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/10 px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="font-medium text-foreground">{act.description}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDateTimePtBr(act.createdAt)}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold text-emerald-500">
                      +{act.xpEarned} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
