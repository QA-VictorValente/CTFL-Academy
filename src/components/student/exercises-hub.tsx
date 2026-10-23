'use client';

import * as React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { useToast } from '@/components/providers/toast-provider';
import { cn } from '@/lib/utils';
import { InlineMarkdown, FormattedText } from '@/components/ui/formatted-text';

export interface ExerciseHubItem {
  id: string;
  code: string;
  statement: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  topicId: string;
  topicCode: string;
  topicTitle: string;
  learningObjectiveCode: string;
  cognitiveLevel: string;
  difficulty: string;
  options: {
    label: string;
    content: string;
  }[];
}

interface FeedbackResult {
  isCorrect: boolean;
  correctOptionLabel: string;
  explanation: string;
  referenceSection: string;
  options: {
    label: string;
    isCorrect: boolean;
    justification?: string | null;
  }[];
}

export function ExercisesHub({
  chapters,
  questions,
  initialChapterId,
}: {
  chapters: { id: string; number: number; title: string }[];
  questions: ExerciseHubItem[];
  initialChapterId?: string;
}) {
  const { toast } = useToast();
  const [chapterFilter, setChapterFilter] = React.useState(
    initialChapterId || 'ALL'
  );
  const [difficultyFilter, setDifficultyFilter] = React.useState('ALL');
  const [kLevelFilter, setKLevelFilter] = React.useState('ALL');
  const [page, setPage] = React.useState(1);

  const [selectedOptions, setSelectedOptions] = React.useState<
    Record<string, string>
  >({});
  const [submittingId, setSubmittingId] = React.useState<string | null>(null);
  const [feedbacks, setFeedbacks] = React.useState<
    Record<string, FeedbackResult>
  >({});

  const filtered = React.useMemo(() => {
    return questions.filter((q) => {
      if (chapterFilter !== 'ALL' && q.chapterId !== chapterFilter) return false;
      if (difficultyFilter !== 'ALL' && q.difficulty !== difficultyFilter)
        return false;
      if (kLevelFilter !== 'ALL' && q.cognitiveLevel !== kLevelFilter)
        return false;
      return true;
    });
  }, [questions, chapterFilter, difficultyFilter, kLevelFilter]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleVerify(questionId: string) {
    const selectedLabel = selectedOptions[questionId];
    if (!selectedLabel) return;

    setSubmittingId(questionId);
    try {
      const res = await fetch('/api/exercises/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, selectedLabel }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao validar resposta',
          description: json.error || 'Tente novamente.',
          variant: 'error',
        });
        return;
      }

      setFeedbacks((prev) => ({ ...prev, [questionId]: json }));
      toast({
        title: json.isCorrect ? 'Acertou!' : 'Resposta Incorreta',
        description:
          json.xpAwarded > 0
            ? `+${json.xpAwarded} XP conquistados!`
            : 'Veja a justificativa de cada alternativa abaixo.',
        variant: json.isCorrect ? 'success' : 'info',
      });
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <label
                htmlFor="filter-chapter"
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"
              >
                <Filter className="h-3.5 w-3.5" />
                Capítulo
              </label>
              <Select
                id="filter-chapter"
                value={chapterFilter}
                onChange={(e) => {
                  setChapterFilter(e.target.value);
                  setPage(1);
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
                htmlFor="filter-klevel"
                className="text-xs font-semibold text-muted-foreground"
              >
                Nível Cognitivo
              </label>
              <Select
                id="filter-klevel"
                value={kLevelFilter}
                onChange={(e) => {
                  setKLevelFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">Todos (K1, K2, K3)</option>
                <option value="K1">K1 - Lembrar</option>
                <option value="K2">K2 - Compreender</option>
                <option value="K3">K3 - Aplicar</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="filter-difficulty"
                className="text-xs font-semibold text-muted-foreground"
              >
                Dificuldade
              </label>
              <Select
                id="filter-difficulty"
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">Todas as Dificuldades</option>
                <option value="EASY">Fácil (EASY)</option>
                <option value="MEDIUM">Médio (MEDIUM)</option>
                <option value="HARD">Difícil (HARD)</option>
              </Select>
            </div>

            <div className="flex items-end">
              <p className="text-xs text-muted-foreground pb-2">
                Exibindo <strong>{filtered.length}</strong> questões de fixação
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Exercícios */}
      <div className="space-y-5">
        {currentItems.map((q) => {
          const selected = selectedOptions[q.id];
          const fb = feedbacks[q.id];

          return (
            <Card key={q.id} className="border-border/80">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="default">Cap. {q.chapterNumber}</Badge>
                    <Badge variant="outline">Tópico {q.topicCode}</Badge>
                    <Badge variant="secondary">
                      {q.learningObjectiveCode} ({q.cognitiveLevel})
                    </Badge>
                    <Badge variant="secondary">{q.code}</Badge>
                  </div>
                  <Badge variant="outline">{q.difficulty}</Badge>
                </div>
                <CardDescription className="pt-3 text-sm font-medium text-foreground leading-relaxed">
                  <InlineMarkdown text={q.statement} />
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2.5">
                  {q.options.map((opt) => {
                    const isSelected = selected === opt.label;
                    const optFb = fb?.options.find(
                      (o) => o.label === opt.label
                    );

                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() =>
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [q.id]: opt.label,
                          }))
                        }
                        className={cn(
                          'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border/70 bg-background/40 hover:border-primary/40',
                          fb &&
                            opt.label === fb.correctOptionLabel &&
                            'border-emerald-500 bg-emerald-500/15',
                          fb &&
                            isSelected &&
                            opt.label !== fb.correctOptionLabel &&
                            'border-rose-500 bg-rose-500/15'
                        )}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border font-bold text-xs">
                          {opt.label}
                        </span>
                        <div className="flex-1 space-y-1">
                          <p><InlineMarkdown text={opt.content} /></p>
                          {optFb?.justification && (
                            <p className="text-xs text-muted-foreground pt-1">
                              <InlineMarkdown text={optFb.justification} />
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  size="sm"
                  disabled={!selected}
                  isLoading={submittingId === q.id}
                  onClick={() => handleVerify(q.id)}
                >
                  Confirmar Resposta
                </Button>

                {fb && (
                  <div
                    className={cn(
                      'rounded-xl border p-4 text-xs space-y-1.5',
                      fb.isCorrect
                        ? 'border-emerald-500/35 bg-emerald-500/10 text-foreground'
                        : 'border-amber-500/35 bg-amber-500/10 text-foreground'
                    )}
                  >
                    <p className="font-bold flex items-center gap-1.5 text-sm">
                      {fb.isCorrect ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Correto! Gabarito: Alternativa {fb.correctOptionLabel}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          Incorreto. Gabarito correto: Alternativa{' '}
                          {fb.correctOptionLabel}
                        </>
                      )}
                    </p>
                    <div className="leading-relaxed">
                      <FormattedText text={fb.explanation} />
                    </div>
                    <p className="opacity-80">
                      Referência: {fb.referenceSection}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(nextPage) => setPage(nextPage)}
      />
    </div>
  );
}
