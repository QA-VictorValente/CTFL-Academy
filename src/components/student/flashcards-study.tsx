'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  RotateCcw,
  Shuffle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Undo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/providers/toast-provider';
import { formatDateBR, cn } from '@/lib/utils';
import { FormattedText } from '@/components/ui/formatted-text';

export interface FlashcardStudyItem {
  id: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  topicId: string;
  topicCode: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: string;
  review: {
    rating: string;
    state: string;
    intervalDays: number;
    repetitions: number;
    reviewedAt: string;
    nextReviewAt: string;
  } | null;
}

interface LastRatedAction {
  cardId: string;
  cardIndex: number;
  previousReview: FlashcardStudyItem['review'];
  ratingApplied: 'EASY' | 'MEDIUM' | 'HARD';
}

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Fácil',
  MEDIUM: 'Médio',
  HARD: 'Difícil',
};

export function FlashcardsStudy({
  chapters,
  flashcards,
  initialChapterId,
}: {
  chapters: { id: string; number: number; title: string }[];
  flashcards: FlashcardStudyItem[];
  initialChapterId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [chapterFilter, setChapterFilter] = React.useState(
    initialChapterId || 'ALL'
  );
  const [modeFilter, setModeFilter] = React.useState<'ALL' | 'DUE_ONLY'>('ALL');
  const [randomSeed, setRandomSeed] = React.useState(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [itemsState, setItemsState] =
    React.useState<FlashcardStudyItem[]>(flashcards);
  const [lastRatedAction, setLastRatedAction] =
    React.useState<LastRatedAction | null>(null);

  const deck = React.useMemo(() => {
    const now = Date.now();
    let list = itemsState.filter((fc) => {
      if (chapterFilter !== 'ALL' && fc.chapterId !== chapterFilter)
        return false;
      if (modeFilter === 'DUE_ONLY') {
        if (!fc.review) return true;
        return new Date(fc.review.nextReviewAt).getTime() <= now;
      }
      return true;
    });

    if (randomSeed > 0) {
      list = [...list].sort(() => Math.random() - 0.5);
    }

    return list;
  }, [itemsState, chapterFilter, modeFilter, randomSeed]);

  const currentCard = deck[currentIndex] || null;

  const stats = React.useMemo(() => {
    const now = Date.now();
    let reviewed = 0;
    let mastered = 0;
    let dueCount = 0;

    for (const fc of itemsState) {
      if (!fc.review) {
        dueCount += 1;
      } else {
        reviewed += 1;
        if (fc.review.state === 'MASTERED') mastered += 1;
        if (new Date(fc.review.nextReviewAt).getTime() <= now) {
          dueCount += 1;
        }
      }
    }

    return {
      total: itemsState.length,
      reviewed,
      mastered,
      dueCount,
    };
  }, [itemsState]);

  // Informações de exibição do estado em Português com cores dinâmicas
  const stateInfo = React.useMemo(() => {
    if (!currentCard?.review) {
      return {
        label: 'Novo Cartão',
        className: 'border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold',
        dotColor: 'bg-sky-400',
        description: 'Nunca respondido',
      };
    }

    const isHard =
      currentCard.review.rating === 'HARD' ||
      currentCard.review.state === 'LEARNING';
    const isMedium =
      currentCard.review.rating === 'MEDIUM' ||
      currentCard.review.state === 'REVIEW';
    const isEasy =
      currentCard.review.rating === 'EASY' ||
      currentCard.review.state === 'MASTERED';

    if (isHard) {
      return {
        label: 'Difícil (Aprendendo)',
        className:
          'border-rose-500/45 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold',
        dotColor: 'bg-rose-500',
        description: 'Revisão prioritária em 1 dia',
      };
    }

    if (isMedium) {
      return {
        label: 'Médio (Em Revisão)',
        className:
          'border-amber-500/45 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold',
        dotColor: 'bg-amber-400',
        description: 'Em fixação espaçada',
      };
    }

    if (isEasy) {
      return {
        label: 'Fácil (Dominado)',
        className:
          'border-emerald-500/45 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold',
        dotColor: 'bg-emerald-400',
        description: 'Conceito bem fixado',
      };
    }

    return {
      label: 'Novo Cartão',
      className: 'border-sky-500/40 bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold',
      dotColor: 'bg-sky-400',
      description: 'Nunca respondido',
    };
  }, [currentCard?.review]);

  // Avaliar cartão
  async function handleRate(rating: 'EASY' | 'MEDIUM' | 'HARD') {
    if (!currentCard || submitting) return;
    setSubmitting(true);

    const prevReview = currentCard.review;
    const cardId = currentCard.id;
    const cardIdx = currentIndex;

    try {
      const res = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: cardId,
          rating,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao salvar revisão',
          description: json.error || 'Tente novamente.',
          variant: 'error',
        });
        return;
      }

      setItemsState((prev) =>
        prev.map((item) =>
          item.id === cardId
            ? {
                ...item,
                review: {
                  rating: json.review.rating,
                  state: json.review.state,
                  intervalDays: json.review.intervalDays,
                  repetitions: json.review.repetitions,
                  reviewedAt: json.review.reviewedAt,
                  nextReviewAt: json.review.nextReviewAt,
                },
              }
            : item
        )
      );

      // Armazena a ação para permitir "Desfazer" imediatamente
      setLastRatedAction({
        cardId,
        cardIndex: cardIdx,
        previousReview: prevReview,
        ratingApplied: rating,
      });

      const ratingPt =
        rating === 'EASY'
          ? 'Fácil'
          : rating === 'MEDIUM'
          ? 'Médio'
          : 'Difícil';

      toast({
        title: `Cartão marcado como ${ratingPt}`,
        description: `Próxima revisão agendada para daqui a ${json.review.intervalDays} dia(s).`,
        variant: 'success',
      });

      setFlipped(false);
      if (currentIndex < deck.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  // Redefinir completamente o cartão para "Novo" (como se nunca tivesse sido respondido)
  async function handleResetCard(flashcardId: string) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/flashcards/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcardId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao redefinir cartão',
          description: json.error || 'Tente novamente.',
          variant: 'error',
        });
        return;
      }

      setItemsState((prev) =>
        prev.map((item) =>
          item.id === flashcardId
            ? {
                ...item,
                review: null,
              }
            : item
        )
      );

      if (lastRatedAction?.cardId === flashcardId) {
        setLastRatedAction(null);
      }

      setFlipped(false);

      toast({
        title: 'Cartão redefinido para Novo!',
        description:
          'Histórico zerado com sucesso. O cartão agora está como se nunca tivesse sido respondido.',
        variant: 'info',
      });

      router.refresh();
    } catch {
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível redefinir o cartão.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Desfazer a última resposta (caso tenha clicado sem querer)
  const handleUndoLastRating = React.useCallback(async () => {
    if (!lastRatedAction || submitting) return;
    const { cardId, cardIndex: targetIdx, previousReview } = lastRatedAction;

    setSubmitting(true);
    try {
      if (!previousReview) {
        // Antes era um cartão NOVO -> reset completo no backend
        const res = await fetch('/api/flashcards/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flashcardId: cardId }),
        });
        if (!res.ok) throw new Error('Falha ao resetar');

        setItemsState((prev) =>
          prev.map((item) =>
            item.id === cardId ? { ...item, review: null } : item
          )
        );
      } else {
        // Antes já tinha um estado anterior -> reverte a avaliação
        const res = await fetch('/api/flashcards/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flashcardId: cardId,
            rating: previousReview.rating,
          }),
        });
        if (!res.ok) throw new Error('Falha ao restaurar');

        setItemsState((prev) =>
          prev.map((item) =>
            item.id === cardId ? { ...item, review: previousReview } : item
          )
        );
      }

      // Volta a visualização para o cartão que foi alterado
      setCurrentIndex(targetIdx);
      setFlipped(false);
      setLastRatedAction(null);

      toast({
        title: 'Ação desfeita com sucesso!',
        description: !previousReview
          ? 'O cartão voltou a ser Novo, exatamente como antes do clique.'
          : 'O cartão foi restaurado para a avaliação anterior.',
        variant: 'success',
      });

      router.refresh();
    } catch {
      toast({
        title: 'Erro ao desfazer',
        description: 'Não foi possível restaurar o estado do cartão.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }, [lastRatedAction, submitting, toast, router]);

  // Atalhos de teclado (Ctrl+Z para desfazer, etc.)
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeTag = (e.target as HTMLElement)?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        return;
      }

      // Ctrl+Z para Desfazer
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (lastRatedAction && !submitting) {
          handleUndoLastRating();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastRatedAction, submitting, handleUndoLastRating]);

  return (
    <div className="space-y-6">
      {/* Resumo de Evolução */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total de Cartões</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Já Estudados</p>
            <p className="mt-1 text-2xl font-bold text-primary tabular-nums">
              {stats.reviewed}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Dominados</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {stats.mastered}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Para Rever Hoje</p>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {stats.dueCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Estudo */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 flex-1">
              <div className="space-y-1">
                <label
                  htmlFor="fc-chapter"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Filtrar por Capítulo
                </label>
                <Select
                  id="fc-chapter"
                  value={chapterFilter}
                  onChange={(e) => {
                    setChapterFilter(e.target.value);
                    setCurrentIndex(0);
                    setFlipped(false);
                    setLastRatedAction(null);
                  }}
                >
                  <option value="ALL">Todos os Capítulos (1 a 6)</option>
                  {chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      Cap. {ch.number} - {ch.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="fc-mode"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Fila de Revisão
                </label>
                <Select
                  id="fc-mode"
                  value={modeFilter}
                  onChange={(e) => {
                    setModeFilter(e.target.value as 'ALL' | 'DUE_ONLY');
                    setCurrentIndex(0);
                    setFlipped(false);
                    setLastRatedAction(null);
                  }}
                >
                  <option value="ALL">Todos os Cartões do Filtro</option>
                  <option value="DUE_ONLY">
                    Somente Cartões Pendentes para Rever Hoje
                  </option>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lastRatedAction && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUndoLastRating}
                  disabled={submitting}
                  className="border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                  title="Desfazer última avaliação (Atalho: Ctrl+Z)"
                >
                  <Undo2 className="h-4 w-4 mr-1.5 text-primary" />
                  Desfazer última avaliação
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRandomSeed((s) => s + 1);
                  setCurrentIndex(0);
                  setFlipped(false);
                }}
              >
                <Shuffle className="h-4 w-4" />
                Embaralhar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área do Cartão */}
      {!currentCard ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-bold">
              Nenhum cartão pendente neste filtro!
            </h3>
            <p className="text-xs text-muted-foreground">
              Altere o filtro para &ldquo;Todos os Cartões&rdquo; para continuar
              praticando livremente.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModeFilter('ALL')}
            >
              Mostrar Todos os Cartões
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/25">
          <CardHeader className="bg-secondary/25 rounded-t-2xl pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Badges de Identificação */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">
                  Cartão {currentIndex + 1} de {deck.length}
                </Badge>
                <Badge variant="outline">
                  Cap. {currentCard.chapterNumber} • Tópico{' '}
                  {currentCard.topicCode}
                </Badge>
                <Badge variant="secondary">
                  Nível {DIFFICULTY_LABELS[currentCard.difficulty] || currentCard.difficulty}
                </Badge>
                {currentCard.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Status do Flashcard Dinâmico (Vermelho / Amarelo / Verde / Novo) */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
                    stateInfo.className
                  )}
                  title={stateInfo.description}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      stateInfo.dotColor
                    )}
                  />
                  <span>
                    Estado: <strong>{stateInfo.label}</strong>
                  </span>
                </div>

                {currentCard.review ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden md:inline">
                      Próxima: {formatDateBR(currentCard.review.nextReviewAt)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={submitting}
                      onClick={() => handleResetCard(currentCard.id)}
                      className="h-7 rounded-lg border border-border/50 px-2.5 text-xs text-muted-foreground hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Clique caso tenha clicado por engano ou queira zerar o cartão para Novo"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Voltar para Novo
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    Cartão inédito
                  </span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-10 space-y-6">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setFlipped(!flipped)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFlipped(!flipped);
                }
              }}
              className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-primary/25 bg-secondary/35 p-8 text-center transition-colors hover:border-primary/50"
            >
              <span className="mb-3 rounded-full border border-border px-3 py-0.5 text-xs font-semibold text-primary">
                {flipped ? 'Verso (Resposta Oficial)' : 'Frente (Pergunta)'}
              </span>
              <FormattedText
                text={flipped ? currentCard.back : currentCard.front}
                className="max-w-2xl text-base sm:text-lg font-semibold leading-relaxed"
              />
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                Clique no cartão para virar ({flipped ? 'ver frente' : 'ver resposta'})
              </span>
            </div>

            {/* Botões de Navegação e Avaliação de Repetição Espaçada */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-secondary/35 p-3.5 sm:flex-row">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentIndex <= 0}
                  onClick={() => {
                    setCurrentIndex((i) => Math.max(0, i - 1));
                    setFlipped(false);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipped(!flipped)}
                >
                  <RotateCcw className="h-4 w-4" />
                  Virar Cartão
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentIndex >= deck.length - 1}
                  onClick={() => {
                    setCurrentIndex((i) => Math.min(deck.length - 1, i + 1));
                    setFlipped(false);
                  }}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">
                  Avalie seu domínio:
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleRate('HARD')}
                  title="Marca como Difícil: Estado vira Difícil (Aprendendo) em Vermelho"
                  className="font-medium"
                >
                  Difícil (Rever em 1d)
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleRate('MEDIUM')}
                  title="Marca como Médio: Estado vira Médio (Em Revisão) em Amarelo"
                  className="border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 font-medium"
                >
                  Médio
                </Button>
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleRate('EASY')}
                  title="Marca como Fácil: Estado vira Fácil (Dominado) em Verde"
                  className="font-medium"
                >
                  Fácil (Dominado)
                </Button>

                {currentCard.review && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={submitting}
                    onClick={() => handleResetCard(currentCard.id)}
                    className="text-xs text-muted-foreground hover:text-rose-400"
                    title="Zerar resposta e voltar este cartão para Novo"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Resetar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
