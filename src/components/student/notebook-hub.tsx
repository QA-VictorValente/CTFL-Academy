'use client';

import * as React from 'react';
import {
  Brain,
  StickyNote,
  Search,
  Trash2,
  Pin,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/providers/toast-provider';
import { MindMapCanvas } from '@/components/student/mind-map-canvas';
import { NotebookEditor } from '@/components/student/notebook-editor';
import { StudyNoteItem, MindMapData } from '@/types/notebook';
import { CTFL_MINDMAP_TEMPLATES } from '@/lib/mindmap-templates';
import { formatDateBR } from '@/lib/utils';

export function NotebookHub({
  initialNotes,
  chapters,
}: {
  initialNotes: StudyNoteItem[];
  chapters: {
    id: string;
    number: number;
    title: string;
    topics: { id: string; code: string; title: string }[];
  }[];
}) {
  const { toast } = useToast();

  const [notes, setNotes] = React.useState<StudyNoteItem[]>(initialNotes);
  const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(
    initialNotes[0]?.id || null
  );

  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'ALL' | 'MINDMAP' | 'NOTE'>('ALL');
  const [chapterFilter, setChapterFilter] = React.useState('ALL');
  const [saving, setSaving] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);

  const currentNote = notes.find((n) => n.id === selectedNoteId) || null;

  // Filtragem da lista
  const filteredNotes = React.useMemo(() => {
    return notes.filter((n) => {
      if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
      if (chapterFilter !== 'ALL' && n.chapterId !== chapterFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(term);
        const matchContent = n.content.toLowerCase().includes(term);
        if (!matchTitle && !matchContent) return false;
      }
      return true;
    });
  }, [notes, typeFilter, chapterFilter, searchTerm]);

  // Criação de Novo Item
  async function handleCreateNew(type: 'NOTE' | 'MINDMAP', templateId?: string) {
    let initialMindMapData: MindMapData | null = null;
    let initialTitle = type === 'MINDMAP' ? 'Novo Mapa Mental' : 'Nova Anotação de Aula';

    if (templateId) {
      const tmpl = CTFL_MINDMAP_TEMPLATES.find((t) => t.id === templateId);
      if (tmpl) {
        initialTitle = tmpl.name;
        initialMindMapData = tmpl.data;
      }
    }

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: initialTitle,
          type,
          content: '',
          mindMapData: initialMindMapData,
          tags: ['CTFL 4.0.1'],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao criar item',
          description: data.error || 'Tente novamente.',
          variant: 'error',
        });
        return;
      }

      setNotes((prev) => [data.note, ...prev]);
      setSelectedNoteId(data.note.id);
      toast({
        title: type === 'MINDMAP' ? 'Mapa Mental Criado!' : 'Anotação Criada!',
        description: 'Você já pode começar a editar.',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Erro ao conectar',
        description: 'Não foi possível salvar o novo item.',
        variant: 'error',
      });
    }
  }

  // Atualização do Item Atual
  async function handleUpdateCurrent(patch: Partial<StudyNoteItem>) {
    if (!currentNote) return;

    // Atualiza estado local imediatamente
    setNotes((prev) =>
      prev.map((n) => (n.id === currentNote.id ? { ...n, ...patch } : n))
    );

    // Salva no backend
    try {
      setSaving(true);
      await fetch(`/api/notes/${currentNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    } catch {
      // Ignora erro momentâneo
    } finally {
      setSaving(false);
    }
  }

  // Exclusão
  async function handleDeleteNote(id: string) {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) return;

      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNoteId === id) {
        const remaining = notes.filter((n) => n.id !== id);
        setSelectedNoteId(remaining[0]?.id || null);
      }
      toast({
        title: 'Item arquivado',
        description: 'Removido do seu caderno de estudos.',
        variant: 'info',
      });
    } catch {
      toast({
        title: 'Erro ao excluir',
        description: 'Tente novamente.',
        variant: 'error',
      });
    }
  }

  // Fixar / Desafixar
  async function handleTogglePin(id: string, currentPin: boolean) {
    handleUpdateCurrent({ isPinned: !currentPin });
  }

  async function handleConvertToFlashcard(front: string, back: string) {
    if (isConverting) return;
    setIsConverting(true);
    try {
      const res = await fetch('/api/notes/to-flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front,
          back,
          chapterId: currentNote?.chapterId,
          topicId: currentNote?.topicId,
          tags: ['Caderno', currentNote?.title || 'Estudo'],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao gerar flashcard',
          description: data.error || 'Verifique os campos.',
          variant: 'error',
        });
        return;
      }
      toast({
        title: 'Flashcard Criado!',
        description: 'Adicionado à sua rotina de repetição espaçada.',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Erro ao conectar',
        description: 'Não foi possível salvar o flashcard.',
        variant: 'error',
      });
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/25">
              <Brain className="h-5 w-5" />
            </div>
            Caderno & Mapas Mentais
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
            Construa mapas conceituais hierárquicos, organize resumos de rotina de QA e capture trechos das aulas do Syllabus 4.0.1 em um só lugar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleCreateNew('NOTE')}
            className="gap-1.5"
          >
            <StickyNote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Nova Anotação
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleCreateNew('MINDMAP')}
            className="gap-1.5"
          >
            <Brain className="h-4 w-4" />
            Novo Mapa Mental
          </Button>
        </div>
      </div>

      {/* Painel Principal com Coluna Esquerda (Lista) e Direita (Editor/Canvas) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-h-[640px]">
        {/* Coluna Esquerda: Lista de Itens e Filtros */}
        <div className="lg:col-span-4 flex flex-col rounded-3xl border border-border/80 bg-card p-4 space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar em anotações e mapas..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Filtros por Tipo e Capítulo */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Todos ({notes.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('MINDMAP')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                typeFilter === 'MINDMAP'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Mapas ({notes.filter((n) => n.type === 'MINDMAP').length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('NOTE')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                typeFilter === 'NOTE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Notas ({notes.filter((n) => n.type === 'NOTE').length})
            </button>
          </div>

          <Select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="text-xs h-8"
          >
            <option value="ALL">Todos os Capítulos</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Cap. {ch.number} - {ch.title}
              </option>
            ))}
          </Select>

          {/* Lista de Cards de Anotação/Mapa */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[520px]">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p>Nenhuma anotação ou mapa encontrado com este filtro.</p>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateNew('MINDMAP', '7-principios')}
                    className="text-xs gap-1"
                  >
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    Carregar Mapa dos 7 Princípios
                  </Button>
                </div>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = selectedNoteId === note.id;
                const isMindMap = note.type === 'MINDMAP';

                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-colors ${
                      isSelected
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border/60 bg-background/50 hover:bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            isMindMap
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isMindMap ? (
                            <Brain className="h-4 w-4" />
                          ) : (
                            <StickyNote className="h-4 w-4" />
                          )}
                        </div>
                        <span className="truncate font-bold text-xs sm:text-sm">
                          {note.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {note.isPinned && (
                          <Pin className="h-3.5 w-3.5 fill-primary text-primary" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="rounded p-1 text-muted-foreground hover:text-destructive transition opacity-40 hover:opacity-100"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                        {isMindMap ? 'Mapa Mental' : 'Anotação'}
                      </Badge>
                      {note.chapter && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                          Cap. {note.chapter.number}
                        </Badge>
                      )}
                      <span>{formatDateBR(note.updatedAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna Direita: Área de Edição do Mapa ou Anotação */}
        <div className="lg:col-span-8 flex flex-col rounded-3xl border border-border/80 bg-card p-5 space-y-4">
          {currentNote ? (
            <>
              {/* Barra de Edição do Título e Configurações da Nota */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/35 p-3">
                <div className="flex-1 min-w-[200px] flex items-center gap-2">
                  <Input
                    value={currentNote.title}
                    onChange={(e) => handleUpdateCurrent({ title: e.target.value })}
                    className="text-base sm:text-lg font-extrabold bg-transparent border-transparent hover:border-border focus:border-primary h-10 px-2"
                    placeholder="Título da anotação..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(currentNote.id, currentNote.isPinned)}
                    className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors ${
                      currentNote.isPinned
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                    title={currentNote.isPinned ? 'Desafixar do topo' : 'Fixar no topo'}
                  >
                    <Pin className={`h-3.5 w-3.5 ${currentNote.isPinned ? 'fill-primary' : ''}`} />
                    <span className="hidden sm:inline">
                      {currentNote.isPinned ? 'Fixado' : 'Fixar'}
                    </span>
                  </button>

                  <Badge variant="outline" className="text-xs">
                    {saving ? 'Salvando...' : 'Salvo na nuvem'}
                  </Badge>
                </div>
              </div>

              {/* Editor Correspondente (Mapa Mental ou Rich Text) */}
              <div className="flex-1 min-h-[480px]">
                {currentNote.type === 'MINDMAP' ? (
                  <MindMapCanvas
                    key={currentNote.id}
                    initialData={currentNote.mindMapData}
                    onChange={(newData) => handleUpdateCurrent({ mindMapData: newData })}
                    onConvertToFlashcard={handleConvertToFlashcard}
                  />
                ) : (
                  <NotebookEditor
                    key={currentNote.id}
                    initialContent={currentNote.content}
                    onChange={(newContent) => handleUpdateCurrent({ content: newContent })}
                    onConvertToFlashcard={handleConvertToFlashcard}
                    contextTitle={currentNote.title}
                    isConverting={isConverting}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20">
                <Brain className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Nenhum item selecionado</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Selecione um mapa mental existente à esquerda ou crie um novo para começar seus resumos ativos.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCreateNew('NOTE')}
                  className="gap-2"
                >
                  <StickyNote className="h-4 w-4" />
                  Criar Bloco de Notas
                </Button>
                <Button
                  type="button"
                  onClick={() => handleCreateNew('MINDMAP', '7-principios')}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Carregar Template dos 7 Princípios
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
