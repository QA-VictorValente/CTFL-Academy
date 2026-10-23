import Link from 'next/link';
import {
  BookOpen,
  Clock,
  Award,
  Target,
  BarChart3,
  ArrowRight,
  Brain,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const SYLLABUS_CHAPTERS = [
  {
    number: 1,
    title: 'Fundamentos de Teste',
    questionsWeight: 8,
    kLevels: 'K1, K2',
    summary:
      'O que é teste, por que o teste é necessário, os 7 princípios de teste, atividades e papéis no processo de teste, habilidades essenciais e abordagem Whole Team.',
    topicsCount: 5,
  },
  {
    number: 2,
    title: 'Teste ao Longo do Ciclo de Vida de Desenvolvimento de Software',
    questionsWeight: 6,
    kLevels: 'K1, K2',
    summary:
      'Teste no contexto de um SDLC, Shift-Left, DevOps, níveis de teste (Componente, Integração, Sistema, Aceite), tipos de teste e teste de manutenção.',
    topicsCount: 4,
  },
  {
    number: 3,
    title: 'Teste Estático',
    questionsWeight: 4,
    kLevels: 'K1, K2',
    summary:
      'Conceitos básicos de teste estático, diferenças em relação ao teste dinâmico, processo de feedback e revisão, tipos de revisão e fatores de sucesso.',
    topicsCount: 2,
  },
  {
    number: 4,
    title: 'Análise e Projeto de Teste',
    questionsWeight: 12,
    kLevels: 'K2, K3',
    summary:
      'Técnicas Caixa-Preta (Particionamento de Equivalência, Análise de Valor Limite, Tabela de Decisão, Transição de Estado), Caixa-Branca e Baseadas na Experiência.',
    topicsCount: 5,
  },
  {
    number: 5,
    title: 'Gerenciamento das Atividades de Teste',
    questionsWeight: 8,
    kLevels: 'K1, K2, K3',
    summary:
      'Planejamento de teste, critérios de entrada e saída, técnicas de estimativa, priorização, pirâmide e quadrantes de teste, gestão de riscos, configuração e defeitos.',
    topicsCount: 5,
  },
  {
    number: 6,
    title: 'Ferramentas de Teste',
    questionsWeight: 2,
    kLevels: 'K1, K2',
    summary:
      'Suporte de ferramentas para o teste e benefícios e riscos da automação de testes em projetos reais.',
    topicsCount: 2,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-secondary/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <Badge variant="default" className="px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Alinhado 100% ao Syllabus Oficial ISTQB® CTFL v4.0.1
                </Badge>

                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Domine a Certificação{' '}
                  <span className="text-primary">
                    ISTQB CTFL 4.0.1
                  </span>{' '}
                  com Engenharia e Método
                </h1>

                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Estude os 6 capítulos oficiais com exemplos práticos de QA,
                  pratique com flashcards de repetição espaçada e realize
                  simulados cronometrados que seguem rigorosamente a matriz de
                  distribuição da prova oficial.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href="/cadastro">
                    <Button size="lg">
                      Criar Conta de Estudante
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/sobre">
                    <Button variant="outline" size="lg">
                      Conhecer Metodologia
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-4">
                  <div className="rounded-xl border border-border bg-card p-3.5">
                    <p className="text-2xl font-extrabold tabular-nums text-primary">6</p>
                    <p className="text-xs text-muted-foreground">
                      Capítulos do Syllabus
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3.5">
                    <p className="text-2xl font-extrabold tabular-nums text-foreground">40</p>
                    <p className="text-xs text-muted-foreground">
                      Questões por Exame
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3.5">
                    <p className="text-2xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-400">
                      65%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Nota de Corte (26 pts)
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3.5">
                    <p className="text-2xl font-extrabold tabular-nums text-teal-700 dark:text-teal-400">
                      60m
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tempo Oficial de Prova
                    </p>
                  </div>
                </div>
              </div>

              {/* SaaS Preview Panel */}
              <div className="lg:col-span-5">
                <div data-ui className="rounded-2xl border border-border bg-card p-6">
                  <div data-ui className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          Matriz Oficial do Simulado CTFL 4.0
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Distribuição determinística por capítulo e K-Level
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">v4.0.1</Badge>
                  </div>

                  <div className="mt-5 space-y-3.5">
                    {SYLLABUS_CHAPTERS.map((ch) => (
                      <div
                        key={ch.number}
                        className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3.5 py-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 font-bold tabular-nums text-primary">
                            {ch.number}
                          </span>
                          <span className="font-medium line-clamp-1">
                            {ch.title}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant="outline">{ch.kLevels}</Badge>
                          <span className="font-semibold tabular-nums text-primary">
                            {ch.questionsWeight} questões
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-primary/25 bg-primary/10 p-3.5 text-xs text-foreground">
                    <p className="font-semibold text-primary">
                      Motor de Simulado Determinístico & Auditado
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Prioriza questões inéditas, respeita equivalência
                      editorial, controla o tempo pelo servidor e gera diagnóstico
                      detalhado por Objetivo de Aprendizagem (FL-x.x.x).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Syllabus Section */}
        <section id="syllabus" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-3">
              <Badge variant="secondary">Estrutura Curricular Oficial</Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Os 6 Capítulos do Syllabus ISTQB CTFL 4.0.1
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Todo o material foi estruturado respeitando exatamente os códigos
                de Objetivos de Aprendizagem (FL-1.1.1 a FL-6.2.1) e níveis
                cognitivos K1 (Lembrar), K2 (Compreender) e K3 (Aplicar).
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {SYLLABUS_CHAPTERS.map((chapter) => (
                <Card
                  key={chapter.number}
                  className="flex flex-col justify-between border-border transition-colors hover:border-primary/40"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="default">Capítulo {chapter.number}</Badge>
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {chapter.questionsWeight} questões na prova (
                        {Math.round((chapter.questionsWeight / 40) * 100)}%)
                      </span>
                    </div>
                    <CardTitle className="pt-2 text-lg leading-snug">
                      {chapter.title}
                    </CardTitle>
                    <CardDescription className="pt-1 text-xs leading-relaxed">
                      {chapter.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between rounded-lg bg-secondary/60 px-3 py-2 text-xs tabular-nums text-muted-foreground">
                      <span>{chapter.topicsCount} tópicos oficiais</span>
                      <span>Níveis: {chapter.kLevels}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features / Simulados Section */}
        <section
          id="simulados"
          className="bg-secondary/50 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="default">Metodologia Completa</Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Tudo o que você precisa para conquistar a certificação
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Da leitura guiada de cada tópico com exemplos de sistemas reais
                até a revisão cirúrgica dos seus erros nos simulados.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">
                    Aulas Didáticas + Rotina de QA
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Explicações em português brasileiro com definições formais do
                    glossário ISTQB e exemplos práticos em APIs REST, bancos de
                    dados, e-commerce e automação E2E.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">
                    Simulados Oficiais Cronometrados
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Provas completas (40 questões / 60 min), simulados por
                    capítulo ou treinos personalizados por tópico e dificuldade,
                    com persistência em tempo real e retomada automática.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    <Brain className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">
                    Flashcards com Repetição Espaçada
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Fixe conceitos K1 e K2 avaliando seu domínio (Fácil, Médio ou
                    Difícil). O sistema agenda automaticamente a próxima revisão
                    com base no seu desempenho.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">
                    Caderno de Erros e Diagnóstico
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Após cada simulado, consulte a justificativa detalhada do
                    gabarito e de cada alternativa incorreta, identificando os
                    tópicos com maior taxa de erro.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-400">
                    <Award className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">
                    Gamificação, XP e Conquistas
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Ganhe XP por aulas concluídas, exercícios resolvidos,
                    flashcards revisados e simulados finalizados. Mantenha sua
                    sequência de dias estudados ativa.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">
                    Governança Editorial & Auditoria
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Todas as questões passam por fluxo editorial (Rascunho,
                    Revisão, Aprovada, Publicada) com versionamento imutável e
                    rastreabilidade de origem.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
