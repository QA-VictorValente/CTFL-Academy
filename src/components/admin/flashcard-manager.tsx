'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Layers, Plus, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useToast } from '@/components/providers/toast-provider';
import { InlineMarkdown } from '@/components/ui/formatted-text';

interface FlashcardItem {
  id: string;
  chapterId: string;
  topicId: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  isPublished: boolean;
  chapter: { number: number; title: string };
  topic: { code: string; title: string };
}

interface ChapterOption {
  id: string;
  number: number;
  title: string;
  topics: { id: string; code: string; title: string }[];
}

export function FlashcardManager({
  flashcards,
  chapters,
}: {
  flashcards: FlashcardItem[];
  chapters: ChapterOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [chapterFilter, setChapterFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const defaultChapter = chapters[0];
  const [chapterId, setChapterId] = useState(defaultChapter?.id || '');
  const [topicId, setTopicId] = useState(defaultChapter?.topics[0]?.id || '');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tagsInput, setTagsInput] = useState('CTFL, Conceito');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [isPublished, setIsPublished] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = flashcards.filter(
    (f) => chapterFilter === 'ALL' || f.chapterId === chapterFilter
  );

  function openNew() {
    setEditingId(null);
    setChapterId(defaultChapter?.id || '');
    setTopicId(defaultChapter?.topics[0]?.id || '');
    setFront('');
    setBack('');
    setTagsInput('CTFL, Glossário');
    setDifficulty('MEDIUM');
    setIsPublished(true);
    setModalOpen(true);
  }

  function openEdit(fc: FlashcardItem) {
    setEditingId(fc.id);
    setChapterId(fc.chapterId);
    setTopicId(fc.topicId);
    setFront(fc.front);
    setBack(fc.back);
    setTagsInput(fc.tags.join(', '));
    setDifficulty(fc.difficulty);
    setIsPublished(fc.isPublished);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/flashcards', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId || undefined,
          chapterId,
          topicId,
          front,
          back,
          tags,
          difficulty,
          isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao salvar flashcard',
          description: data.error || 'Verifique os campos.',
          variant: 'error',
        });
        return;
      }

      toast({
        title: editingId ? 'Flashcard atualizado' : 'Flashcard criado',
        description: 'Cartão de repetição espaçada salvo com sucesso.',
        variant: 'success',
      });
      setModalOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/flashcards?id=${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({
          title: 'Flashcard removido',
          description: 'O cartão foi despublicado e arquivado.',
          variant: 'info',
        });
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const activeChapter = chapters.find((c) => c.id === chapterId) || defaultChapter;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-72">
          <Select
            label="Filtrar por Capítulo"
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Todos os Capítulos' },
              ...chapters.map((c) => ({
                value: c.id,
                label: `Cap. ${c.number} — ${c.title}`,
              })),
            ]}
          />
        </div>
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Novo Flashcard Autoral
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((fc) => (
          <Card key={fc.id}>
            <CardContent className="flex h-full flex-col justify-between p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline">
                      Cap. {fc.chapter.number} • {fc.topic.code}
                    </Badge>
                    <Badge variant="info">{fc.difficulty}</Badge>
                    <Badge variant={fc.isPublished ? 'success' : 'warning'}>
                      {fc.isPublished ? 'Publicado' : 'Oculto'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(fc)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(fc.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 text-sm font-bold text-foreground">
                  Frente: <InlineMarkdown text={fc.front} />
                </div>
                <div className="mt-2 rounded-lg border border-border bg-secondary/20 p-2.5 text-xs text-muted-foreground">
                  <strong>Verso:</strong> <InlineMarkdown text={fc.back} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {fc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <Card className="w-full max-w-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4 text-primary" />
                  {editingId ? 'Editar Flashcard' : 'Novo Flashcard'}
                </CardTitle>
                <CardDescription>
                  Cartão de memorização vinculado ao Syllabus CTFL 4.0.1.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Capítulo"
                    value={chapterId}
                    onChange={(e) => {
                      const newCh = e.target.value;
                      setChapterId(newCh);
                      const chObj = chapters.find((c) => c.id === newCh);
                      if (chObj?.topics[0]) setTopicId(chObj.topics[0].id);
                    }}
                    options={chapters.map((c) => ({
                      value: c.id,
                      label: `Cap. ${c.number} — ${c.title}`,
                    }))}
                  />
                  <Select
                    label="Tópico"
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    options={(activeChapter?.topics || []).map((t) => ({
                      value: t.id,
                      label: `${t.code} — ${t.title}`,
                    }))}
                  />
                </div>

                <Textarea
                  label="Frente do Cartão (Pergunta ou Conceito)"
                  rows={2}
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  required
                />

                <Textarea
                  label="Verso do Cartão (Resposta Objetiva)"
                  rows={3}
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Tags (separadas por vírgula)"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
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

                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  Publicar imediatamente para os estudantes
                </label>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" isLoading={saving}>
                    Salvar Flashcard
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Remover Flashcard"
        description="Deseja realmente despublicar e arquivar este flashcard?"
        confirmLabel="Remover"
        variant="destructive"
        isLoading={deleting}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
