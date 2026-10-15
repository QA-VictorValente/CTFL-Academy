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
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowLeft,
  Layers,
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
import {
  FormattedText,
  InlineMarkdown,
  type FontSizeOption,
} from '@/components/ui/formatted-text';
import {
  InteractiveGlossary,
  InlineCheckpoint,
  AudioLessonPlayer,
  InteractivePracticalLab,
  type MicroCheckpointQuestion,
} from '@/components/student/lesson-interactive-features';

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

type StudyMode = 'TRACK' | 'FULL';

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

  // Tamanho de Fonte (Padrão inicial 'lg' para não ficar pequeno)
  const [fontSize, setFontSize] = React.useState<FontSizeOption>('lg');

  // Modo de visualização: Trilha Interativa (Passo a Passo) ou Leitura Contínua
  const [studyMode, setStudyMode] = React.useState<StudyMode>('TRACK');
  const [currentStep, setCurrentStep] = React.useState(1);

  // Modo foco tela cheia
  const [focusMode, setFocusMode] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Barra de progresso de rolagem
  const [scrollProgress, setScrollProgress] = React.useState(0);

  // Alterna Modo Foco Tela Cheia
  const toggleFocusMode = React.useCallback(() => {
    setFocusMode((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        if (next) {
          const target = containerRef.current || document.documentElement;
          if (target && target.requestFullscreen) {
            target.requestFullscreen().catch(() => {});
          }
        } else {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        }
      }
      return next;
    });
  }, []);

  // Sincroniza estado de fullscreen e classe no body para ocultar elementos externos
  React.useEffect(() => {
    if (focusMode) {
      document.body.classList.add('ctfl-fullscreen-active');
    } else {
      document.body.classList.remove('ctfl-fullscreen-active');
    }

    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        setFocusMode(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && focusMode) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        setFocusMode(false);
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('ctfl-fullscreen-active');
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusMode]);

  // Estados dos Exercícios do Tópico
  const [selectedOptions, setSelectedOptions] = React.useState<
    Record<string, string>
  >({});
  const [submittingQuestionId, setSubmittingQuestionId] = React.useState<
    string | null
  >(null);
  const [feedbacks, setFeedbacks] = React.useState<
    Record<string, ExerciseFeedback>
  >({});

  // Recupera preferência de fonte salva no navegador
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('ctfl_font_size') as FontSizeOption;
      if (saved && ['sm', 'base', 'lg', 'xl'].includes(saved)) {
        setFontSize(saved);
      }
    } catch {
      // localStorage indisponível
    }
  }, []);

  function handleSetFontSize(size: FontSizeOption) {
    setFontSize(size);
    try {
      localStorage.setItem('ctfl_font_size', size);
    } catch {
      // ignore
    }
  }

  // Progresso de leitura na rolagem (compatível com modo padrão e tela cheia)
  React.useEffect(() => {
    function handleScroll() {
      const scrollEl = focusMode ? containerRef.current : null;
      const scrollTop = scrollEl ? scrollEl.scrollTop : window.scrollY;
      const totalScroll = scrollEl
        ? scrollEl.scrollHeight - scrollEl.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;

      if (totalScroll > 0) {
        const currentProgress = (scrollTop / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    }

    const targetEl = focusMode ? containerRef.current : window;
    if (targetEl) {
      targetEl.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (targetEl) {
        targetEl.removeEventListener('scroll', handleScroll);
      }
    };
  }, [focusMode]);

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
        title: 'Aula concluída com sucesso! 🏆',
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
        title: json.isCorrect ? 'Resposta Correta! 🌟' : 'Resposta Incorreta',
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

  // Gera o Micro-Checkpoint Interativo para Active Recall no meio da aula
  const microCheckpoint: MicroCheckpointQuestion = React.useMemo(() => {
    if (lesson.definitions.length >= 2) {
      const term1 = lesson.definitions[0];
      const term2 = lesson.definitions[1];
      return {
        question: `Qual das seguintes afirmações define rigorosamente o conceito de "${term1.term}" no Syllabus CTFL?`,
        options: [
          {
            label: 'A',
            text: term1.definition,
            isCorrect: true,
            feedback: `Exato! De acordo com o glossário oficial do ISTQB CTFL 4.0.1, esta é a definição precisa de ${term1.term}.`,
          },
          {
            label: 'B',
            text: term2.definition,
            isCorrect: false,
            feedback: `Atenção: esta alternativa descreve o conceito de "${term2.term}", não de "${term1.term}". Cuidado com essa pegadinha no exame!`,
          },
        ],
      };
    }

    if (lesson.definitions.length === 1) {
      const term1 = lesson.definitions[0];
      return {
        question: `Como o padrão oficial ISTQB CTFL 4.0.1 define "${term1.term}"?`,
        options: [
          {
            label: 'A',
            text: term1.definition,
            isCorrect: true,
            feedback: 'Perfeito! Definição correta do glossário.',
          },
          {
            label: 'B',
            text: 'Apenas uma atividade informal de programadores sem necessidade de critérios ou documentação.',
            isCorrect: false,
            feedback:
              'Incorreto! O teste segue normas formais e estruturadas.',
          },
        ],
      };
    }

    return {
      question:
        'De acordo com a teoria do Syllabus CTFL 4.0.1, qual o propósito primário de testar artefatos precocemente?',
      options: [
        {
          label: 'A',
          text: 'Reduzir custos e prevenir a propagação de defeitos para fases posteriores.',
          isCorrect: true,
          feedback:
            'Correto! O teste precoce economiza tempo e dinheiro, prevenindo defeitos.',
        },
        {
          label: 'B',
          text: 'Eliminar 100% de qualquer possibilidade de falhas futuras em produção.',
          isCorrect: false,
          feedback:
            'Incorreto! Lembre-se do princípio 1: O teste mostra a presença de defeitos, não sua ausência.',
        },
      ],
    };
  }, [lesson.definitions]);

  const steps = [
    { id: 1, title: 'Teoria & Conceitos', icon: BookOpen },
    { id: 2, title: 'Glossário Ativo', icon: Layers },
    { id: 3, title: 'Laboratório Prático', icon: Code2 },
    { id: 4, title: 'Rotina Real de QA', icon: Briefcase },
    { id: 5, title: 'Resumo & Exame', icon: Sparkles },
  ];

  const shouldShowExercises =
    studyMode === 'FULL' || (studyMode === 'TRACK' && currentStep === 5);

  return (
    <div
      ref={containerRef}
      className={cn(
        'space-y-6 transition-all duration-300',
        focusMode
          ? 'fixed inset-0 z-[100] overflow-y-auto bg-background p-4 sm:p-8 md:p-12 lg:px-28'
          : 'w-full'
      )}
    >
      {/* Barra de Progresso de Leitura Superior */}
      <div
        className={cn(
          'fixed top-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-150',
          focusMode ? 'z-[110]' : 'z-50'
        )}
        style={{ width: `${scrollProgress}%` }}
        title={`Progresso de rolagem: ${Math.round(scrollProgress)}%`}
      />

      {/* BARRA DE FERRAMENTAS DIDÁTICAS E PLAYER DE ÁUDIO (Fixos no layout, sem sobrepor o conteúdo) */}
      <div
        className={cn(
          'rounded-2xl border border-indigo-500/30 bg-background/95 backdrop-blur-md p-3.5 shadow-sm transition-all',
          focusMode && 'border-indigo-500/50 shadow-md'
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Seletor de Modo de Estudo */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/60 p-1">
            <button
              type="button"
              onClick={() => setStudyMode('TRACK')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                studyMode === 'TRACK'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Trilha Interativa (Passo a Passo)
            </button>
            <button
              type="button"
              onClick={() => setStudyMode('FULL')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                studyMode === 'FULL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Leitura Contínua
            </button>
          </div>

          {/* Controles de Tamanho de Fonte e Foco */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground mr-1 hidden sm:inline">
                Tamanho da Fonte:
              </span>
              <div className="flex items-center rounded-xl border border-border/80 bg-background/60 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleSetFontSize('base')}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-semibold transition',
                    fontSize === 'base'
                      ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="Padrão (16px)"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => handleSetFontSize('lg')}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-semibold transition',
                    fontSize === 'lg'
                      ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="Confortável / Recomendado (18px)"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => handleSetFontSize('xl')}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-semibold transition',
                    fontSize === 'xl'
                      ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="Amplo / Muito Grande (20px)"
                >
                  A++
                </button>
              </div>
            </div>

            <Button
              type="button"
              variant={focusMode ? 'default' : 'outline'}
              size="sm"
              onClick={toggleFocusMode}
              className={cn(
                'h-8 px-2.5 text-xs font-semibold transition',
                focusMode && 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
              )}
              title={focusMode ? 'Sair da tela cheia (Esc)' : 'Entrar no modo foco em tela cheia'}
            >
              {focusMode ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span>Sair da Tela Cheia (Esc)</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Modo Tela Cheia</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Player de Voz Narração da Aula */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <AudioLessonPlayer
            title={lesson.title}
            textToRead={`${lesson.explanation} ${lesson.summary}`}
          />
        </div>
      </div>

      {/* MODO 1: TRILHA INTERATIVA (Passo a Passo com Gamificação) */}
      {studyMode === 'TRACK' ? (
        <div className="space-y-6">
          {/* Navegação por Etapas da Trilha */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl border p-2.5 sm:p-3 text-center transition-all',
                    isActive &&
                      'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500',
                    isPast &&
                      'border-emerald-500/40 bg-emerald-500/5 text-emerald-300 hover:border-emerald-500/60',
                    !isActive &&
                      !isPast &&
                      'border-border/60 bg-background/40 text-muted-foreground hover:border-indigo-500/30'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Etapa {step.id}
                    </span>
                  </div>
                  <span className="text-xs font-semibold line-clamp-1">
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Conteúdo Dinâmico da Etapa Atual */}
          <Card className="border-indigo-500/30 shadow-xl">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="default">
                  Etapa {currentStep} de 5 • {steps[currentStep - 1].title}
                </Badge>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Tempo estimado: {lesson.estimatedMinutes} min
                  </Badge>
                  {completed && (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Concluída
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="pt-2 text-2xl font-bold">
                {lesson.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* ETAPA 1: Explicação Teórica e Micro-Checkpoint */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-400">
                      <BookOpen className="h-5 w-5" />
                      Explicação Didática do Syllabus
                    </h3>
                    <div className="rounded-2xl border border-border/60 bg-background/40 p-6 sm:p-8 leading-relaxed">
                      <FormattedText
                        text={lesson.explanation}
                        fontSize={fontSize}
                      />
                    </div>
                  </div>

                  {/* Micro-desafio interativo para quebrar a leitura passiva */}
                  <InlineCheckpoint
                    checkpoint={microCheckpoint}
                    onCompleted={() => {
                      toast({
                        title: 'Conceito fixado com sucesso! 🚀',
                        description:
                          'Você pode avançar para a Etapa 2 (Glossário Ativo).',
                        variant: 'success',
                      });
                    }}
                  />
                </div>
              )}

              {/* ETAPA 2: Glossário Ativo com Modo de Memória */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-violet-400">
                      <Layers className="h-5 w-5" />
                      Glossário Oficial ISTQB (Memorização Ativa)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Clique no ícone de olho para ocultar a definição e tentar
                      lembrar ativamente, ou clique no ícone de som para ouvir a
                      pronúncia.
                    </p>
                  </div>
                  <InteractiveGlossary
                    definitions={lesson.definitions}
                    fontSize={fontSize}
                  />
                </div>
              )}

              {/* ETAPA 3: Laboratório de Exemplos Práticos */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-400">
                      <Code2 className="h-5 w-5" />
                      Laboratório de Exemplos Práticos (Web, APIs e Dados)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Veja como esses conceitos teóricos do CTFL são aplicados na
                      prática em sistemas modernos.
                    </p>
                  </div>
                  <InteractivePracticalLab
                    practicalExamplesText={lesson.practicalExamples}
                    fontSize={fontSize}
                  />
                </div>
              )}

              {/* ETAPA 4: Aplicação na Rotina Real de QA */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-amber-400">
                      <Briefcase className="h-5 w-5" />
                      Aplicação na Rotina Real de QA (Estudo de Caso)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Como o time de engenharia e os testadores lidam com essas
                      situações nas Sprints e cerimônias ágeis.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 sm:p-8 leading-relaxed">
                    <FormattedText
                      text={lesson.qaRoutineExamples}
                      fontSize={fontSize}
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 5: Resumo Turbo & Pegadinhas do Exame */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="space-y-2 rounded-2xl border border-indigo-500/35 bg-gradient-to-br from-indigo-950/40 via-background to-violet-950/30 p-6 sm:p-8 shadow-lg">
                    <h3 className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-wider text-indigo-300">
                      <Sparkles className="h-5 w-5 text-indigo-400" />
                      Resumo Essencial para o Exame CTFL 4.0.1
                    </h3>
                    <FormattedText
                      text={lesson.summary}
                      fontSize={fontSize}
                    />
                  </div>

                  <div className="rounded-xl border border-border/70 bg-background/50 p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-base">
                        {completed
                          ? 'Aula concluída! Parabéns!'
                          : 'Pronto para concluir e garantir seus pontos?'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {completed
                          ? 'Você já recebeu seus +30 XP por este estudo.'
                          : 'Clique abaixo para marcar como concluída e somar +30 XP ao seu perfil.'}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant={completed ? 'success' : 'default'}
                      size="lg"
                      onClick={handleCompleteLesson}
                      isLoading={completing}
                      className="font-bold shadow-md"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-1.5" />
                      {completed ? 'Aula Concluída (+30 XP)' : 'Concluir Aula (+30 XP)'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Controles de Navegação Entre as Etapas da Trilha */}
              <div className="flex items-center justify-between border-t border-border/70 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentStep <= 1}
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Etapa Anterior
                </Button>

                <div className="text-xs font-semibold text-muted-foreground">
                  Etapa {currentStep} de 5
                </div>

                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
                  >
                    Próxima Etapa: {steps[currentStep].title}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const el = document.getElementById('exercicios-topico');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Ir para os Exercícios de Fixação
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* MODO 2: LEITURA CONTÍNUA (Tudo em uma página enriquecida) */
        <Card className="border-indigo-500/30 shadow-xl">
          <CardHeader className="border-b border-border/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="default">
                Tempo estimado: {lesson.estimatedMinutes} min
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

          <CardContent className="space-y-10 pt-6">
            {/* 1. Explicação Didática */}
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-bold text-indigo-400">
                <BookOpen className="h-5 w-5" />
                Explicação Didática do Syllabus
              </h3>
              <div className="rounded-2xl border border-border/60 bg-background/40 p-6 sm:p-8 leading-relaxed">
                <FormattedText
                  text={lesson.explanation}
                  fontSize={fontSize}
                />
              </div>

              {/* Micro-Checkpoint Interativo */}
              <InlineCheckpoint checkpoint={microCheckpoint} />
            </section>

            {/* 2. Definições Formais (Glossário Ativo) */}
            {lesson.definitions.length > 0 && (
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-xl font-bold text-violet-400">
                  <Layers className="h-5 w-5" />
                  Glossário Oficial ISTQB (Memorização Ativa)
                </h3>
                <InteractiveGlossary
                  definitions={lesson.definitions}
                  fontSize={fontSize}
                />
              </section>
            )}

            {/* 3. Exemplos Práticos */}
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-bold text-emerald-400">
                <Code2 className="h-5 w-5" />
                Exemplos Práticos (Web, APIs e Banco de Dados)
              </h3>
              <InteractivePracticalLab
                practicalExamplesText={lesson.practicalExamples}
                fontSize={fontSize}
              />
            </section>

            {/* 4. Rotina Real de QA */}
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-bold text-amber-400">
                <Briefcase className="h-5 w-5" />
                Aplicação na Rotina Real de QA
              </h3>
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 sm:p-8 leading-relaxed">
                <FormattedText
                  text={lesson.qaRoutineExamples}
                  fontSize={fontSize}
                />
              </div>
            </section>

            {/* 5. Resumo de Fixação para o Exame */}
            <section className="space-y-3 rounded-2xl border border-indigo-500/35 bg-gradient-to-br from-indigo-950/40 via-background to-violet-950/30 p-6 sm:p-8 shadow-lg">
              <h3 className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-wider text-indigo-300">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Resumo Essencial para o Exame CTFL 4.0.1
              </h3>
              <FormattedText text={lesson.summary} fontSize={fontSize} />
            </section>

            {/* Concluir Aula */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <div>
                <p className="text-base font-semibold">
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
                size="lg"
                onClick={handleCompleteLesson}
                isLoading={completing}
                className="font-bold"
              >
                <CheckCircle2 className="h-5 w-5 mr-1" />
                {completed ? 'Aula Concluída (+30 XP)' : 'Concluir Aula (+30 XP)'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* EXERCÍCIOS DE FIXAÇÃO DO TÓPICO (Aparece no final da trilha ou normal na leitura contínua) */}
      {shouldShowExercises && (
        <div id="exercicios-topico" className="space-y-5 pt-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
              <CheckSquare className="h-6 w-6 text-indigo-400" />
              Exercícios de Fixação deste Tópico
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Resolva as questões abaixo para validar seu domínio dos Objetivos de
              Aprendizagem estudados nesta aula.
            </p>
          </div>

          {exercises.map((q, idx) => {
            const selected = selectedOptions[q.id];
            const fb = feedbacks[q.id];

            return (
              <Card key={q.id} className="border-border/80 shadow-md">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Exercício {idx + 1}</Badge>
                      <Badge variant="outline">{q.code}</Badge>
                      <Badge variant="purple">
                        {q.learningObjectiveCode} ({q.cognitiveLevel})
                      </Badge>
                    </div>
                    <Badge variant="secondary">
                      {q.difficulty === 'EASY'
                        ? 'Nível Fácil'
                        : q.difficulty === 'MEDIUM'
                        ? 'Nível Médio'
                        : 'Nível Difícil'}
                    </Badge>
                  </div>
                  <CardDescription
                    className={cn(
                      'pt-2 font-medium text-foreground leading-relaxed',
                      fontSize === 'sm' && 'text-sm',
                      fontSize === 'base' && 'text-base',
                      fontSize === 'lg' && 'text-lg',
                      fontSize === 'xl' && 'text-xl'
                    )}
                  >
                    <InlineMarkdown text={q.statement} />
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
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
                            'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all',
                            fontSize === 'sm' && 'text-sm',
                            fontSize === 'base' && 'text-base',
                            fontSize === 'lg' && 'text-lg',
                            fontSize === 'xl' && 'text-xl',
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
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border font-bold text-xs">
                            {opt.label}
                          </span>
                          <div className="flex-1 space-y-1">
                            <p>
                              <InlineMarkdown text={opt.content} />
                            </p>
                            {optFb?.justification && (
                              <p className="text-xs text-muted-foreground pt-1.5">
                                <InlineMarkdown text={optFb.justification} />
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
                        'rounded-xl border p-4 text-xs sm:text-sm space-y-2',
                        fb.isCorrect
                          ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                          : 'border-amber-500/40 bg-amber-950/30 text-amber-200'
                      )}
                    >
                      <p className="font-bold flex items-center gap-1.5 text-base">
                        {fb.isCorrect ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            Correto! Gabarito: Alternativa {fb.correctOptionLabel}
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-amber-400" />
                            Incorreto. O gabarito oficial é a Alternativa{' '}
                            {fb.correctOptionLabel}
                          </>
                        )}
                      </p>
                      <div className="leading-relaxed">
                        <FormattedText text={fb.explanation} fontSize={fontSize} />
                      </div>
                      <p className="text-xs opacity-80 pt-1">
                        Referência Syllabus: {fb.referenceSection}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
