'use client';

import * as React from 'react';
import {
  Bold,
  Italic,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Smile,
  Copy,
  Sparkles,
  Eye,
  Edit3,
} from 'lucide-react';
import { useToast } from '@/components/providers/toast-provider';
import { FormattedText } from '@/components/ui/formatted-text';

const QA_EMOJIS = [
  '🧠', '🐛', '🎯', '📐', '⚙️', '📦', '🛡️', '🚨', '📋',
  '🔍', '📊', '⚡', '🏆', '💡', '✅', '❌', '📝', '⏳',
];

export function NotebookEditor({
  initialContent = '',
  onChange,
  onConvertToFlashcard,
  contextTitle,
}: {
  initialContent?: string;
  onChange?: (content: string) => void;
  onConvertToFlashcard?: (front: string, back: string) => void;
  contextTitle?: string;
}) {
  const { toast } = useToast();
  const [content, setContent] = React.useState(initialContent);
  const [activeTab, setActiveTab] = React.useState<'editor' | 'preview'>('editor');
  const [emojiPickerOpen, setEmojiPickerOpen] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  function handleChange(val: string) {
    setContent(val);
    onChange?.(val);
  }

  function insertFormatting(prefix: string, suffix = '') {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || 'texto';

    const newContent =
      content.slice(0, start) +
      prefix +
      selected +
      suffix +
      content.slice(end);

    handleChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 10);
  }

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      handleChange(content + ' ' + emoji + ' ');
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      content.slice(0, start) + emoji + content.slice(end);
    handleChange(newContent);
    setEmojiPickerOpen(false);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 10);
  }

  function handleCaptureSelection() {
    const selection = window.getSelection()?.toString().trim();
    if (!selection) {
      toast({
        title: 'Nenhum texto selecionado',
        description:
          'Selecione um trecho de texto da aula ou página com o mouse antes de clicar aqui.',
        variant: 'info',
      });
      return;
    }

    const citation = contextTitle ? `\n\n> *Citação de: ${contextTitle}*\n> "${selection}"\n` : `\n\n> "${selection}"\n`;
    handleChange(content + citation);
    toast({
      title: 'Trecho da Aula Capturado',
      description: 'O texto selecionado foi inserido em suas anotações.',
      variant: 'success',
    });
  }

  function handleCreateFlashcard() {
    const textarea = textareaRef.current;
    const selection = textarea
      ? content.slice(textarea.selectionStart, textarea.selectionEnd).trim()
      : '';

    let front = '';
    let back = '';

    if (selection) {
      const parts = selection.split(/\n|:/);
      front = parts[0]?.trim() || selection;
      back = parts.slice(1).join(' ').trim() || selection;
    } else {
      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      front = lines[0] || 'Conceito CTFL';
      back = lines.slice(1).join('\n') || content;
    }

    if (onConvertToFlashcard) {
      onConvertToFlashcard(front, back);
    } else {
      navigator.clipboard.writeText(`Frente: ${front}\nVerso: ${back}`);
      toast({
        title: 'Copiado para Flashcard',
        description: 'Texto copiado para a área de transferência.',
        variant: 'success',
      });
    }
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border/70 bg-background/50 overflow-hidden shadow-inner">
      {/* Barra de Ferramentas Superior */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-card/60 px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-1">
          {/* Botões de Formatação */}
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Negrito (**)"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Itálico (*)"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('### ')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Subtítulo (###)"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Lista com Marcadores (-)"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('1. ')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Lista Numerada (1.)"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('`', '`')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Código (`)"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('> ')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Citação (>)"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>

          {/* Seletor de Emoji */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
              title="Inserir Emoji"
            >
              <Smile className="h-3.5 w-3.5" />
            </button>
            {emojiPickerOpen && (
              <div className="absolute top-9 left-0 z-30 grid grid-cols-6 gap-1 rounded-xl border border-border bg-popover p-2 shadow-2xl backdrop-blur max-w-[200px]">
                {QA_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => insertEmoji(e)}
                    className="flex h-7 w-7 items-center justify-center rounded hover:bg-secondary text-base hover:scale-125 transition"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* Botão Capturar Seleção da Aula */}
          <button
            type="button"
            onClick={handleCaptureSelection}
            className="flex h-7 items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2 text-[11px] font-semibold text-indigo-400 hover:bg-indigo-500/20 transition"
            title="Capturar trecho selecionado na aula"
          >
            <Copy className="h-3 w-3" />
            <span className="hidden sm:inline">Capturar da Aula</span>
          </button>

          {/* Botão Gerar Flashcard */}
          <button
            type="button"
            onClick={handleCreateFlashcard}
            className="flex h-7 items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 text-[11px] font-semibold text-amber-400 hover:bg-amber-500/20 transition"
            title="Transformar trecho em Flashcard"
          >
            <Sparkles className="h-3 w-3" />
            <span className="hidden sm:inline">Gerar Flashcard</span>
          </button>
        </div>

        {/* Alternância Editor / Visualização */}
        <div className="flex items-center rounded-lg border border-border/60 bg-secondary/40 p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
              activeTab === 'editor'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 className="h-3 w-3" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
              activeTab === 'preview'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="h-3 w-3" />
            Visualizar
          </button>
        </div>
      </div>

      {/* Área Principal: Editor ou Prévia */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'editor' ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Digite suas anotações, use **negrito**, listas, resumos e capture trechos importantes das aulas aqui..."
            className="w-full h-full min-h-[220px] bg-transparent outline-none resize-none font-sans text-sm leading-relaxed text-foreground placeholder:text-muted-foreground"
          />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {content.trim() ? (
              <FormattedText text={content} className="space-y-2 text-sm leading-relaxed" />
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Nenhum conteúdo digitado para visualização.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Rodapé com Dicas e Autosave */}
      <div className="flex items-center justify-between border-t border-border/50 bg-card/40 px-4 py-1.5 text-[11px] text-muted-foreground">
        <span>
          Suporta formatação com **negrito**, *itálico*, ### títulos e listas.
        </span>
        <span className="text-[10px] text-indigo-400 font-semibold">
          Salvo automaticamente
        </span>
      </div>
    </div>
  );
}
