import Link from 'next/link';
import {
  Award,
  BarChart2,
  BookOpen,
  ClipboardCheck,
  FileSearch,
  FileSpreadsheet,
  Layers,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Progress } from '@/components/ui/progress';
import { formatDateTimePtBr } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalUsers,
    totalChapters,
    totalTopics,
    questionsByStatus,
    chaptersWithQuestions,
    totalFlashcards,
    completedExamsCount,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.userProfile.count({ where: { deletedAt: null } }),
    prisma.chapter.count(),
    prisma.topic.count(),
    prisma.question.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.chapter.findMany({
      orderBy: { number: 'asc' },
      include: {
        _count: {
          select: {
            questions: { where: { status: 'PUBLISHED' } },
            topics: true,
          },
        },
      },
    }),
    prisma.flashcard.count({ where: { isPublished: true } }),
    prisma.examAttempt.count({ where: { status: 'COMPLETED' } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        actor: { select: { fullName: true, email: true } },
      },
    }),
  ]);

  const statusCountMap = new Map(
    questionsByStatus.map((item) => [item.status, item._count._all])
  );

  const publishedQuestions = statusCountMap.get('PUBLISHED') ?? 0;
  const inReviewQuestions = statusCountMap.get('IN_REVIEW') ?? 0;
  const draftQuestions = statusCountMap.get('DRAFT') ?? 0;
  const approvedQuestions = statusCountMap.get('APPROVED') ?? 0;
  const rejectedQuestions = statusCountMap.get('REJECTED') ?? 0;
  const archivedQuestions = statusCountMap.get('ARCHIVED') ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info">Painel Administrativo</Badge>
            <Badge variant="outline">Syllabus CTFL 4.0.1</Badge>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            Central de Governança e Conteúdo CTFL Academy
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie capítulos, tópicos, banco de questões, fila de revisão editorial, flashcards, regras de prova e auditoria.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/questoes">
            <Button size="sm" className="gap-1.5">
              <FileSpreadsheet className="h-4 w-4" />
              Gerenciar Questões
            </Button>
          </Link>
          <Link href="/admin/revisao">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ClipboardCheck className="h-4 w-4" />
              Fila Editorial ({inReviewQuestions + draftQuestions + approvedQuestions})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs Administrativos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Questões Publicadas"
          value={publishedQuestions}
          subtitle={`${inReviewQuestions} em revisão • ${draftQuestions} rascunhos`}
          icon={FileSpreadsheet}
        />
        <StatCard
          title="Estrutura Curricular"
          value={`${totalChapters} Capítulos`}
          subtitle={`${totalTopics} tópicos oficiais • ${totalFlashcards} flashcards`}
          icon={BookOpen}
        />
        <StatCard
          title="Contas Ativas"
          value={totalUsers}
          subtitle="Estudantes e administradores"
          icon={Users}
        />
        <StatCard
          title="Simulados Concluídos"
          value={completedExamsCount}
          subtitle="Provas corrigidas no servidor"
          icon={ShieldCheck}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Qualidade e Cobertura do Banco de Questões por Capítulo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Saúde do Banco de Questões por Capítulo (Matriz 40 Questões)
            </CardTitle>
            <CardDescription>
              Comparativo entre questões publicadas e a cota mínima exigida pelo exame oficial CTFL 4.0.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {chaptersWithQuestions.map((ch) => {
              const published = ch._count.questions;
              const required = ch.examWeightQuestions;
              const ratio = required > 0 ? Math.min(100, Math.round((published / required) * 100)) : 100;
              const healthy = published >= required;

              return (
                <div key={ch.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">
                      Cap. {ch.number} — {ch.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant={healthy ? 'success' : 'danger'}>
                        {published} publicadas / mín. {required}
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={ratio}
                    className="h-2"
                    indicatorClassName={healthy ? 'bg-emerald-500' : 'bg-destructive'}
                  />
                </div>
              );
            })}

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border bg-secondary/20 p-3 text-center text-xs sm:grid-cols-6">
              <div>
                <span className="block font-bold">{draftQuestions}</span>
                <span className="text-muted-foreground">DRAFT</span>
              </div>
              <div>
                <span className="block font-bold text-amber-500">{inReviewQuestions}</span>
                <span className="text-muted-foreground">IN_REVIEW</span>
              </div>
              <div>
                <span className="block font-bold text-sky-400">{approvedQuestions}</span>
                <span className="text-muted-foreground">APPROVED</span>
              </div>
              <div>
                <span className="block font-bold text-emerald-500">{publishedQuestions}</span>
                <span className="text-muted-foreground">PUBLISHED</span>
              </div>
              <div>
                <span className="block font-bold text-destructive">{rejectedQuestions}</span>
                <span className="text-muted-foreground">REJECTED</span>
              </div>
              <div>
                <span className="block font-bold text-muted-foreground">{archivedQuestions}</span>
                <span className="text-muted-foreground">ARCHIVED</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Últimos Eventos de Auditoria */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">
                Auditoria Administrativa Recente
              </CardTitle>
              <CardDescription>
                Rastreabilidade de alterações em questões, conteúdo e usuários.
              </CardDescription>
            </div>
            <Link href="/admin/auditoria">
              <Button variant="ghost" size="sm">
                Ver tudo
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAuditLogs.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum evento administrativo registrado até o momento.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-border bg-secondary/10 p-2.5 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="font-medium text-muted-foreground">
                          {log.entityType}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        Operador: {log.actor?.fullName || log.actor?.email || 'Sistema'}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDateTimePtBr(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Atalhos Rápidos dos Módulos Administrativos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            href: '/admin/capitulos',
            title: 'Capítulos, Tópicos e Aulas',
            desc: 'Editar textos didáticos, exemplos de QA e objetivos do syllabus.',
            icon: BookOpen,
          },
          {
            href: '/admin/questoes',
            title: 'Banco de Questões',
            desc: 'Criar, editar, duplicar, filtrar e consultar histórico de versões.',
            icon: FileSpreadsheet,
          },
          {
            href: '/admin/revisao',
            title: 'Fila de Revisão e Aprovação',
            desc: 'Aprovar, rejeitar, publicar ou arquivar questões com parecer técnico.',
            icon: ClipboardCheck,
          },
          {
            href: '/admin/flashcards',
            title: 'Gerenciar Flashcards',
            desc: 'Cadastrar e editar cartões de repetição espaçada por capítulo.',
            icon: Layers,
          },
          {
            href: '/admin/provas',
            title: 'Provas e Configurações',
            desc: 'Configurar tempo limite, nota de corte (65%) e distribuição oficial.',
            icon: Settings,
          },
          {
            href: '/admin/conquistas',
            title: 'Conquistas e Regras XP',
            desc: 'Gerenciar medalhas, critérios de desbloqueio e pontuação.',
            icon: Award,
          },
          {
            href: '/admin/estatisticas',
            title: 'Estatísticas Agregadas',
            desc: 'Analisar taxa de aprovação, tópicos mais errados e engajamento.',
            icon: BarChart2,
          },
          {
            href: '/admin/auditoria',
            title: 'Trilha de Auditoria',
            desc: 'Inspecionar logs imutáveis de operações administrativas.',
            icon: FileSearch,
          },
        ].map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-bold text-sm">{mod.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{mod.desc}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
