'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  WifiOff,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useToast } from '@/components/providers/toast-provider';
import { cn, formatDurationSeconds } from '@/lib/utils';

export interface RunnerQuestionItem {
  id: string;
  questionId: string;
  orderIndex: number;
  statement: string;
  chapterNumber: number;
  topicCode: string;
  learningObjective: string;
  cognitiveLevel: string;
  difficulty: string;
  markedForReview: boolean;
  selectedLabel: 'A' | 'B' | 'C' | 'D' | null;
  options: {
    displayLabel: 'A' | 'B' | 'C' | 'D';
    content: string;
  }[];
}

export function ExamRunner({
  attemptId,
  title,
  initialRemainingSeconds,
  usedRepeatedQuestions,
  initialQuestions,
}: {
  attemptId: string;
  title: string;
  initialRemainingSeconds: number;
  usedRepeatedQuestions: boolean;
  initialQuestions: RunnerQuestionItem[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [questions, setQuestions] =
    React.useState<RunnerQuestionItem[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [remainingSeconds, setRemainingSeconds] = React.useState(
    initialRemainingSeconds
  );
  const [savingStatus, setSavingStatus] = React.useState<
    'idle' | 'saving' | 'saved' | 'offline'
  >('idle');
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [submittingExam, setSubmittingExam] = React.useState(false);
  const submittedRef = React.useRef(false);

  const currentQuestion = questions[currentIndex];

  const answeredCount = React.useMemo(
    () => questions.filter((q) => Boolean(q.selectedLabel)).length,
    [questions]
  );
  const unansweredCount = questions.length - answeredCount;
  const markedCount = React.useMemo(
    () => questions.filter((q) => q.markedForReview).length,
    [questions]
  );

  const handleFinalize = React.useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmittingExam(true);

    try {
      const res = await fetch(`/api/exams/${attemptId}/submit`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        submittedRef.current = false;
        setSubmittingExam(false);
        toast({
          title: 'Erro ao finalizar prova',
          description: json.error || 'Tente novamente.',
          variant: 'error',
        });
        return;
      }

      toast({
        title: 'Simulado finalizado!',
        description: `Sua pontuação foi calculada: ${json.correctCount}/${questions.length} acertos (${json.accuracyPercent}%).`,
        variant: 'success',
      });
      router.push(`/simulados/${attemptId}/resultado`);
      router.refresh();
    } catch {
      submittedRef.current = false;
      setSubmittingExam(false);
      toast({
        title: 'Falha de conexão',
        description: 'Verifique sua rede e tente finalizar novamente.',
        variant: 'error',
      });
    }
  }, [attemptId, questions.length, router, toast]);

  // Cronômetro regressivo ancorado no timestamp do servidor
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalize();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleFinalize]);

  async function persistAnswerState(
    examQuestionId: string,
    updates: {
      selectedLabel?: 'A' | 'B' | 'C' | 'D' | null;
      markedForReview?: boolean;
    }
  ) {
    setSavingStatus('saving');
    try {
      const res = await fetch(`/api/exams/${attemptId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examQuestionId,
          ...updates,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.expired) {
          toast({
            title: 'Tempo expirado',
            description: 'Redirecionando para o resultado...',
            variant: 'info',
          });
          router.push(`/simulados/${attemptId}/resultado`);
          return;
        }
        setSavingStatus('offline');
        return;
      }

      if (typeof json.remainingSeconds === 'number') {
        setRemainingSeconds(json.remainingSeconds);
      }
      setSavingStatus('saved');
    } catch {
      setSavingStatus('offline');
    }
  }

  function handleSelectOption(label: 'A' | 'B' | 'C' | 'D') {
    if (!currentQuestion || submittingExam) return;

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === currentQuestion.id ? { ...q, selectedLabel: label } : q
      )
    );
    persistAnswerState(currentQuestion.id, { selectedLabel: label });
  }

  function handleToggleReview() {
    if (!currentQuestion || submittingExam) return;
    const nextReview = !currentQuestion.markedForReview;

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === currentQuestion.id ? { ...q, markedForReview: nextReview } : q
      )
    );
    persistAnswerState(currentQuestion.id, { markedForReview: nextReview });
  }

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      {/* Barra Superior da Prova: Cronômetro, Status de Persistência e Indicadores */}
      <Card className="border-indigo-500/30">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold">{title}</h1>
              {usedRepeatedQuestions && (
                <Badge variant="warning">Contém questões já vistas</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>
                Respondidas:{' '}
                <strong className="text-emerald-400">{answeredCount}</strong>
              </span>
              <span>
                Não respondidas:{' '}
                <strong className="text-amber-400">{unansweredCount}</strong>
              </span>
              <span>
                Para revisão:{' '}
                <strong className="text-violet-400">{markedCount}</strong>
              </span>
              {savingStatus === 'saving' && (
                <span className="text-indigo-400">Salvando no servidor...</span>
              )}
              {savingStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Salvo
                </span>
              )}
              {savingStatus === 'offline' && (
                <span className="inline-flex items-center gap-1 text-rose-400">
                  <WifiOff className="h-3.5 w-3.5" />
                  Conexão instável (clique novamente para reenviar)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              aria-label="Cronômetro da prova"
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-base font-extrabold',
                remainingSeconds <= 300
                  ? 'border-rose-500/50 bg-rose-500/15 text-rose-400 animate-pulse'
                  : 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
              )}
            >
              <Clock className="h-4 w-4" />
              <span>{formatDurationSeconds(remainingSeconds)}</span>
            </div>

            <Button
              type="button"
              variant="default"
              disabled={submittingExam}
              onClick={() => setConfirmOpen(true)}
            >
              <Send className="h-4 w-4" />
              Finalizar Prova
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Coluna Principal: Questão Atual */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border/80">
            <CardHeader className="border-b border-border/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">
                    Questão {currentQuestion.orderIndex} de {questions.length}
                  </Badge>
                  <Badge variant="outline">
                    Cap. {currentQuestion.chapterNumber} ({currentQuestion.topicCode})
                  </Badge>
                  <Badge variant="purple">
                    {currentQuestion.learningObjective} (
                    {currentQuestion.cognitiveLevel})
                  </Badge>
                </div>

                <Button
                  type="button"
                  variant={currentQuestion.markedForReview ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={handleToggleReview}
                >
                  <Flag
                    className={cn(
                      'h-4 w-4',
                      currentQuestion.markedForReview && 'text-amber-400 fill-amber-400'
                    )}
                  />
                  {currentQuestion.markedForReview
                    ? 'Marcada para Revisão'
                    : 'Marcar para Revisão'}
                </Button>
              </div>

              <CardTitle className="pt-4 whitespace-pre-line text-base font-medium leading-relaxed">
                {currentQuestion.statement}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 pt-6">
              {currentQuestion.options.map((opt) => {
                const isSelected =
                  currentQuestion.selectedLabel === opt.displayLabel;
                return (
                  <button
                    key={opt.displayLabel}
                    type="button"
                    onClick={() => handleSelectOption(opt.displayLabel)}
                    className={cn(
                      'flex w-full items-start gap-3.5 rounded-xl border p-4 text-left text-sm transition-all',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/20 font-medium shadow-sm'
                        : 'border-border/70 bg-background/40 hover:border-indigo-500/40'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold',
                        isSelected
                          ? 'border-indigo-400 bg-indigo-600 text-white'
                          : 'border-border bg-secondary text-foreground'
                      )}
                    >
                      {opt.displayLabel}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{opt.content}</span>
                  </button>
                );
              })}

              {/* Navegação Anterior / Próxima */}
              <div className="flex items-center justify-between border-t border-border/60 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Questão Anterior
                </Button>

                {currentIndex < questions.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((i) =>
                        Math.min(questions.length - 1, i + 1)
                      )
                    }
                  >
                    Próxima Questão
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="success"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Send className="h-4 w-4" />
                    Revisar e Finalizar Prova
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral: Mapa de Questões */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">
                Mapa de Navegação ({questions.length} Questões)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = Boolean(q.selectedLabel);
                  const isMarked = q.markedForReview;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      aria-label={`Ir para questão ${q.orderIndex}`}
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        'relative flex h-9 w-full items-center justify-center rounded-lg border text-xs font-bold transition',
                        isCurrent && 'ring-2 ring-indigo-500 ring-offset-1',
                        isAnswered
                          ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                          : 'border-border bg-secondary/40 text-muted-foreground',
                        isMarked && 'border-amber-500/60'
                      )}
                    >
                      {q.orderIndex}
                      {isMarked && (
                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-emerald-500/40 bg-emerald-500/20" />
                  <span>Respondida ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-border bg-secondary/40" />
                  <span>Não respondida ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span>Marcada para revisão ({markedCount})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmação de Finalização */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleFinalize}
        isLoading={submittingExam}
        title="Confirmar Finalização do Simulado"
        description={
          unansweredCount > 0
            ? `Atenção: você ainda possui ${unansweredCount} questão(ões) sem resposta e ${markedCount} marcada(s) para revisão. Após finalizar, suas respostas serão enviadas definitivamente para correção.`
            : 'Você respondeu todas as questões da prova. Deseja encerrar a tentativa e visualizar seu resultado completo e gabarito comentado?'
        }
        confirmLabel="Confirmar e Corrigir Prova"
        cancelLabel="Continuar Respondendo"
      />
    </div>
  );
}
