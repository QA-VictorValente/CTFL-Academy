'use client';

import * as React from 'react';
import {
  Search,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  Check,
  Code2,
  Globe,
  Database,
  Server,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FormattedText, InlineMarkdown, type FontSizeOption } from '@/components/ui/formatted-text';
import { useToast } from '@/components/providers/toast-provider';

// -------------------------------------------------------------
// 1. GLOSSÁRIO INTERATIVO COM MODO DE MEMORIZAÇÃO ATIVA
// -------------------------------------------------------------
export interface GlossaryItem {
  term: string;
  definition: string;
}

export function InteractiveGlossary({
  definitions,
  fontSize = 'base',
}: {
  definitions: GlossaryItem[];
  fontSize?: FontSizeOption;
}) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [hiddenDefs, setHiddenDefs] = React.useState<Record<string, boolean>>({});
  const [masteredTerms, setMasteredTerms] = React.useState<Record<string, boolean>>({});
  const [activeSpeechTerm, setActiveSpeechTerm] = React.useState<string | null>(null);
  const { toast } = useToast();

  const filtered = React.useMemo(() => {
    if (!searchTerm.trim()) return definitions;
    const q = searchTerm.toLowerCase();
    return definitions.filter(
      (d) =>
        d.term.toLowerCase().includes(q) ||
        d.definition.toLowerCase().includes(q)
    );
  }, [definitions, searchTerm]);

  function toggleHide(term: string) {
    setHiddenDefs((prev) => ({ ...prev, [term]: !prev[term] }));
  }

  function toggleMastered(term: string) {
    const isNowMastered = !masteredTerms[term];
    setMasteredTerms((prev) => ({ ...prev, [term]: isNowMastered }));
    if (isNowMastered) {
      toast({
        title: 'Termo fixado!',
        description: `"${term}" marcado como dominado no seu estudo.`,
        variant: 'success',
      });
    }
  }

  function speakTerm(term: string, definition: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({
        title: 'Áudio não suportado',
        description: 'Seu navegador não possui suporte a síntese de voz nativa.',
        variant: 'info',
      });
      return;
    }

    if (activeSpeechTerm === term) {
      window.speechSynthesis.cancel();
      setActiveSpeechTerm(null);
      return;
    }

    window.speechSynthesis.cancel();
    const text = `${term}. Definição oficial: ${definition}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;

    utterance.onend = () => setActiveSpeechTerm(null);
    utterance.onerror = () => setActiveSpeechTerm(null);

    setActiveSpeechTerm(term);
    window.speechSynthesis.speak(utterance);
  }

  const masteredCount = Object.values(masteredTerms).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar termo ou conceito no glossário..."
            className="pl-9 bg-background/50 border-border"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="font-semibold">
            {masteredCount} de {definitions.length} termos dominados
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const allHidden: Record<string, boolean> = {};
              definitions.forEach((d) => (allHidden[d.term] = true));
              setHiddenDefs((prev) =>
                Object.keys(prev).length === definitions.length ? {} : allHidden
              );
            }}
            className="text-xs text-primary hover:text-primary/80"
          >
            <EyeOff className="h-3.5 w-3.5 mr-1" />
            Desafio de Memória (Ocultar Tudo)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {filtered.map((def) => {
          const isHidden = hiddenDefs[def.term] ?? false;
          const isMastered = masteredTerms[def.term] ?? false;
          const isSpeaking = activeSpeechTerm === def.term;

          return (
            <Card
              key={def.term}
              className={cn(
                'transition-colors duration-200 border-border bg-card',
                isMastered && 'border-emerald-500/45 bg-emerald-500/5'
              )}
            >
              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-base">
                      {def.term}
                    </span>
                    {isMastered && (
                      <Badge variant="success" className="h-5 px-1.5 text-xs">
                        Dominado
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => speakTerm(def.term, def.definition)}
                      className={cn(
                        'h-7 w-7 p-0 text-muted-foreground hover:text-primary',
                        isSpeaking && 'text-primary bg-primary/15'
                      )}
                      title="Ouvir definição em áudio"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHide(def.term)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title={isHidden ? 'Revelar definição' : 'Ocultar para testar memória'}
                    >
                      {isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMastered(def.term)}
                      className={cn(
                        'h-7 w-7 p-0 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400',
                        isMastered && 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15'
                      )}
                      title={isMastered ? 'Desmarcar como dominado' : 'Marcar como dominado'}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {isHidden ? (
                  <div
                    onClick={() => toggleHide(def.term)}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer rounded-lg border border-dashed border-primary/35 bg-primary/5 p-3 text-center text-xs text-primary hover:bg-primary/10 transition-colors"
                  >
                    Definição oculta. Tente lembrar com suas palavras e clique para conferir!
                  </div>
                ) : (
                  <p
                    className={cn(
                      'leading-relaxed text-foreground/90',
                      fontSize === 'sm' && 'text-sm',
                      fontSize === 'base' && 'text-base',
                      fontSize === 'lg' && 'text-lg',
                      fontSize === 'xl' && 'text-xl'
                    )}
                  >
                    <InlineMarkdown text={def.definition} />
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. PAUSA RÁPIDA DE FIXAÇÃO (MICRO-CHECKPOINT INTERATIVO)
// -------------------------------------------------------------
export interface MicroCheckpointQuestion {
  question: string;
  options: { label: string; text: string; isCorrect: boolean; feedback: string }[];
}

export function InlineCheckpoint({
  checkpoint,
  onCompleted,
}: {
  checkpoint: MicroCheckpointQuestion;
  onCompleted?: () => void;
}) {
  const [selectedLabel, setSelectedLabel] = React.useState<string | null>(null);
  const [revealed, setRevealed] = React.useState(false);
  const { toast } = useToast();

  const selectedOpt = checkpoint.options.find((o) => o.label === selectedLabel);

  function handleSelect(label: string) {
    if (revealed) return;
    setSelectedLabel(label);
    setRevealed(true);

    const opt = checkpoint.options.find((o) => o.label === label);
    if (opt?.isCorrect) {
      toast({
        title: 'Mandou bem! Resposta Correta!',
        description: opt.feedback,
        variant: 'success',
      });
      onCompleted?.();
    } else {
      toast({
        title: 'Quase lá!',
        description: opt?.feedback || 'Confira a explicação abaixo para fixar o conceito.',
        variant: 'info',
      });
    }
  }

  function handleReset() {
    setSelectedLabel(null);
    setRevealed(false);
  }

  return (
    <div className="my-6 rounded-2xl border border-primary/30 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/35 p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-primary">
              Pausa Rápida de Fixação (Active Recall)
            </h4>
            <p className="text-xs text-muted-foreground">
              Teste seu entendimento antes de avançar para a próxima seção
            </p>
          </div>
        </div>

        {revealed && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Tentar Novamente
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-base sm:text-lg font-bold text-foreground leading-snug">
          {checkpoint.question}
        </p>

        <div className="space-y-2">
          {checkpoint.options.map((opt) => {
            const isSelected = selectedLabel === opt.label;
            return (
              <button
                key={opt.label}
                type="button"
                disabled={revealed}
                onClick={() => handleSelect(opt.label)}
                className={cn(
                  'w-full flex items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors',
                  !revealed && 'border-border/70 bg-background/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer',
                  revealed && opt.isCorrect && 'border-emerald-500/70 bg-emerald-500/15 text-foreground font-semibold',
                  revealed && isSelected && !opt.isCorrect && 'border-rose-500/70 bg-rose-500/15 text-foreground'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-bold text-xs',
                    !revealed && 'border-border bg-muted/30 text-muted-foreground',
                    revealed && opt.isCorrect && 'border-emerald-500 bg-emerald-500 text-black',
                    revealed && isSelected && !opt.isCorrect && 'border-rose-500 bg-rose-500 text-white'
                  )}
                >
                  {opt.label}
                </span>
                <span className="flex-1">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {revealed && selectedOpt && (
          <div
            className={cn(
              'rounded-xl border p-4 text-xs sm:text-sm leading-relaxed space-y-1',
              selectedOpt.isCorrect
                ? 'border-emerald-500/35 bg-emerald-500/10 text-foreground'
                : 'border-amber-500/35 bg-amber-500/10 text-foreground'
            )}
          >
            <p className="font-bold flex items-center gap-1.5">
              {selectedOpt.isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Excelente! Explicação:
                </>
              ) : (
                <>
                  <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Atenção ao conceito:
                </>
              )}
            </p>
            <p className="opacity-95">{selectedOpt.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. PLAYER DE NARRAÇÃO DA AULA (OUVIR AULA COM VOZ CALMA / SELETOR)
// -------------------------------------------------------------
function cleanTextForNaturalSpeech(raw: string): string {
  return raw
    .replace(/\*\*/g, '')
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/`/g, '')
    .replace(/>/g, '')
    .replace(/QA\b/g, 'Q. A.')
    .replace(/CTFL\b/g, 'C. T. F. L.')
    .replace(/ISTQB\b/g, 'I. S. T. Q. B.')
    .replace(/BSTQB\b/g, 'B. S. T. Q. B.')
    .replace(/vs\./gi, 'versus')
    .replace(/e\.g\./gi, 'por exemplo')
    .replace(/i\.e\./gi, 'isto é')
    .replace(/[-*•]\s+/g, '. ')
    .replace(/\n\s*\n/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getVoiceQualityScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  // Vozes neurais online de máxima naturalidade (Edge / Azure Cognitive)
  if (name.includes('francisca') || name.includes('thalita')) return 100;
  if (name.includes('natural') || name.includes('online') || name.includes('neural')) return 95;
  if (name.includes('antonio')) return 90;
  // Voz neural remota do Chrome
  if (name.includes('google português') || name.includes('google')) return 80;
  // Vozes modernas de smartphone ou complementares
  if (
    name.includes('leticia') ||
    name.includes('luciana') ||
    name.includes('yara') ||
    name.includes('vitoria') ||
    name.includes('vitória')
  ) {
    return 70;
  }
  // Vozes antigas legadas de Desktop (robóticas SAPI)
  if (name.includes('desktop') || name.includes('sapi')) return 10;
  return 40;
}

function getVoiceLabel(voice: SpeechSynthesisVoice): string {
  const name = voice.name;
  const lower = name.toLowerCase();

  const isNatural =
    lower.includes('natural') ||
    lower.includes('online') ||
    lower.includes('neural');
  const isGoogle = lower.includes('google');
  const isDesktop = lower.includes('desktop') || lower.includes('sapi');

  const cleanName = name
    .replace(/Microsoft /g, '')
    .replace(/Online \(Natural\) - /g, '')
    .replace(/Portuguese \(Brazil\)/g, '')
    .replace(/\(Brazil\)/g, '')
    .replace(/-/g, '')
    .trim();

  if (name.includes('Francisca') || name.includes('Thalita')) {
    return `${cleanName} (Natural HD)`;
  }
  if (name.includes('Antonio')) {
    return `${cleanName} (Natural HD)`;
  }
  if (isNatural) {
    return `${cleanName} (Natural HD)`;
  }
  if (isGoogle) {
    return `Google Português (Online HD)`;
  }
  if (isDesktop) {
    return `${cleanName} (Desktop)`;
  }
  return cleanName;
}

export function AudioLessonPlayer({
  title,
  textToRead,
}: {
  title: string;
  textToRead: string;
}) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [rate, setRate] = React.useState<number>(0.95);
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = React.useState<string>('');
  const [showVoiceTips, setShowVoiceTips] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    function populateVoices() {
      const allVoices = window.speechSynthesis.getVoices();
      if (!allVoices || allVoices.length === 0) return;

      // Filtra vozes em português prioritariamente
      const ptVoices = allVoices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith('pt') ||
          v.lang.toLowerCase().includes('br')
      );
      const list = ptVoices.length > 0 ? ptVoices : allVoices;

      // Ordena estritamente por qualidade (vozes neurais/naturais e Google no topo, robóticas de desktop no fim)
      const sorted = [...list].sort(
        (a, b) => getVoiceQualityScore(b) - getVoiceQualityScore(a)
      );
      setVoices(sorted);

      // Verifica se o usuário já salvou uma preferência de voz anterior
      try {
        const saved = localStorage.getItem('ctfl_preferred_voice_uri');
        if (saved && sorted.some((v) => v.voiceURI === saved)) {
          setSelectedVoiceUri(saved);
          return;
        }
      } catch {}

      // Se não há preferência anterior, seleciona automaticamente a voz de melhor qualidade disponível
      if (sorted.length > 0) {
        setSelectedVoiceUri(sorted[0].voiceURI);
      }
    }

    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function handlePlay() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({
        title: 'Síntese de voz indisponível',
        description: 'Seu navegador não suporta a API de áudio nativa.',
        variant: 'error',
      });
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = cleanTextForNaturalSpeech(textToRead);
    const utterance = new SpeechSynthesisUtterance(`${title}. ${cleanText}`);

    const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceUri);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    } else {
      utterance.lang = 'pt-BR';
    }

    // Tom e ritmo calmo, natural e suave
    utterance.rate = rate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }

  function handlePause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }

  function handleStop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/30 p-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary shrink-0',
              isPlaying && 'ring-2 ring-primary/50'
            )}
          >
            <Volume2 className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-foreground">
                {isPlaying ? 'Narrando Aula em Áudio...' : 'Ouvir Aula em Áudio'}
              </p>
              <Badge variant="secondary" className="text-xs h-5 px-2 font-normal">
                Voz Calma
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Narração suave e natural para estudar sem cansaço visual
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Voz */}
          {voices.length > 0 && (
            <select
              value={selectedVoiceUri}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedVoiceUri(val);
                try {
                  localStorage.setItem('ctfl_preferred_voice_uri', val);
                } catch {}
                if (isPlaying) {
                  handleStop();
                  setTimeout(handlePlay, 100);
                }
              }}
              className="h-8 max-w-[210px] truncate rounded-lg border border-border/70 bg-background/70 px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              title="Escolha a voz para a narração"
            >
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {getVoiceLabel(v)}
                </option>
              ))}
            </select>
          )}

          {/* Dica de Vozes HD */}
          <button
            type="button"
            onClick={() => setShowVoiceTips(true)}
            className="flex items-center gap-1 text-xs text-primary hover:bg-primary/15 bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/25 transition-colors"
            title="Dicas de como usar vozes ultra-realistas gratuitamente"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="font-semibold hidden sm:inline">Vozes HD Grátis</span>
          </button>

          {/* Velocidade de Narração */}
          <div className="flex items-center rounded-lg border border-border/60 bg-background/60 p-0.5 text-xs">
            {[
              { val: 0.9, label: '0.9x Calma' },
              { val: 1.0, label: '1x' },
              { val: 1.25, label: '1.25x' },
            ].map((r) => (
              <button
                key={r.val}
                type="button"
                onClick={() => {
                  setRate(r.val);
                  if (isPlaying) {
                    handleStop();
                    setTimeout(handlePlay, 100);
                  }
                }}
                className={cn(
                  'rounded px-2 py-0.5 font-medium transition-colors',
                  rate === r.val
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Botões Play / Pause / Stop */}
          {isPlaying ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePause}
              className="h-8 border-primary/40 text-primary"
            >
              <Pause className="h-3.5 w-3.5 mr-1" />
              Pausar
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePlay}
              className="h-8 font-semibold"
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              {isPaused ? 'Continuar' : 'Ouvir Aula'}
            </Button>
          )}

          {(isPlaying || isPaused) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleStop}
              className="h-8 px-2 text-muted-foreground hover:text-rose-400"
              title="Parar áudio"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Modal Educativo: Dicas de Vozes Gratuitas de Alta Fidelidade */}
      {showVoiceTips && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Como Ouvir com Vozes Humanas (100% Grátis)</h3>
                  <p className="text-xs text-muted-foreground">Livre-se da voz robótica antiga do Windows</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowVoiceTips(false)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 space-y-1">
                <p className="font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Opção 1: Microsoft Edge (Mais Fácil)
                </p>
                <p>
                  Abra esta página no <strong>Microsoft Edge</strong>. Ele disponibiliza de graça as vozes neurais <strong>Francisca (Natural HD)</strong> e <strong>Thalita (Natural HD)</strong>, com entonação humana ultra-realista de estúdio sem precisar instalar nada!
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 space-y-1">
                <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Opção 2: Google Chrome
                </p>
                <p>
                  No Chrome com internet conectada, selecione no menu acima a opção <strong>&quot;Google Português (Online HD)&quot;</strong>, muito superior à voz Maria Desktop.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-primary" /> Opção 3: Vozes Naturais do Windows 11/10
                </p>
                <p>
                  No Windows, abra <em>Configurações &gt; Hora e Idioma &gt; Fala &gt; Adicionar vozes</em> e instale o pacote <strong>Português (Brasil) (Naturais)</strong> para ter vozes fluidas em todos os programas.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() => setShowVoiceTips(false)}
                className="h-7 px-3 text-xs font-semibold"
              >
                Entendi!
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// -------------------------------------------------------------
// 4. LABORATÓRIO PRÁTICO COM ABAS INTERATIVAS (WEB / API / SQL)
// -------------------------------------------------------------
export function InteractivePracticalLab({
  practicalExamplesText,
  fontSize = 'base',
}: {
  practicalExamplesText: string;
  fontSize?: FontSizeOption;
}) {
  const [activeTab, setActiveTab] = React.useState<'ALL' | 'WEB' | 'API' | 'SQL'>('ALL');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-secondary/35 p-2.5">
        <span className="text-xs font-semibold text-muted-foreground mr-1">
          Filtrar Exemplos:
        </span>
        <Button
          type="button"
          size="sm"
          variant={activeTab === 'ALL' ? 'default' : 'outline'}
          onClick={() => setActiveTab('ALL')}
          className="h-7 text-xs"
        >
          <Code2 className="h-3.5 w-3.5 mr-1" />
          Todos os Cenários
        </Button>
        <Button
          type="button"
          size="sm"
          variant={activeTab === 'WEB' ? 'default' : 'outline'}
          onClick={() => setActiveTab('WEB')}
          className="h-7 text-xs"
        >
          <Globe className="h-3.5 w-3.5 mr-1" />
          Web & Telas
        </Button>
        <Button
          type="button"
          size="sm"
          variant={activeTab === 'API' ? 'default' : 'outline'}
          onClick={() => setActiveTab('API')}
          className="h-7 text-xs"
        >
          <Server className="h-3.5 w-3.5 mr-1" />
          APIs & JSON
        </Button>
        <Button
          type="button"
          size="sm"
          variant={activeTab === 'SQL' ? 'default' : 'outline'}
          onClick={() => setActiveTab('SQL')}
          className="h-7 text-xs"
        >
          <Database className="h-3.5 w-3.5 mr-1" />
          Bancos de Dados
        </Button>
      </div>

      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5 sm:p-6">
        <FormattedText text={practicalExamplesText} fontSize={fontSize} />
      </div>
    </div>
  );
}
