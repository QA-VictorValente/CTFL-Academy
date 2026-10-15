'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  Brain,
  Maximize2,
  Minimize2,
  X,
  SidebarClose,
  SidebarOpen,
  Check,
  StickyNote,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/providers/toast-provider';
import { MindMapCanvas } from '@/components/student/mind-map-canvas';
import { NotebookEditor } from '@/components/student/notebook-editor';
import { MindMapData } from '@/types/notebook';
import { cn } from '@/lib/utils';

const STORAGE_KEY_NOTE = 'ctfl_floating_note_content';
const STORAGE_KEY_MINDMAP = 'ctfl_floating_mindmap_data';
const STORAGE_KEY_DOCK = 'ctfl_floating_notebook_dock';

export function FloatingNotebook() {
  const pathname = usePathname();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'mindmap' | 'notes'>('mindmap');
  const [dockMode, setDockMode] = React.useState<'floating' | 'docked' | 'maximized'>('floating');

  // Dimensões do modo flutuante
  const [width, setWidth] = React.useState(560);
  const [height, setHeight] = React.useState(480);

  // Conteúdo do Caderno e do Mapa Mental
  const [noteContent, setNoteContent] = React.useState('');
  const [mindMapData, setMindMapData] = React.useState<MindMapData | null>(null);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved'>('idle');

  // Detecta se está em uma aula ou capítulo
  const isLessonPage = pathname?.includes('/capitulos/') && pathname?.includes('/topicos/');

  // Carrega estado inicial do localStorage
  React.useEffect(() => {
    try {
      const savedNote = localStorage.getItem(STORAGE_KEY_NOTE);
      if (savedNote) setNoteContent(savedNote);

      const savedMindMap = localStorage.getItem(STORAGE_KEY_MINDMAP);
      if (savedMindMap) setMindMapData(JSON.parse(savedMindMap));

      const savedDock = localStorage.getItem(STORAGE_KEY_DOCK);
      if (savedDock === 'docked' || savedDock === 'maximized' || savedDock === 'floating') {
        setDockMode(savedDock);
      }
    } catch {
      // Ignora erro de storage
    }
  }, []);

  // Atalho de teclado Alt + N para alternar o caderno
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Detecta rolagem ativa da página para atenuar o botão e não obstruir a leitura
  const [isScrolling, setIsScrolling] = React.useState(false);

  React.useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout>;

    function handleScroll() {
      setIsScrolling(true);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 700);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  // Debounced auto-save para localStorage
  React.useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_NOTE, noteContent);
        if (mindMapData) {
          localStorage.setItem(STORAGE_KEY_MINDMAP, JSON.stringify(mindMapData));
        }
        setSaveStatus('saved');
      } catch {
        setSaveStatus('idle');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [noteContent, mindMapData]);

  // Manipulador de redimensionamento por arrasto
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    function onMouseMove(moveEvent: MouseEvent) {
      const deltaX = startX - moveEvent.clientX;
      const deltaY = startY - moveEvent.clientY;
      setWidth(Math.max(380, Math.min(window.innerWidth - 40, startWidth + deltaX)));
      setHeight(Math.max(320, Math.min(window.innerHeight - 80, startHeight + deltaY)));
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  async function handleConvertToFlashcard(front: string, back: string) {
    try {
      const res = await fetch('/api/notes/to-flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front,
          back,
          tags: ['Caderno Flutuante', 'Autoral'],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao criar flashcard',
          description: data.error || 'Tente novamente.',
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
    }
  }

  // Não renderiza em páginas administrativas
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Botão Flutuante de Disparo (canto inferior direito) */}
      {!isOpen && (
        <button
          id="floating-notebook-btn"
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-4 right-2.5 sm:bottom-5 sm:right-3.5 z-40 flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-2 sm:px-3 sm:py-2 font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:scale-105 active:scale-95 group',
            isScrolling
              ? 'opacity-35 hover:opacity-100 hover:scale-105'
              : 'opacity-95 hover:opacity-100'
          )}
          title="Abrir Caderno de Estudos e Mapa Mental (Alt + N)"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-white">
            <Brain className="h-3.5 w-3.5 transition group-hover:rotate-12" />
          </div>
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span className="text-[11px] font-bold">Caderno & Mapas</span>
            <span className="text-[9px] text-indigo-200">Alt + N</span>
          </div>
          {isLessonPage && (
            <span className="ml-0.5 flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      )}

      {/* Janela Flutuante / Acoplada do Caderno */}
      {isOpen && (
        <div
          style={
            dockMode === 'floating'
              ? {
                  width: `${width}px`,
                  height: `${height}px`,
                  bottom: '24px',
                  right: '24px',
                }
              : dockMode === 'docked'
              ? {
                  width: '420px',
                  height: '100vh',
                  top: '0',
                  right: '0',
                  borderRadius: '0',
                }
              : {
                  width: 'calc(100vw - 48px)',
                  height: 'calc(100vh - 48px)',
                  top: '24px',
                  left: '24px',
                }
          }
          className={`fixed z-50 flex flex-col border border-indigo-500/30 bg-card/95 text-card-foreground shadow-2xl backdrop-blur-xl transition-all ${
            dockMode === 'floating'
              ? 'rounded-3xl'
              : dockMode === 'docked'
              ? 'border-l border-y-0 border-r-0'
              : 'rounded-3xl'
          }`}
        >
          {/* Alça de redimensionamento no canto superior esquerdo (apenas no modo floating) */}
          {dockMode === 'floating' && (
            <div
              onMouseDown={handleResizeMouseDown}
              className="absolute top-0 left-0 h-6 w-6 cursor-nwse-resize z-50 flex items-center justify-center opacity-40 hover:opacity-100 transition"
              title="Arraste para redimensionar"
            >
              <div className="h-2 w-2 rounded-full border-t-2 border-l-2 border-primary" />
            </div>
          )}

          {/* Cabeçalho da Janela */}
          <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-indigo-950/40 via-card to-violet-950/30 px-4 py-3 select-none">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold tracking-tight flex items-center gap-1.5">
                  Caderno & Mapa Mental
                  {isLessonPage && (
                    <Badge variant="purple" className="text-[9px] px-1.5 py-0 h-4">
                      Aula Ativa
                    </Badge>
                  )}
                </h3>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {saveStatus === 'saving' ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Check className="h-2.5 w-2.5 text-emerald-400" /> Salvo no navegador
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Alternância de Abas: Mapa Mental / Anotações */}
            <div className="flex items-center rounded-xl border border-border/60 bg-secondary/50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('mindmap')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  activeTab === 'mindmap'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Brain className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mapa Mental</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  activeTab === 'notes'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <StickyNote className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Anotações</span>
              </button>
            </div>

            {/* Controles de Janela: Encaixar, Maximizar, Fechar */}
            <div className="flex items-center gap-1 text-muted-foreground">
              {/* Botão Encaixar na Direita (Split-Screen) */}
              <button
                type="button"
                onClick={() => {
                  const next = dockMode === 'docked' ? 'floating' : 'docked';
                  setDockMode(next);
                  localStorage.setItem(STORAGE_KEY_DOCK, next);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary hover:text-foreground transition"
                title={dockMode === 'docked' ? 'Desencaixar janela' : 'Encaixar na lateral direita (Split-Screen)'}
              >
                {dockMode === 'docked' ? (
                  <SidebarOpen className="h-3.5 w-3.5" />
                ) : (
                  <SidebarClose className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Botão Maximizar / Restaurar */}
              <button
                type="button"
                onClick={() => {
                  const next = dockMode === 'maximized' ? 'floating' : 'maximized';
                  setDockMode(next);
                  localStorage.setItem(STORAGE_KEY_DOCK, next);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary hover:text-foreground transition"
                title={dockMode === 'maximized' ? 'Restaurar tamanho' : 'Maximizar'}
              >
                {dockMode === 'maximized' ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Botão Fechar */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-destructive/20 hover:text-destructive transition"
                title="Fechar (Alt + N)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 overflow-hidden p-2 sm:p-3 bg-background/40">
            {activeTab === 'mindmap' ? (
              <MindMapCanvas
                initialData={mindMapData}
                onChange={(newData) => setMindMapData(newData)}
                onConvertToFlashcard={handleConvertToFlashcard}
              />
            ) : (
              <NotebookEditor
                initialContent={noteContent}
                onChange={(newContent) => setNoteContent(newContent)}
                onConvertToFlashcard={handleConvertToFlashcard}
                contextTitle={isLessonPage ? 'Aula atual do Syllabus CTFL 4.0.1' : undefined}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
