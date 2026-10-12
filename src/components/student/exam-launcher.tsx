'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Target,
  Sliders,
  Play,
  ArrowRight,
  BookOpen,
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
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/providers/toast-provider';

interface ChapterItem {
  id: string;
  number: number;
  title: string;
  examWeightQuestions: number;
  topics: { id: string; code: string; title: string }[];
}

export function ExamLauncher({
  chapters,
  inProgressAttempt,
  nonNativeEligible,
  initialChapterId,
}: {
  chapters: ChapterItem[];
  inProgressAttempt: {
    id: string;
    title: string;
    totalQuestions: number;
    startedAt: string;
  } | null;
  nonNativeEligible: boolean;
  initialChapterId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedChapterId, setSelectedChapterId] = React.useState(
    initialChapterId || chapters[0]?.id || ''
  );
  const [customTopicId, setCustomTopicId] = React.useState('ALL');
  const [customDifficulty, setCustomDifficulty] = React.useState<
    'ALL' | 'EASY' | 'MEDIUM' | 'HARD'
  >('ALL');
  const [customCount, setCustomCount] = React.useState(10);
  const [applyBonus, setApplyBonus] = React.useState(false);
  const [startingMode, setStartingMode] = React.useState<string | null>(null);

  const allTopics = React.useMemo(
    () => chapters.flatMap((c) => c.topics),
    [chapters]
  );

  async function startExam(params: {
    mode: 'FULL' | 'CHAPTER' | 'CUSTOM';
    chapterId?: string;
    topicIds?: string[];
    difficulties?: ('EASY' | 'MEDIUM' | 'HARD')[];
    questionCount?: number;
  }) {
    setStartingMode(params.mode);
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          applyNonNativeBonus: applyBonus,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: 'Não foi possível iniciar o simulado',
          description: json.error || 'Tente novamente.',
          variant: 'error',
        });
        return;
      }

      if (json.usedRepeatedQuestions) {
        toast({
          title: 'Simulado gerado com repetição controlada',
          description:
            'Você já respondeu parte das questões disponíveis; algumas questões foram reutilizadas.',
          variant: 'info',
        });
      } else {
        toast({
          title: 'Simulado iniciado!',
          description: 'Boa prova! O cronômetro oficial já está em andamento.',
          variant: 'success',
        });
      }

      router.push(`/simulados/${json.attemptId}`);
    } finally {
      setStartingMode(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Banner de Retomada de Tentativa em Andamento */}
      {inProgressAttempt && (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <Badge variant="success">Tentativa em Andamento Detectada</Badge>
            <h2 className="text-lg font-bold">{inProgressAttempt.title}</h2>
            <p className="text-xs text-muted-foreground">
              Suas respostas já marcadas estão salvas no servidor. Retome de onde
              parou antes que o cronômetro expire.
            </p>
          </div>
          <Link href={`/simulados/${inProgressAttempt.id}`}>
            <Button variant="success">
              Retomar Prova Agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Opção de Tempo Adicional para Idioma Não Nativo */}
      {nonNativeEligible && (
        <Card className="border-indigo-500/30 bg-indigo-500/5">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="text-xs">
              <p className="font-bold text-indigo-300">
                Extensão Oficial de Tempo (+25%) para Exame em Idioma Não Nativo
              </p>
              <p className="text-muted-foreground">
                Sua conta possui a preferência de idioma não nativo habilitada.
                Marque ao lado caso deseje aplicar +25% no tempo (75 min na prova
                completa).
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={applyBonus}
                onChange={(e) => setApplyBonus(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Aplicar +25% de tempo
            </label>
          </CardContent>
        </Card>
      )}

      {/* As 3 Modalidades de Simulado */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 1. Simulado Completo Oficial */}
        <Card className="flex flex-col justify-between border-indigo-500/40 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="default">Modalidade 1 • Oficial</Badge>
              <Clock className="h-5 w-5 text-indigo-400" />
            </div>
            <CardTitle className="pt-2 text-xl">
              Simulado Completo CTFL v4.0
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Segue rigorosamente a configuração padrão da prova oficial ISTQB
              CTFL 4.0: 40 questões, 60 minutos e nota de corte de 26 pontos
              (65%).
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-background/50 p-3.5 text-xs space-y-1.5">
              <p className="font-semibold text-foreground">
                Matriz Oficial de Distribuição:
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Cap. 1 (Fundamentos): 8 questões</li>
                <li>• Cap. 2 (Ciclo de Vida): 6 questões</li>
                <li>• Cap. 3 (Teste Estático): 4 questões</li>
                <li>• Cap. 4 (Análise e Projeto): 12 questões</li>
                <li>• Cap. 5 (Gerenciamento): 8 questões</li>
                <li>• Cap. 6 (Ferramentas): 2 questões</li>
              </ul>
            </div>

            <Button
              type="button"
              className="w-full"
              isLoading={startingMode === 'FULL'}
              onClick={() => startExam({ mode: 'FULL' })}
            >
              <Play className="h-4 w-4" />
              Iniciar Simulado Completo (40 Questões)
            </Button>
          </CardContent>
        </Card>

        {/* 2. Simulado por Capítulo */}
        <Card className="flex flex-col justify-between border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="purple">Modalidade 2 • Focado</Badge>
              <BookOpen className="h-5 w-5 text-violet-400" />
            </div>
            <CardTitle className="pt-2 text-xl">
              Simulado por Capítulo
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Foque em um capítulo específico do Syllabus para consolidar os
              tópicos recém-estudados antes de partir para a prova completa.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="chapter-select"
                className="text-xs font-semibold text-muted-foreground"
              >
                Escolha o Capítulo
              </label>
              <Select
                id="chapter-select"
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
              >
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Cap. {ch.number} — {ch.title}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              isLoading={startingMode === 'CHAPTER'}
              onClick={() =>
                startExam({
                  mode: 'CHAPTER',
                  chapterId: selectedChapterId,
                  questionCount: 8,
                })
              }
            >
              <Target className="h-4 w-4" />
              Iniciar Simulado do Capítulo
            </Button>
          </CardContent>
        </Card>

        {/* 3. Simulado Personalizado */}
        <Card className="flex flex-col justify-between border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">Modalidade 3 • Customizado</Badge>
              <Sliders className="h-5 w-5 text-emerald-400" />
            </div>
            <CardTitle className="pt-2 text-xl">
              Simulado Personalizado
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Combine tópico específico, nível de dificuldade e quantidade de
              questões para treinar seus pontos de atenção.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="custom-topic"
                className="text-xs font-semibold text-muted-foreground"
              >
                Tópico do Syllabus
              </label>
              <Select
                id="custom-topic"
                value={customTopicId}
                onChange={(e) => setCustomTopicId(e.target.value)}
              >
                <option value="ALL">Todos os Tópicos</option>
                {allTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="custom-diff"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Dificuldade
                </label>
                <Select
                  id="custom-diff"
                  value={customDifficulty}
                  onChange={(e) =>
                    setCustomDifficulty(
                      e.target.value as 'ALL' | 'EASY' | 'MEDIUM' | 'HARD'
                    )
                  }
                >
                  <option value="ALL">Todas</option>
                  <option value="EASY">Fácil</option>
                  <option value="MEDIUM">Médio</option>
                  <option value="HARD">Difícil</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="custom-count"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Nº de Questões
                </label>
                <Select
                  id="custom-count"
                  value={String(customCount)}
                  onChange={(e) => setCustomCount(Number(e.target.value))}
                >
                  <option value="5">5 questões</option>
                  <option value="10">10 questões</option>
                  <option value="15">15 questões</option>
                  <option value="20">20 questões</option>
                </Select>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              isLoading={startingMode === 'CUSTOM'}
              onClick={() =>
                startExam({
                  mode: 'CUSTOM',
                  topicIds: customTopicId === 'ALL' ? undefined : [customTopicId],
                  difficulties:
                    customDifficulty === 'ALL' ? undefined : [customDifficulty],
                  questionCount: customCount,
                })
              }
            >
              <Sliders className="h-4 w-4" />
              Gerar Treino Personalizado
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
