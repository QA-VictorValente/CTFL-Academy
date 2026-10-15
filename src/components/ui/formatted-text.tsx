import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Lightbulb, Sparkles } from 'lucide-react';

export type FontSizeOption = 'sm' | 'base' | 'lg' | 'xl';

/**
 * Converte tokens inline de markdown (**negrito**, *itálico*, `código`) em elementos React reais.
 */
export function renderInlineMarkdown(
  text: string,
  keyPrefix = 'inline'
): React.ReactNode[] {
  if (!text) return [];

  // Regex para capturar **negrito**, *itálico* e `código`
  const tokenRegex = /(\*\*[^\n]+?\*\*|`[^`\n]+`|\*[^\n*]+?\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    const key = `${keyPrefix}-${idx}`;

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={key} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={key}
          className="rounded border border-indigo-500/25 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[0.88em] font-semibold text-indigo-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={key} className="italic text-foreground/90">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}

/**
 * Componente para renderizar textos curtos (enunciados, alternativas, justificativas, títulos)
 * convertendo **negrito**, *itálico* e `código` diretamente sem quebrar em blocos de parágrafos.
 */
export function InlineMarkdown({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;
  return <span className={className}>{renderInlineMarkdown(text)}</span>;
}

const FONT_STYLES: Record<
  FontSizeOption,
  {
    p: string;
    li: string;
    h2: string;
    h3: string;
    callout: string;
  }
> = {
  sm: {
    p: 'text-sm leading-relaxed text-foreground/90 my-1',
    li: 'text-sm leading-relaxed text-foreground/90',
    h2: 'text-base font-extrabold text-indigo-300 mt-4 mb-2',
    h3: 'text-sm font-bold text-indigo-400 mt-3 mb-1.5',
    callout: 'text-sm',
  },
  base: {
    p: 'text-base leading-relaxed text-foreground/95 my-1.5',
    li: 'text-base leading-relaxed text-foreground/95',
    h2: 'text-lg sm:text-xl font-extrabold text-indigo-300 mt-5 mb-2.5',
    h3: 'text-base sm:text-lg font-bold text-indigo-400 mt-4 mb-2',
    callout: 'text-base',
  },
  lg: {
    p: 'text-lg leading-loose text-foreground my-2',
    li: 'text-lg leading-loose text-foreground',
    h2: 'text-xl sm:text-2xl font-extrabold text-indigo-300 mt-6 mb-3',
    h3: 'text-lg sm:text-xl font-bold text-indigo-400 mt-5 mb-2.5',
    callout: 'text-lg',
  },
  xl: {
    p: 'text-xl leading-loose text-foreground my-2.5',
    li: 'text-xl leading-loose text-foreground',
    h2: 'text-2xl sm:text-3xl font-extrabold text-indigo-300 mt-7 mb-3.5',
    h3: 'text-xl sm:text-2xl font-bold text-indigo-400 mt-6 mb-3',
    callout: 'text-xl',
  },
};

/**
 * Componente para renderizar blocos de conteúdo didático (explicações, exemplos, resumos),
 * suportando **negrito**, subtítulos (###), listas com marcadores (-), listas numeradas (1.),
 * caixas de destaque (callouts) e quebras de linha com controle de tamanho de fonte.
 */
export function FormattedText({
  text,
  className,
  fontSize = 'base',
}: {
  text: string;
  className?: string;
  fontSize?: FontSizeOption;
}) {
  if (!text) return null;

  const style = FONT_STYLES[fontSize] || FONT_STYLES.base;
  const lines = text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'bullet' | 'ordered'; items: React.ReactNode[] } | null =
    null;

  function flushList(keySuffix: number) {
    if (!currentList) return;
    if (currentList.type === 'bullet') {
      elements.push(
        <ul key={`ul-${keySuffix}`} className="my-2.5 space-y-2 pl-1">
          {currentList.items.map((item, i) => (
            <li
              key={`li-${keySuffix}-${i}`}
              className={cn('flex items-start gap-2.5', style.li)}
            >
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-400 shadow-sm shadow-indigo-500/50" />
              <div className="flex-1">{item}</div>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${keySuffix}`} className="my-2.5 space-y-2 pl-1">
          {currentList.items.map((item, i) => (
            <li
              key={`oli-${keySuffix}-${i}`}
              className={cn('flex items-start gap-2.5', style.li)}
            >
              <span className="shrink-0 font-bold text-violet-400 text-[0.9em] mt-0.5">
                {i + 1}.
              </span>
              <div className="flex-1">{item}</div>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  }

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(lineIdx);
      elements.push(<div key={`spacer-${lineIdx}`} className="h-2.5" />);
      return;
    }

    // Callout do tipo blockquote (> ...)
    if (trimmed.startsWith('> ')) {
      flushList(lineIdx);
      const quoteContent = trimmed.slice(2).trim();
      elements.push(
        <div
          key={`quote-${lineIdx}`}
          className="my-3 rounded-xl border-l-4 border-indigo-500 bg-indigo-500/10 p-4 shadow-sm"
        >
          <div className={cn('flex items-start gap-3', style.callout)}>
            <Lightbulb className="h-5 w-5 shrink-0 text-indigo-400 mt-0.5" />
            <div className="flex-1 text-foreground/95 leading-relaxed">
              {renderInlineMarkdown(quoteContent, `quote-${lineIdx}`)}
            </div>
          </div>
        </div>
      );
      return;
    }

    // Destaque de Atenção / Cuidado / Importante
    if (
      trimmed.startsWith('**Atenção:**') ||
      trimmed.startsWith('**Importante:**') ||
      trimmed.startsWith('**Cuidado:**')
    ) {
      flushList(lineIdx);
      elements.push(
        <div
          key={`alert-${lineIdx}`}
          className="my-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 shadow-sm shadow-rose-950/20"
        >
          <div className={cn('flex items-start gap-3', style.callout)}>
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 leading-relaxed text-rose-200">
              {renderInlineMarkdown(trimmed, `alert-${lineIdx}`)}
            </div>
          </div>
        </div>
      );
      return;
    }

    // Destaque de Dica / Pegadinha de Prova
    if (
      trimmed.startsWith('**Dica:**') ||
      trimmed.startsWith('**Dica de Exame:**') ||
      trimmed.startsWith('**Pegadinha:**')
    ) {
      flushList(lineIdx);
      elements.push(
        <div
          key={`tip-${lineIdx}`}
          className="my-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-sm shadow-amber-950/20"
        >
          <div className={cn('flex items-start gap-3', style.callout)}>
            <Lightbulb className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1 leading-relaxed text-amber-200">
              {renderInlineMarkdown(trimmed, `tip-${lineIdx}`)}
            </div>
          </div>
        </div>
      );
      return;
    }

    // Destaque de Regra de Ouro / Princípio
    if (
      trimmed.startsWith('**Regra de Ouro:**') ||
      trimmed.startsWith('**Conclusão:**')
    ) {
      flushList(lineIdx);
      elements.push(
        <div
          key={`gold-${lineIdx}`}
          className="my-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-sm shadow-emerald-950/20"
        >
          <div className={cn('flex items-start gap-3', style.callout)}>
            <Sparkles className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
            <div className="flex-1 leading-relaxed text-emerald-200">
              {renderInlineMarkdown(trimmed, `gold-${lineIdx}`)}
            </div>
          </div>
        </div>
      );
      return;
    }

    // Subtítulo h3 (### ...)
    if (trimmed.startsWith('### ')) {
      flushList(lineIdx);
      elements.push(
        <h4 key={`h3-${lineIdx}`} className={style.h3}>
          {renderInlineMarkdown(trimmed.slice(4), `h3-${lineIdx}`)}
        </h4>
      );
      return;
    }

    // Subtítulo h2 (## ...)
    if (trimmed.startsWith('## ')) {
      flushList(lineIdx);
      elements.push(
        <h3 key={`h2-${lineIdx}`} className={style.h2}>
          {renderInlineMarkdown(trimmed.slice(3), `h2-${lineIdx}`)}
        </h3>
      );
      return;
    }

    // Marcador com hífen (- ...) ou asterisco (* ...)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet') {
        flushList(lineIdx);
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push(
        renderInlineMarkdown(bulletMatch[1], `bullet-${lineIdx}`)
      );
      return;
    }

    // Lista numerada (1. ...)
    const orderedMatch = trimmed.match(/^\d+[\.)]\s+(.*)$/);
    if (orderedMatch) {
      if (!currentList || currentList.type !== 'ordered') {
        flushList(lineIdx);
        currentList = { type: 'ordered', items: [] };
      }
      currentList.items.push(
        renderInlineMarkdown(orderedMatch[1], `ord-${lineIdx}`)
      );
      return;
    }

    // Linha comum (parágrafo)
    flushList(lineIdx);
    elements.push(
      <p key={`p-${lineIdx}`} className={style.p}>
        {renderInlineMarkdown(trimmed, `p-${lineIdx}`)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className={cn('space-y-1', className)}>{elements}</div>;
}
