'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  BookOpen,
  Code2,
  Briefcase,
  Sparkles,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/providers/toast-provider';
import { cn } from '@/lib/utils';

export interface LessonData {
  id: string;
  slug: string;
  title: string;
  explanation: string;
  definitions: { term: string; definition: string }[];
  practicalExamples: string;
  qaRoutineExamples: string;
  summary: string;
  estimatedMinutes: number;
  isCompleted: boolean;
}

export interface TopicExerciseQuestion {
  id: string;
  code: string;
  statement: string;
  learningObjectiveCode: string;
  cognitiveLevel: string;
  difficulty: string;
  options: {
    label: string;
    content: string;
  }[];
}

interface ExerciseFeedback {
  isCorrect: boolean;
  correctOptionLabel: string;
  explanation: string;
  referenceSection: string;
  options: {
    label: string;
    isCorrect: boolean;
    justification?: string | null;
  }[];
  xpAwarded: number;
}

export function LessonViewer({
  lesson,
  exercises,
}: {
  lesson: LessonData;
  exercises: TopicExerciseQuestion[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [completed, setCompleted] = React.useState(lesson.isCompleted);
  const [completing, setCompleting] = React.useState(false);

  const [selectedOptions, setSelectedOptions] = React.useState<
    Record<string, string>
  >({});
  const [submittingQuestionId, setSubmittingQuestionId] = React.useState<
    string | null
  >(null);
  const [feedbacks, setFeedbacks] = React.useState<
    Record<string, ExerciseFeedback>
  >({});

  async function handleCompleteLesson() {
    setCompleting(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao concluir aula',
          description: json.error || 'Tente novamente.',
          variant: 'error',
        });
        return;
      }

      setCompleted(true);
      toast({
        title: 'Aula concluída com sucesso!',
        description:
          json.xpAwarded > 0
            ? `Você ganhou +${json.xpAwarded} XP!`
            : 'Seu progresso neste tópico foi atualizado.',
        variant: 'success',
      });
      router.refresh();
    } finally {
      setCompleting(false);
    }
  }

  async function handleAnswerExercise(questionId: string) {
    const selectedLabel = selectedOptions[questionId];
    if (!selectedLabel) return;

    setSubmittingQuestionId(questionId);
    try {
      const res = await fetch('/api/exercises/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, selectedLabel }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao enviar resposta',
          description: json.error || 'Tente novamente.',
          variant: 'error',
        });
        return;
      }

      setFeedbacks((prev) => ({ ...prev, [questionId]: json }));
      toast({
        title: json.isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta',
        description:
          json.xpAwarded > 0
            ? `+${json.xpAwarded} XP adicionados ao seu perfil.`
            : 'Consulte a explicação detalhada abaixo.',
        variant: json.isCorrect ? 'success' : 'info',
      });
      router.refresh();
    } finally {
      setSubmittingQuestionId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Conteúdo Principal da Aula */}
      <Card className="border-indigo-500/30">
        <CardHeader className="border-b border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="default">
              Tempo estimado de leitura: {lesson.estimatedMinutes} min
            </Badge>
            {completed && (
              <Badge variant="success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Aula Concluída
              </Badge>
            )}
          </div>
          <CardTitle className="pt-2 text-2xl font-bold">
            {lesson.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          {/* Explicação Didática */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-bold text-indigo-400">
              <BookOpen className="h-5 w-5" />
              Explicação Didática
            </h3>
            <div className="whitespace-pre-line rounded-xl border border-border/60 bg-background/40 p-5 text-sm leading-relaxed">
              {lesson.explanation}
            </div>
          </section>

          {/* Definições Formais do Glossário */}
          {lesson.definitions.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-base font-bold text-violet-400">
                Definições Formais (Glossário ISTQB)
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {lesson.definitions.map((def) => (
                  <div
                    key={def.term}
                    className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4"
                  >
                    <p className="text-xs font-bold text-violet-300">
                      {def.term}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {def.definition}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Exemplos Práticos */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-bold text-emerald-400">
              <Code2 className="h-5 w-5" />
              Exemplos Práticos (Web, APIs e Bancos de Dados)
            </h3>
            <div className="whitespace-pre-line rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-sm leading-relaxed">
              {lesson.practicalExamples}
            </div>
          </section>

          {/* Exemplos Relacionados à Rotina de QA */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-bold text-amber-400">
              <Briefcase className="h-5 w-5" />
              Aplicação na Rotina Real de QA
            </h3>
            <div className="whitespace-pre-line rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-relaxed">
              {lesson.qaRoutineExamples}
            </div>
          </section>

          {/* Resumo de Fixação */}
          <section className="space-y-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-indigo-300">
              <Sparkles className="h-4 w-4" />
              Resumo Essencial para a Prova
            </h3>
            <p className="text-sm leading-relaxed">{lesson.summary}</p>
          </section>

          {/* Botão de Concluir Aula */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div>
              <p className="text-sm font-semibold">
                {completed
                  ? 'Você já concluiu o estudo desta aula!'
                  : 'Finalizou a leitura desta aula?'}
              </p>
              <p className="text-xs text-muted-foreground">
                Marque como concluída para registrar seu progresso no tópico e
                receber +30 XP.
              </p>
            </div>
            <Button
              type="button"
              variant={completed ? 'success' : 'default'}
              onClick={handleCompleteLesson}
              isLoading={completing}
            >
              <CheckCircle2 className="h-4 w-4" />
              {completed ? 'Aula Concluída (+30 XP)' : 'Concluir Aula (+30 XP)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exercícios de Fixação do Tópico */}
      <div className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <CheckSquare className="h-5 w-5 text-indigo-400" />
            Exercícios de Fixação deste Tópico ({exercises.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Resolva as questões abaixo para validar imediatamente seu domínio
            dos Objetivos de Aprendizagem estudados
          </p>
        </div>

        {exercises.map((q, idx) => {
          const selected = selectedOptions[q.id];
          const fb = feedbacks[q.id];

          return (
            <Card key={q.id} className="border-border/80">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Exercício {idx + 1}</Badge>
                    <Badge variant="outline">{q.code}</Badge>
                    <Badge variant="purple">
                      {q.learningObjectiveCode} ({q.cognitiveLevel})
                    </Badge>
                  </div>
                  <Badge variant="secondary">{q.difficulty}</Badge>
                </div>
                <CardDescription className="pt-3 whitespace-pre-line text-sm font-medium text-foreground leading-relaxed">
                  {q.statement}
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
                          'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-all',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/15'
                            : 'border-border/70 bg-background/40 hover:border-indigo-500/40',
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
                          <p>{opt.content}</p>
                          {optFb?.justification && (
                            <p className="text-xs text-muted-foreground pt-1">
                              {optFb.justification}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={!selected}
                    isLoading={submittingQuestionId === q.id}
                    onClick={() => handleAnswerExercise(q.id)}
                  >
                    Verificar Resposta
                  </Button>
                </div>

                {fb && (
                  <div
                    className={cn(
                      'rounded-xl border p-4 text-xs space-y-1.5',
                      fb.isCorrect
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                        : 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                    )}
                  >
                    <p className="font-bold flex items-center gap-1.5 text-sm">
                      {fb.isCorrect ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Correto! Gabarito: Alternativa {fb.correctOptionLabel}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-amber-400" />
                          Incorreto. O gabarito correto é a Alternativa{' '}
                          {fb.correctOptionLabel}
                        </>
                      )}
                    </p>
                    <p className="leading-relaxed">{fb.explanation}</p>
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
    </div>
  );
}
