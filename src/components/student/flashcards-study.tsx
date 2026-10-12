'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  RotateCcw,
  Shuffle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
import { formatDateBR } from '@/lib/utils';

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

  async function handleRate(rating: 'EASY' | 'MEDIUM' | 'HARD') {
    if (!currentCard) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: currentCard.id,
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
          item.id === currentCard.id
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

      toast({
        title: `Cartão marcado como ${
          rating === 'EASY'
            ? 'Fácil'
            : rating === 'MEDIUM'
            ? 'Médio'
            : 'Difícil'
        }`,
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

  return (
    <div className="space-y-6">
      {/* Resumo de Evolução */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total de Cartões</p>
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Já Estudados</p>
            <p className="mt-1 text-2xl font-bold text-indigo-400">
              {stats.reviewed}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Dominados (Mastered)</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {stats.mastered}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Para Rever Hoje</p>
            <p className="mt-1 text-2xl font-bold text-amber-400">
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
                  }}
                >
                  <option value="ALL">Todos os Capítulos (1 a 6)</option>
                  {chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      Cap. {ch.number} — {ch.title}
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
                  }}
                >
                  <option value="ALL">Todos os Cartões do Filtro</option>
                  <option value="DUE_ONLY">
                    Somente Cartões Pendentes para Rever Hoje
                  </option>
                </Select>
              </div>
            </div>

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
              Estudar Cartões Aleatórios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Área do Cartão */}
      {!currentCard ? (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
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
        <Card className="border-indigo-500/30 shadow-xl">
          <CardHeader className="border-b border-border/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">
                  Cartão {currentIndex + 1} de {deck.length}
                </Badge>
                <Badge variant="outline">
                  Cap. {currentCard.chapterNumber} • Tópico{' '}
                  {currentCard.topicCode}
                </Badge>
                <Badge variant="secondary">{currentCard.difficulty}</Badge>
                {currentCard.tags.map((tag) => (
                  <Badge key={tag} variant="purple">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {currentCard.review ? (
                  <>
                    <Badge variant="success">
                      Estado: {currentCard.review.state}
                    </Badge>
                    <span>
                      Última: {formatDateBR(currentCard.review.reviewedAt)} •
                      Próxima: {formatDateBR(currentCard.review.nextReviewAt)}
                    </span>
                  </>
                ) : (
                  <Badge variant="warning">Novo Cartão</Badge>
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
              className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-background to-violet-950/20 p-8 text-center transition hover:border-indigo-400"
            >
              <span className="mb-3 rounded-full border border-border px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
                {flipped ? 'Verso (Resposta Oficial)' : 'Frente (Pergunta)'}
              </span>
              <p className="max-w-2xl text-base sm:text-lg font-semibold leading-relaxed">
                {flipped ? currentCard.back : currentCard.front}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                Clique no cartão para virar ({flipped ? 'ver frente' : 'ver resposta'})
              </span>
            </div>

            {/* Botões de Repetição Espaçada */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-4 sm:flex-row">
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
                >
                  Difícil (Rever em 1d)
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleRate('MEDIUM')}
                >
                  Médio
                </Button>
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleRate('EASY')}
                >
                  Fácil (Dominado)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
