'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Edit3, FileText, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/providers/toast-provider';

interface LessonItem {
  id: string;
  title: string;
  explanation: string;
  practicalExamples: string;
  qaRoutineExamples: string;
  summary: string;
  estimatedMinutes: number;
}

interface TopicItem {
  id: string;
  code: string;
  title: string;
  kLevelMax: string;
  lessons: LessonItem[];
}

interface ChapterItem {
  id: string;
  number: number;
  title: string;
  description: string;
  introduction: string;
  learningObjectivesSummary: string;
  examWeightQuestions: number;
  topics: TopicItem[];
}

export function ContentManager({ chapters }: { chapters: ChapterItem[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    chapters[0]?.id || ''
  );
  const selectedChapter =
    chapters.find((c) => c.id === selectedChapterId) || chapters[0];

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    selectedChapter?.topics[0]?.id || ''
  );

  // Estado de edição do Capítulo
  const [chapterTitle, setChapterTitle] = useState(selectedChapter?.title || '');
  const [chapterDesc, setChapterDesc] = useState(selectedChapter?.description || '');
  const [chapterIntro, setChapterIntro] = useState(selectedChapter?.introduction || '');
  const [chapterLoSummary, setChapterLoSummary] = useState(
    selectedChapter?.learningObjectivesSummary || ''
  );
  const [chapterWeight, setChapterWeight] = useState(
    selectedChapter?.examWeightQuestions || 8
  );
  const [savingChapter, setSavingChapter] = useState(false);

  // Estado de edição da Aula do Tópico selecionado
  const currentTopic =
    selectedChapter?.topics.find((t) => t.id === selectedTopicId) ||
    selectedChapter?.topics[0];
  const currentLesson = currentTopic?.lessons[0];

  const [lessonTitle, setLessonTitle] = useState(currentLesson?.title || '');
  const [lessonExplanation, setLessonExplanation] = useState(
    currentLesson?.explanation || ''
  );
  const [lessonPractical, setLessonPractical] = useState(
    currentLesson?.practicalExamples || ''
  );
  const [lessonQaRoutine, setLessonQaRoutine] = useState(
    currentLesson?.qaRoutineExamples || ''
  );
  const [lessonSummary, setLessonSummary] = useState(currentLesson?.summary || '');
  const [lessonMinutes, setLessonMinutes] = useState(
    currentLesson?.estimatedMinutes || 20
  );
  const [savingLesson, setSavingLesson] = useState(false);

  function handleSelectChapter(ch: ChapterItem) {
    setSelectedChapterId(ch.id);
    setChapterTitle(ch.title);
    setChapterDesc(ch.description);
    setChapterIntro(ch.introduction);
    setChapterLoSummary(ch.learningObjectivesSummary);
    setChapterWeight(ch.examWeightQuestions);

    const firstTopic = ch.topics[0];
    if (firstTopic) {
      handleSelectTopic(firstTopic);
    }
  }

  function handleSelectTopic(topic: TopicItem) {
    setSelectedTopicId(topic.id);
    const l = topic.lessons[0];
    if (l) {
      setLessonTitle(l.title);
      setLessonExplanation(l.explanation);
      setLessonPractical(l.practicalExamples);
      setLessonQaRoutine(l.qaRoutineExamples);
      setLessonSummary(l.summary);
      setLessonMinutes(l.estimatedMinutes);
    }
  }

  async function handleSaveChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChapter) return;
    setSavingChapter(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'chapter',
          id: selectedChapter.id,
          title: chapterTitle,
          description: chapterDesc,
          introduction: chapterIntro,
          learningObjectivesSummary: chapterLoSummary,
          examWeightQuestions: Number(chapterWeight),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao atualizar capítulo',
          description: data.error || 'Verifique os campos.',
          variant: 'error',
        });
        return;
      }
      toast({
        title: 'Capítulo atualizado',
        description: `Capítulo ${selectedChapter.number} salvo e auditado com sucesso.`,
        variant: 'success',
      });
      router.refresh();
    } finally {
      setSavingChapter(false);
    }
  }

  async function handleSaveLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!currentLesson) return;
    setSavingLesson(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'lesson',
          id: currentLesson.id,
          title: lessonTitle,
          explanation: lessonExplanation,
          practicalExamples: lessonPractical,
          qaRoutineExamples: lessonQaRoutine,
          summary: lessonSummary,
          estimatedMinutes: Number(lessonMinutes),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao atualizar aula',
          description: data.error || 'Verifique os campos.',
          variant: 'error',
        });
        return;
      }
      toast({
        title: 'Conteúdo da aula atualizado',
        description: `Aula do tópico ${currentTopic?.code} atualizada no banco de dados.`,
        variant: 'success',
      });
      router.refresh();
    } finally {
      setSavingLesson(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Capítulos */}
      <div className="flex flex-wrap gap-2">
        {chapters.map((ch) => (
          <Button
            key={ch.id}
            type="button"
            variant={ch.id === selectedChapter?.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleSelectChapter(ch)}
          >
            Cap. {ch.number} — {ch.title}
          </Button>
        ))}
      </div>

      {selectedChapter && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Coluna Esquerda: Metadados do Capítulo + Lista de Tópicos */}
          <div className="space-y-6 lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Editar Capítulo {selectedChapter.number}
                </CardTitle>
                <CardDescription>
                  Metadados curriculares e cota de questões na prova oficial.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveChapter} className="space-y-3">
                  <Input
                    label="Título do Capítulo"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    required
                  />
                  <Input
                    label="Peso no Exame Oficial (nº de questões de 40)"
                    type="number"
                    min={1}
                    max={40}
                    value={chapterWeight}
                    onChange={(e) => setChapterWeight(Number(e.target.value))}
                    required
                  />
                  <Textarea
                    label="Descrição resumida"
                    rows={2}
                    value={chapterDesc}
                    onChange={(e) => setChapterDesc(e.target.value)}
                    required
                  />
                  <Textarea
                    label="Introdução Didática"
                    rows={3}
                    value={chapterIntro}
                    onChange={(e) => setChapterIntro(e.target.value)}
                    required
                  />
                  <Textarea
                    label="Resumo dos Objetivos de Aprendizagem"
                    rows={2}
                    value={chapterLoSummary}
                    onChange={(e) => setChapterLoSummary(e.target.value)}
                    required
                  />
                  <Button type="submit" size="sm" isLoading={savingChapter} className="w-full gap-1.5">
                    <Save className="h-4 w-4" />
                    Salvar Capítulo {selectedChapter.number}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Tópicos do Capítulo {selectedChapter.number}
                </CardTitle>
                <CardDescription>
                  Selecione um tópico para editar sua aula completa ao lado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedChapter.topics.map((topic) => {
                  const active = topic.id === currentTopic?.id;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleSelectTopic(topic)}
                      className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-xs transition-colors ${
                        active
                          ? 'border-primary bg-primary/10 font-semibold'
                          : 'border-border bg-secondary/10 hover:bg-secondary/30'
                      }`}
                    >
                      <span>
                        {topic.code} — {topic.title}
                      </span>
                      <Badge variant="info">{topic.kLevelMax}</Badge>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita: Editor Completo de Conteúdo da Aula */}
          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Edit3 className="h-4 w-4 text-primary" />
                      Editor de Conteúdo — Tópico {currentTopic?.code}
                    </CardTitle>
                    <CardDescription>
                      {currentTopic?.title} (Nível Cognitivo {currentTopic?.kLevelMax})
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    <FileText className="mr-1 h-3 w-3" />
                    Aula Oficial
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentLesson ? (
                  <form onSubmit={handleSaveLesson} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <Input
                          label="Título da Aula"
                          value={lessonTitle}
                          onChange={(e) => setLessonTitle(e.target.value)}
                          required
                        />
                      </div>
                      <Input
                        label="Tempo estimado (min)"
                        type="number"
                        min={1}
                        max={180}
                        value={lessonMinutes}
                        onChange={(e) => setLessonMinutes(Number(e.target.value))}
                        required
                      />
                    </div>

                    <Textarea
                      label="Explicação Teórica Completa (Markdown / Parágrafos)"
                      rows={6}
                      value={lessonExplanation}
                      onChange={(e) => setLessonExplanation(e.target.value)}
                      required
                    />

                    <Textarea
                      label="Exemplos Práticos (Web, APIs, Banco de Dados, Regressão)"
                      rows={4}
                      value={lessonPractical}
                      onChange={(e) => setLessonPractical(e.target.value)}
                      required
                    />

                    <Textarea
                      label="Aplicação na Rotina Real de QA"
                      rows={4}
                      value={lessonQaRoutine}
                      onChange={(e) => setLessonQaRoutine(e.target.value)}
                      required
                    />

                    <Textarea
                      label="Resumo Executivo para Prova"
                      rows={3}
                      value={lessonSummary}
                      onChange={(e) => setLessonSummary(e.target.value)}
                      required
                    />

                    <div className="flex justify-end">
                      <Button type="submit" isLoading={savingLesson} className="gap-1.5">
                        <Save className="h-4 w-4" />
                        Salvar Conteúdo da Aula ({currentTopic?.code})
                      </Button>
                    </div>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma aula encontrada para este tópico.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
