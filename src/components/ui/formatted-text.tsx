import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Converte tokens inline de markdown (**negrito**, *itálico*, `código`) em elementos React reais.
 */
export function renderInlineMarkdown(
  text: string,
  keyPrefix = 'inline'
): React.ReactNode[] {
  if (!text) return [];

  // Regex para capturar **negrito**, *itálico* e `código`
  // Grupo 1: **...**
  // Grupo 2: `...`
  // Grupo 3: *...*
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
          className="rounded border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-indigo-300"
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

/**
 * Componente para renderizar blocos de conteúdo didático (explicações, exemplos, resumos),
 * suportando **negrito**, subtítulos (###), listas com marcadores (-), listas numeradas (1.) e quebras de linha.
 */
export function FormattedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  const lines = text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'bullet' | 'ordered'; items: React.ReactNode[] } | null =
    null;

  function flushList(keySuffix: number) {
    if (!currentList) return;
    if (currentList.type === 'bullet') {
      elements.push(
        <ul key={`ul-${keySuffix}`} className="my-2 space-y-1.5 pl-1">
          {currentList.items.map((item, i) => (
            <li
              key={`li-${keySuffix}-${i}`}
              className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90"
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              <div className="flex-1">{item}</div>
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${keySuffix}`} className="my-2 space-y-1.5 pl-1">
          {currentList.items.map((item, i) => (
            <li
              key={`oli-${keySuffix}-${i}`}
              className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90"
            >
              <span className="shrink-0 font-semibold text-violet-400 text-xs mt-0.5">
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
      elements.push(<div key={`spacer-${lineIdx}`} className="h-2" />);
      return;
    }

    // Subtítulo h3 (### ...)
    if (trimmed.startsWith('### ')) {
      flushList(lineIdx);
      elements.push(
        <h4
          key={`h3-${lineIdx}`}
          className="mt-4 mb-2 text-sm font-bold tracking-tight text-indigo-400 sm:text-base"
        >
          {renderInlineMarkdown(trimmed.slice(4), `h3-${lineIdx}`)}
        </h4>
      );
      return;
    }

    // Subtítulo h2 (## ...)
    if (trimmed.startsWith('## ')) {
      flushList(lineIdx);
      elements.push(
        <h3
          key={`h2-${lineIdx}`}
          className="mt-5 mb-2.5 text-base font-extrabold tracking-tight text-indigo-300 sm:text-lg"
        >
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
      <p
        key={`p-${lineIdx}`}
        className="my-1 text-sm leading-relaxed text-foreground/90"
      >
        {renderInlineMarkdown(trimmed, `p-${lineIdx}`)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className={cn('space-y-1', className)}>{elements}</div>;
}
