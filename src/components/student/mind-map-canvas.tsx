'use client';

import * as React from 'react';
import {
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Palette,
  Copy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/providers/toast-provider';
import { MindMapNode, MindMapData } from '@/types/notebook';
import { CTFL_MINDMAP_TEMPLATES } from '@/lib/mindmap-templates';

const QA_EMOJIS = [
  '\u{1F9E0}', '\u{1F41B}', '\u{1F3AF}', '\u{1F4D0}', '\u{2699}\u{FE0F}', '\u{1F4E6}', '\u{1F6E1}\u{FE0F}', '\u{1F6A8}', '\u{1F4CB}',
  '\u{1F50D}', '\u{1F4CA}', '\u{26A1}', '\u{1F3C6}', '\u{1F52C}', '\u{1F517}', '\u{1F5A5}\u{FE0F}', '\u{1F310}', '\u{270D}\u{FE0F}',
  '\u{1F3A8}', '\u{1F9F1}', '\u{23F3}', '\u{1F4B0}', '\u{1F9EA}', '\u{1F634}', '\u{1F504}', '\u{1F6AB}', '\u{1F4A1}',
  '\u{1F4C4}', '\u{1F33F}', '\u{1F575}\u{FE0F}', '\u{1F9ED}', '\u{1F6E0}\u{FE0F}', '\u{1F680}', '\u{1F3C1}', '\u{1F4DD}', '\u{1F4C5}',
];

const NODE_COLORS = [
  { name: 'Teal', value: '#0e8074' },
  { name: 'Esmeralda', value: '#059669' },
  { name: 'Azul Petróleo', value: '#0284c7' },
  { name: 'Âmbar', value: '#d97706' },
  { name: 'Terracota', value: '#e11d48' },
  { name: 'Ciano', value: '#0891b2' },
  { name: 'Grafite', value: '#475569' },
];

function generateId(prefix = 'node'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function MindMapCanvas({
  initialData,
  onChange,
  onConvertToFlashcard,
  readOnly = false,
}: {
  initialData?: MindMapData | null;
  onChange?: (data: MindMapData) => void;
  onConvertToFlashcard?: (front: string, back: string) => void;
  readOnly?: boolean;
}) {
  const { toast } = useToast();

  const [data, setData] = React.useState<MindMapData>(() => {
    if (initialData?.root) return initialData;
    return {
      version: 1,
      root: {
        id: generateId('root'),
        text: 'Conceito Central CTFL v4.0.1',
        emoji: '\u{1F9E0}',
        color: '#0e8074',
        children: [
          {
            id: generateId('node'),
            text: 'Primeiro Tópico',
            emoji: '\u{1F3AF}',
            color: '#059669',
            children: [
              { id: generateId('node'), text: 'Detalhe ou Regra de Teste', emoji: '\u{1F4A1}' },
            ],
          },
          {
            id: generateId('node'),
            text: 'Segundo Tópico',
            emoji: '\u{2699}\u{FE0F}',
            color: '#0284c7',
            children: [
              { id: generateId('node'), text: 'Exemplo prático de QA', emoji: '\u{1F4CB}' },
            ],
          },
        ],
      },
    };
  });

  const [zoom, setZoom] = React.useState(1);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [activePicker, setActivePicker] = React.useState<{
    nodeId: string;
    type: 'emoji' | 'color';
  } | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Propaga mudanças para o pai
  const updateTree = React.useCallback(
    (updater: (prevRoot: MindMapNode) => MindMapNode) => {
      setData((prev) => {
        const newRoot = updater(prev.root);
        const nextData = { ...prev, root: newRoot };
        onChange?.(nextData);
        return nextData;
      });
    },
    [onChange]
  );

  // Operações de Árvore
  function updateNode(nodeId: string, patch: Partial<MindMapNode>) {
    updateTree((root) => {
      function walk(node: MindMapNode): MindMapNode {
        if (node.id === nodeId) {
          return { ...node, ...patch };
        }
        if (!node.children) return node;
        return {
          ...node,
          children: node.children.map(walk),
        };
      }
      return walk(root);
    });
  }

  function addChildNode(parentId: string) {
    const newNode: MindMapNode = {
      id: generateId('node'),
      text: 'Novo subtópico',
      emoji: '\u{1F4A1}',
    };

    updateTree((root) => {
      function walk(node: MindMapNode): MindMapNode {
        if (node.id === parentId) {
          return {
            ...node,
            isExpanded: true,
            children: [...(node.children || []), newNode],
          };
        }
        if (!node.children) return node;
        return {
          ...node,
          children: node.children.map(walk),
        };
      }
      return walk(root);
    });
    setSelectedNodeId(newNode.id);
  }

  function addSiblingNode(targetNodeId: string) {
    const newNode: MindMapNode = {
      id: generateId('node'),
      text: 'Novo tópico irmão',
      emoji: '\u{1F3AF}',
    };

    updateTree((root) => {
      if (root.id === targetNodeId) return root; // Root não tem irmão
      function walk(parent: MindMapNode): MindMapNode {
        if (!parent.children) return parent;
        const index = parent.children.findIndex((c) => c.id === targetNodeId);
        if (index !== -1) {
          const newChildren = [...parent.children];
          newChildren.splice(index + 1, 0, newNode);
          return { ...parent, children: newChildren };
        }
        return {
          ...parent,
          children: parent.children.map(walk),
        };
      }
      return walk(root);
    });
    setSelectedNodeId(newNode.id);
  }

  function deleteNode(targetNodeId: string) {
    if (targetNodeId === data.root.id) {
      toast({
        title: 'Ação não permitida',
        description: 'O nó central da raiz não pode ser excluído.',
        variant: 'info',
      });
      return;
    }

    updateTree((root) => {
      function walk(parent: MindMapNode): MindMapNode {
        if (!parent.children) return parent;
        return {
          ...parent,
          children: parent.children
            .filter((c) => c.id !== targetNodeId)
            .map(walk),
        };
      }
      return walk(root);
    });
    if (selectedNodeId === targetNodeId) {
      setSelectedNodeId(null);
    }
  }

  function toggleCollapse(nodeId: string) {
    updateNode(nodeId, {
      isExpanded:
        findNode(data.root, nodeId)?.isExpanded === false ? true : false,
    });
  }

  function findNode(node: MindMapNode, id: string): MindMapNode | null {
    if (node.id === id) return node;
    if (!node.children) return null;
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  }

  function handleLoadTemplate(templateId: string) {
    const tmpl = CTFL_MINDMAP_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;
    setData(tmpl.data);
    onChange?.(tmpl.data);
    toast({
      title: 'Template CTFL Carregado',
      description: `"${tmpl.name}" carregado no mapa mental com sucesso!`,
      variant: 'success',
    });
  }

  function handleCreateFlashcardFromNode(node: MindMapNode) {
    const front = `${node.emoji ? `${node.emoji} ` : ''}${node.text}`;
    let back = '';
    if (node.children && node.children.length > 0) {
      back = node.children
        .map((c) => `• ${c.emoji ? `${c.emoji} ` : ''}${c.text}`)
        .join('\n');
    } else {
      back = node.notes || 'Definição a revisar.';
    }

    if (onConvertToFlashcard) {
      onConvertToFlashcard(front, back);
    } else {
      // Copia para área de transferência
      navigator.clipboard.writeText(`Frente: ${front}\nVerso:\n${back}`);
      toast({
        title: 'Copiado para Flashcard',
        description: 'Frente e verso copiados para a área de transferência.',
        variant: 'success',
      });
    }
  }

  function handleCopyAsText() {
    function stringify(node: MindMapNode, indent = 0): string {
      const prefix = '  '.repeat(indent) + (indent > 0 ? '- ' : '# ');
      const line = `${prefix}${node.emoji ? `${node.emoji} ` : ''}${node.text}`;
      const childLines = (node.children || [])
        .map((c) => stringify(c, indent + 1))
        .join('\n');
      return childLines ? `${line}\n${childLines}` : line;
    }

    const text = stringify(data.root);
    navigator.clipboard.writeText(text);
    toast({
      title: 'Mapa Copiado como Texto',
      description: 'Estrutura hierárquica copiada em formato Markdown.',
      variant: 'success',
    });
  }

  // Renderizador Recursivo dos Nós
  const renderNode = (
    node: MindMapNode,
    isRoot = false,
    parentColor?: string
  ) => {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = node.isExpanded !== false;
    const currentColor = node.color || parentColor || '#0e8074';
    const isSelected = selectedNodeId === node.id;

    return (
      <div key={node.id} className="flex items-center">
        {/* Caixa do Nó */}
        <div
          onClick={() => setSelectedNodeId(node.id)}
          className={`group relative flex items-center gap-2 rounded-2xl border px-3.5 py-2 transition-colors ${
            isRoot
              ? 'bg-primary/10 border-primary/40'
              : 'bg-card hover:bg-secondary/40 border-border/80'
          } ${
            isSelected
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              : ''
          }`}
          style={{
            borderLeftWidth: isRoot ? '2px' : '4px',
            borderLeftColor: currentColor,
          }}
        >
          {/* Seletor de Emoji */}
          <button
            type="button"
            disabled={readOnly}
            onClick={(e) => {
              e.stopPropagation();
              setActivePicker((prev) =>
                prev?.nodeId === node.id && prev.type === 'emoji'
                  ? null
                  : { nodeId: node.id, type: 'emoji' }
              );
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-secondary/50 text-base hover:scale-110 transition active:scale-95"
            title="Alterar emoji"
          >
            {node.emoji || '\u{1F4A1}'}
          </button>

          {/* Campo de Texto Editável */}
          {readOnly ? (
            <span className={`font-semibold ${isRoot ? 'text-base' : 'text-xs sm:text-sm'}`}>
              {node.text}
            </span>
          ) : (
            <input
              type="text"
              value={node.text}
              onChange={(e) => updateNode(node.id, { text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSiblingNode(node.id);
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  addChildNode(node.id);
                }
              }}
              className={`bg-transparent outline-none font-semibold text-foreground focus:ring-1 focus:ring-primary/40 rounded px-1 ${
                isRoot ? 'text-base font-extrabold min-w-[200px]' : 'text-xs sm:text-sm min-w-[140px]'
              }`}
            />
          )}

          {/* Botão de Expandir / Recolher Filhos */}
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(node.id);
              }}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground text-xs"
              title={isExpanded ? 'Recolher ramo' : 'Expandir ramo'}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}

          {/* Barra de Ações Rápidas Flutuante no Hover */}
          {!readOnly && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 rounded-lg border border-border bg-popover px-1.5 py-0.5 z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addChildNode(node.id);
                }}
                className="rounded p-1 text-xs hover:bg-secondary text-primary"
                title="Adicionar nó filho (Tab)"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePicker((prev) =>
                    prev?.nodeId === node.id && prev.type === 'color'
                      ? null
                      : { nodeId: node.id, type: 'color' }
                  );
                }}
                className="rounded p-1 text-xs hover:bg-secondary text-muted-foreground hover:text-foreground"
                title="Alterar cor do ramo"
              >
                <Palette className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateFlashcardFromNode(node);
                }}
                className="rounded p-1 text-xs hover:bg-secondary text-amber-400"
                title="Gerar Flashcard deste conceito"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </button>
              {!isRoot && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                  className="rounded p-1 text-xs hover:bg-destructive/20 text-destructive"
                  title="Excluir nó"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Popover de Emojis */}
          {activePicker?.nodeId === node.id && activePicker.type === 'emoji' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-10 left-0 z-30 grid grid-cols-6 gap-1 rounded-xl border border-border bg-popover p-2 max-w-[200px]"
            >
              {QA_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    updateNode(node.id, { emoji });
                    setActivePicker(null);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-secondary text-base hover:scale-125 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Popover de Cores */}
          {activePicker?.nodeId === node.id && activePicker.type === 'color' && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-10 left-0 z-30 flex items-center gap-1.5 rounded-xl border border-border bg-popover p-2"
            >
              {NODE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    updateNode(node.id, { color: c.value });
                    setActivePicker(null);
                  }}
                  className="h-6 w-6 rounded-full border-2 border-border transition hover:scale-125"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Linha de Conexão e Filhos */}
        {hasChildren && isExpanded && (
          <div className="relative ml-6 flex flex-col gap-4 border-l-2 border-primary/25 pl-6 my-2">
            {node.children!.map((child) => renderNode(child, false, currentColor))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border/70 bg-background/50 overflow-hidden">
      {/* Barra de Ferramentas Superior */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-secondary/40 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Mapa Mental CTFL
          </Badge>

          {/* Seletor de Templates Oficiais */}
          {!readOnly && (
            <select
              aria-label="Modelos Oficiais do Syllabus CTFL"
              onChange={(e) => {
                if (e.target.value) handleLoadTemplate(e.target.value);
              }}
              defaultValue=""
              className="h-7 rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none text-muted-foreground hover:text-foreground"
            >
              <option value="" disabled>
                Carregar Template Oficial...
              </option>
              {CTFL_MINDMAP_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Controles de Zoom e Ações */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Aumentar zoom"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Diminuir zoom"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Resetar zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <span className="mx-0.5" />

          <button
            type="button"
            onClick={handleCopyAsText}
            className="flex h-7 items-center gap-1 rounded-lg border border-border/60 px-2 hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Copiar estrutura em texto"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copiar Texto</span>
          </button>
        </div>
      </div>

      {/* Área do Canvas com Scroll e Zoom */}
      <div
        ref={containerRef}
        onClick={() => {
          setSelectedNodeId(null);
          setActivePicker(null);
        }}
        className="flex-1 overflow-auto p-8 bg-secondary/20"
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.1s ease-out',
          }}
          className="inline-block min-w-full min-h-full"
        >
          {renderNode(data.root, true)}
        </div>
      </div>

      {/* Dica de Teclado no Rodapé */}
      {!readOnly && (
        <div className="flex items-center justify-between bg-secondary/35 px-4 py-1.5 text-xs text-muted-foreground">
          <span>
            Dica: clique em um nó e pressione <strong>Tab</strong> para criar um
            ramo filho ou <strong>Enter</strong> para criar um irmão.
          </span>
          <span className="text-xs text-primary font-semibold">
            Salvo automaticamente
          </span>
        </div>
      )}
    </div>
  );
}
