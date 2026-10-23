'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Copy,
  Edit,
  Eye,
  Filter,
  History,
  Plus,
  Search,
  Send,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/providers/toast-provider';
import { formatDateTimePtBr } from '@/lib/utils';
import { FormattedText, InlineMarkdown } from '@/components/ui/formatted-text';

interface OptionData {
  id?: string;
  label: 'A' | 'B' | 'C' | 'D';
  content: string;
  isCorrect: boolean;
  justification?: string | null;
}

interface QuestionItem {
  id: string;
  code: string;
  equivalenceGroupId: string | null;
  statement: string;
  chapterId: string;
  topicId: string;
  learningObjectiveCode: string;
  cognitiveLevel: 'K1' | 'K2' | 'K3';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  correctOptionLabel: string;
  explanation: string;
  referenceSection: string;
  sourceId: string;
  isOfficialSample: boolean;
  isExercise: boolean;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';
  version: number;
  updatedAt: string;
  chapter: { id: string; number: number; title: string };
  topic: { id: string; code: string; title: string };
  source: { id: string; name: string; sourceType: string };
  options: OptionData[];
}

interface ChapterOption {
  id: string;
  number: number;
  title: string;
  topics: { id: string; code: string; title: string }[];
}

interface SourceOption {
  id: string;
  name: string;
  sourceType: string;
}

interface QuestionBankManagerProps {
  initialQuestions: QuestionItem[];
  chapters: ChapterOption[];
  sources: SourceOption[];
}

export function QuestionBankManager({
  initialQuestions,
  chapters,
  sources,
}: QuestionBankManagerProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Filtros e paginação
  const [searchText, setSearchText] = useState('');
  const [chapterFilter, setChapterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal de Criação / Edição
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Campos do formulário de questão
  const defaultChapter = chapters[0];
  const defaultTopic = defaultChapter?.topics[0];
  const defaultSource = sources[0];

  const [code, setCode] = useState('');
  const [statement, setStatement] = useState('');
  const [chapterId, setChapterId] = useState(defaultChapter?.id || '');
  const [topicId, setTopicId] = useState(defaultTopic?.id || '');
  const [learningObjectiveCode, setLearningObjectiveCode] = useState('FL-1.1.1');
  const [cognitiveLevel, setCognitiveLevel] = useState<'K1' | 'K2' | 'K3'>('K2');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [explanation, setExplanation] = useState('');
  const [referenceSection, setReferenceSection] = useState('Seção 1.1 do Syllabus CTFL 4.0.1');
  const [sourceId, setSourceId] = useState(defaultSource?.id || '');
  const [changeReason, setChangeReason] = useState('');
  const [options, setOptions] = useState<OptionData[]>([
    { label: 'A', content: '', isCorrect: true, justification: '' },
    { label: 'B', content: '', isCorrect: false, justification: '' },
    { label: 'C', content: '', isCorrect: false, justification: '' },
    { label: 'D', content: '', isCorrect: false, justification: '' },
  ]);

  // Modal de Prévia e Histórico de Versões
  const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);
  const [revisionsHistory, setRevisionsHistory] = useState<
    Array<{
      id: string;
      version: number;
      changeReason: string | null;
      createdAt: string;
      editor?: { fullName: string } | null;
    }>
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const filteredQuestions = initialQuestions.filter((q) => {
    if (chapterFilter !== 'ALL' && q.chapterId !== chapterFilter) return false;
    if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;
    if (difficultyFilter !== 'ALL' && q.difficulty !== difficultyFilter) return false;
    if (sourceFilter !== 'ALL' && q.sourceId !== sourceFilter) return false;
    if (searchText.trim()) {
      const term = searchText.toLowerCase();
      const match =
        q.code.toLowerCase().includes(term) ||
        q.statement.toLowerCase().includes(term) ||
        q.learningObjectiveCode.toLowerCase().includes(term) ||
        q.topic.code.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedQuestions = filteredQuestions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  function openNewQuestionModal() {
    setEditingId(null);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setCode(`CTFL-AUT-${randomSuffix}`);
    setStatement('');
    setChapterId(defaultChapter?.id || '');
    setTopicId(defaultTopic?.id || '');
    setLearningObjectiveCode('FL-1.1.1');
    setCognitiveLevel('K2');
    setDifficulty('MEDIUM');
    setExplanation('');
    setReferenceSection('Seção 1.1 do Syllabus CTFL 4.0.1');
    setSourceId(defaultSource?.id || '');
    setChangeReason('Criação inicial da questão autoral');
    setOptions([
      { label: 'A', content: '', isCorrect: true, justification: '' },
      { label: 'B', content: '', isCorrect: false, justification: '' },
      { label: 'C', content: '', isCorrect: false, justification: '' },
      { label: 'D', content: '', isCorrect: false, justification: '' },
    ]);
    setEditorOpen(true);
  }

  function openEditModal(q: QuestionItem) {
    setEditingId(q.id);
    setCode(q.code);
    setStatement(q.statement);
    setChapterId(q.chapterId);
    setTopicId(q.topicId);
    setLearningObjectiveCode(q.learningObjectiveCode);
    setCognitiveLevel(q.cognitiveLevel);
    setDifficulty(q.difficulty);
    setExplanation(q.explanation);
    setReferenceSection(q.referenceSection);
    setSourceId(q.sourceId);
    setChangeReason('Revisão técnica de enunciado e alternativas');
    setOptions(
      (['A', 'B', 'C', 'D'] as const).map((lbl) => {
        const found = q.options.find((o) => o.label === lbl);
        return {
          label: lbl,
          content: found?.content || '',
          isCorrect: Boolean(found?.isCorrect),
          justification: found?.justification || '',
        };
      })
    );
    setEditorOpen(true);
  }

  async function handleInspectQuestion(q: QuestionItem) {
    setPreviewQuestion(q);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/questions/${q.id}`);
      if (res.ok) {
        const data = await res.json();
        setRevisionsHistory(data.question?.revisions || []);
      }
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/questions/${editingId}`
        : '/api/admin/questions';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          statement,
          chapterId,
          topicId,
          learningObjectiveCode,
          cognitiveLevel,
          difficulty,
          explanation,
          referenceSection,
          sourceId,
          isOfficialSample: false,
          isExercise: true,
          changeReason: changeReason || 'Atualização editorial',
          options: options.map((o) => ({
            label: o.label,
            content: o.content,
            isCorrect: o.isCorrect,
            justification: o.justification || undefined,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao salvar questão',
          description: data.error || 'Verifique todos os campos obrigatórios.',
          variant: 'error',
        });
        return;
      }

      toast({
        title: editingId ? 'Questão atualizada (nova versão)' : 'Questão criada em Rascunho (DRAFT)',
        description: `Código ${code} salvo com sucesso.`,
        variant: 'success',
      });
      setEditorOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicateQuestion(id: string) {
    const res = await fetch(`/api/admin/questions/${id}/duplicate`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) {
      toast({
        title: 'Erro ao duplicar questão',
        description: data.error || 'Falha na duplicação.',
        variant: 'error',
      });
      return;
    }
    toast({
      title: 'Questão duplicada para edição autoral',
      description: `Cópia criada como rascunho (${data.question.code}).`,
      variant: 'success',
    });
    router.refresh();
  }

  async function handleStatusTransition(
    id: string,
    action: 'SUBMIT_REVIEW' | 'APPROVE' | 'REJECT' | 'PUBLISH' | 'UNPUBLISH' | 'ARCHIVE'
  ) {
    const res = await fetch(`/api/admin/questions/${id}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        comments: `Transição rápida (${action}) pelo painel do Banco de Questões.`,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast({
        title: 'Transição não permitida',
        description: data.error || 'Verifique as regras de workflow.',
        variant: 'error',
      });
      return;
    }
    toast({
      title: 'Status editorial atualizado',
      description: `Novo status: ${data.question.status}`,
      variant: 'success',
    });
    router.refresh();
  }

  const activeChapterObj =
    chapters.find((c) => c.id === chapterId) || defaultChapter;

  return (
    <div className="space-y-6">
      {/* Barra de Ferramentas e Filtros */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por código (ex: CTFL-CH4), enunciado ou objetivo (ex: FL-4.2.1)..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                data-ui
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button onClick={openNewQuestionModal} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nova Questão Autoral
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Filtrar por Capítulo"
              value={chapterFilter}
              onChange={(e) => {
                setChapterFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'Todos os Capítulos' },
                ...chapters.map((c) => ({
                  value: c.id,
                  label: `Cap. ${c.number} — ${c.title}`,
                })),
              ]}
            />

            <Select
              label="Status Editorial"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'Todos os Status' },
                { value: 'PUBLISHED', label: 'PUBLISHED (Publicada)' },
                { value: 'IN_REVIEW', label: 'IN_REVIEW (Em Revisão)' },
                { value: 'APPROVED', label: 'APPROVED (Aprovada)' },
                { value: 'DRAFT', label: 'DRAFT (Rascunho)' },
                { value: 'REJECTED', label: 'REJECTED (Rejeitada)' },
                { value: 'ARCHIVED', label: 'ARCHIVED (Arquivada)' },
              ]}
            />

            <Select
              label="Dificuldade"
              value={difficultyFilter}
              onChange={(e) => {
                setDifficultyFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'Todas as Dificuldades' },
                { value: 'EASY', label: 'Fácil (EASY)' },
                { value: 'MEDIUM', label: 'Média (MEDIUM)' },
                { value: 'HARD', label: 'Difícil (HARD)' },
              ]}
            />

            <Select
              label="Fonte / Origem"
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'Todas as Fontes' },
                ...sources.map((s) => ({
                  value: s.id,
                  label: `${s.name} (${s.sourceType})`,
                })),
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contagem e Paginação Superior */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Exibindo <strong>{paginatedQuestions.length}</strong> de{' '}
          <strong>{filteredQuestions.length}</strong> questões encontradas
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span>
            Página <strong>{safePage}</strong> de <strong>{totalPages}</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>

      {/* Lista de Questões */}
      <div className="space-y-3">
        {paginatedQuestions.map((q) => (
          <Card key={q.id}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{q.code}</Badge>
                  <Badge
                    variant={
                      q.status === 'PUBLISHED'
                        ? 'success'
                        : q.status === 'IN_REVIEW'
                          ? 'warning'
                          : q.status === 'REJECTED'
                            ? 'danger'
                            : 'info'
                    }
                  >
                    {q.status}
                  </Badge>
                  <Badge variant="outline">
                    Cap. {q.chapter.number} • {q.topic.code}
                  </Badge>
                  <Badge variant="outline">{q.learningObjectiveCode}</Badge>
                  <Badge variant="info">{q.cognitiveLevel}</Badge>
                  <Badge variant="outline">{q.difficulty}</Badge>
                  <Badge variant="outline">v{q.version}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInspectQuestion(q)}
                    className="gap-1 text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Prévia & Histórico
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(q)}
                    className="gap-1 text-xs"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateQuestion(q.id)}
                    className="gap-1 text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Duplicar
                  </Button>

                  {q.status === 'DRAFT' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusTransition(q.id, 'SUBMIT_REVIEW')}
                      className="gap-1 text-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Enviar p/ Revisão
                    </Button>
                  )}
                  {q.status === 'IN_REVIEW' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusTransition(q.id, 'APPROVE')}
                      className="gap-1 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Aprovar
                    </Button>
                  )}
                  {q.status === 'APPROVED' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusTransition(q.id, 'PUBLISH')}
                      className="gap-1 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Publicar
                    </Button>
                  )}
                  {q.status === 'PUBLISHED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusTransition(q.id, 'UNPUBLISH')}
                      className="text-xs"
                    >
                      Despublicar
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-2.5 text-sm font-medium leading-relaxed">
                <InlineMarkdown text={q.statement} />
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums text-muted-foreground">
                <span>
                  Gabarito: <strong>Alternativa {q.correctOptionLabel}</strong> • Fonte:{' '}
                  {q.source.name}
                </span>
                <span>Atualizado em {formatDateTimePtBr(q.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Criação / Edição de Questão */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 overflow-y-auto">
          <Card className="my-8 max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <CardHeader data-ui className="flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="text-lg">
                  {editingId ? `Editar Questão (${code})` : 'Cadastrar Nova Questão Autoral'}
                </CardTitle>
                <CardDescription>
                  Questões novas nascem como DRAFT e exigem aprovação antes de entrarem em simulados.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditorOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSaveQuestion} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Código Único"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                  <Input
                    label="Objetivo de Aprendizagem (LO)"
                    placeholder="FL-1.1.1"
                    value={learningObjectiveCode}
                    onChange={(e) => setLearningObjectiveCode(e.target.value)}
                    required
                  />
                  <Select
                    label="Nível Cognitivo"
                    value={cognitiveLevel}
                    onChange={(e) =>
                      setCognitiveLevel(e.target.value as 'K1' | 'K2' | 'K3')
                    }
                    options={[
                      { value: 'K1', label: 'K1 — Lembrar' },
                      { value: 'K2', label: 'K2 — Compreender' },
                      { value: 'K3', label: 'K3 — Aplicar' },
                    ]}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Select
                    label="Capítulo"
                    value={chapterId}
                    onChange={(e) => {
                      const newChId = e.target.value;
                      setChapterId(newChId);
                      const ch = chapters.find((c) => c.id === newChId);
                      if (ch?.topics[0]) {
                        setTopicId(ch.topics[0].id);
                      }
                    }}
                    options={chapters.map((c) => ({
                      value: c.id,
                      label: `Cap. ${c.number} — ${c.title}`,
                    }))}
                  />

                  <Select
                    label="Tópico do Syllabus"
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    options={(activeChapterObj?.topics || []).map((t) => ({
                      value: t.id,
                      label: `${t.code} — ${t.title}`,
                    }))}
                  />

                  <Select
                    label="Dificuldade"
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(e.target.value as 'EASY' | 'MEDIUM' | 'HARD')
                    }
                    options={[
                      { value: 'EASY', label: 'Fácil (EASY)' },
                      { value: 'MEDIUM', label: 'Média (MEDIUM)' },
                      { value: 'HARD', label: 'Difícil (HARD)' },
                    ]}
                  />
                </div>

                <Textarea
                  label="Enunciado da Questão"
                  rows={3}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  required
                />

                <div data-ui className="space-y-3 rounded-xl border border-border bg-secondary/20 p-4">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Alternativas (Selecione exatamente 1 alternativa correta)
                  </p>
                  {options.map((opt, idx) => (
                    <div
                      key={opt.label}
                      data-ui
                      className="grid gap-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-12"
                    >
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => {
                            setOptions((prev) =>
                              prev.map((item, i) => ({
                                ...item,
                                isCorrect: i === idx,
                              }))
                            );
                          }}
                          className="h-4 w-4 text-primary"
                        />
                        <span className="text-sm font-bold">
                          Opção {opt.label}
                        </span>
                      </div>
                      <div className="space-y-2 sm:col-span-10">
                        <Input
                          placeholder={`Texto da alternativa ${opt.label}`}
                          value={opt.content}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOptions((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, content: val } : item
                              )
                            );
                          }}
                          required
                        />
                        <Input
                          placeholder={`Justificativa didática da alternativa ${opt.label} (opcional)`}
                          value={opt.justification || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOptions((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, justification: val } : item
                              )
                            );
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Textarea
                  label="Explicação Completa do Gabarito"
                  rows={3}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Seção de Referência Documental"
                    value={referenceSection}
                    onChange={(e) => setReferenceSection(e.target.value)}
                    required
                  />
                  <Select
                    label="Fonte Bibliográfica"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    options={sources.map((s) => ({
                      value: s.id,
                      label: `${s.name} (${s.sourceType})`,
                    }))}
                  />
                  <Input
                    label="Motivo da Versão / Alteração"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditorOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" isLoading={saving}>
                    {editingId ? 'Salvar Nova Versão' : 'Criar Questão'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Prévia e Histórico de Versões */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 overflow-y-auto">
          <Card className="my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader data-ui className="flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="text-base">
                  Prévia e Histórico — {previewQuestion.code} (v{previewQuestion.version})
                </CardTitle>
                <CardDescription>
                  Status atual: {previewQuestion.status} • {previewQuestion.learningObjectiveCode}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreviewQuestion(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              <div className="font-semibold text-sm leading-relaxed">
                <FormattedText text={previewQuestion.statement} />
              </div>

              <div className="space-y-2">
                {previewQuestion.options.map((opt) => (
                  <div
                    key={opt.label}
                    data-ui
                    className={`rounded-lg border p-3 text-xs ${
                      opt.isCorrect
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-border bg-secondary/20'
                    }`}
                  >
                    <span className="font-bold">{opt.label})</span>{' '}
                    <InlineMarkdown text={opt.content} />
                    {opt.justification && (
                      <p className="mt-1 text-muted-foreground">
                        • <InlineMarkdown text={opt.justification} />
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div data-ui className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
                <strong>Explicação:</strong>
                <FormattedText
                  text={previewQuestion.explanation}
                  className="mt-1 space-y-2 leading-relaxed"
                />
              </div>

              <div data-ui className="border-t border-border pt-3">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
                  <History className="h-3.5 w-3.5" />
                  Histórico de Versões ({revisionsHistory.length})
                </h4>
                {loadingHistory ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Carregando revisões...
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {revisionsHistory.map((rev) => (
                      <div
                        key={rev.id}
                        data-ui
                        className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs tabular-nums"
                      >
                        <div>
                          <span className="font-bold">Versão {rev.version}:</span>{' '}
                          {rev.changeReason || 'Registro de versão'}
                        </div>
                        <span className="text-muted-foreground">
                          {formatDateTimePtBr(rev.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
