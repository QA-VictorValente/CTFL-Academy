'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers/toast-provider';

export function RetakeExamButton({
  mode,
  chapterId,
  questionCount,
}: {
  mode: 'FULL' | 'CHAPTER' | 'CUSTOM';
  chapterId?: string | null;
  questionCount: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  async function handleRetake() {
    setLoading(true);
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          chapterId: chapterId || undefined,
          questionCount: mode === 'FULL' ? undefined : questionCount,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao gerar novo simulado',
          description: json.error || 'Tente novamente.',
          variant: 'error',
        });
        return;
      }

      toast({
        title: 'Novo simulado gerado!',
        description:
          'Uma nova seleção de questões foi montada conforme as regras.',
        variant: 'success',
      });
      router.push(`/simulados/${json.attemptId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" onClick={handleRetake} isLoading={loading}>
      <RotateCcw className="h-4 w-4" />
      Refazer Simulado (Gerar Nova Seleção)
    </Button>
  );
}
