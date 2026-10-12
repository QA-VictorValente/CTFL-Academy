import Link from 'next/link';
import {
  History,
  Clock,
  ArrowRight,
  Play,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import {
  formatDateTimeBR,
  formatDurationSeconds,
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

export default async function HistoricoTentativasPage() {
  const user = await requireAuth();

  const attempts = await prisma.examAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="default">Histórico Pessoal</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Histórico de Tentativas de Simulados
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulte todas as provas realizadas, retome tentativas em andamento
            ou revise o gabarito comentado.
          </p>
        </div>

        <Link href="/simulados">
          <Button>
            <Play className="h-4 w-4" />
            Novo Simulado
          </Button>
        </Link>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhum simulado registrado ainda"
          description="Inicie seu primeiro simulado na Central de Simulados para registrar seu histórico e evolução."
          action={
            <Link href="/simulados">
              <Button>Ir para a Central de Simulados</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {attempts.map((att) => {
            const isInProgress = att.status === 'IN_PROGRESS';
            return (
              <Card
                key={att.id}
                className="border-border/80 hover:border-indigo-500/40 transition"
              >
                <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{att.mode}</Badge>
                      {isInProgress ? (
                        <Badge variant="warning">Em Andamento</Badge>
                      ) : att.passed ? (
                        <Badge variant="success">Aprovado (≥ 65%)</Badge>
                      ) : (
                        <Badge variant="destructive">Reprovado</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Iniciado em {formatDateTimeBR(att.startedAt)}
                      </span>
                    </div>

                    <h2 className="text-base font-bold">{att.title}</h2>

                    {isInProgress ? (
                      <p className="text-xs text-muted-foreground">
                        {att.totalQuestions} questões • Expira em{' '}
                        {formatDateTimeBR(att.expiresAt)}
                      </p>
                    ) : (
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Acertos:{' '}
                          <strong className="text-foreground">
                            {att.correctCount}/{att.totalQuestions}
                          </strong>{' '}
                          ({att.accuracyPercent}%)
                        </span>
                        <span>
                          Erros: <strong>{att.wrongCount}</strong>
                        </span>
                        <span>
                          Não respondidas: <strong>{att.unansweredCount}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Tempo: {formatDurationSeconds(att.timeSpentSeconds ?? 0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    {isInProgress ? (
                      <Link href={`/simulados/${att.id}`}>
                        <Button variant="success" size="sm">
                          Retomar Tentativa
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/simulados/${att.id}/resultado`}>
                        <Button variant="outline" size="sm">
                          Ver Resultado & Revisão
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
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
