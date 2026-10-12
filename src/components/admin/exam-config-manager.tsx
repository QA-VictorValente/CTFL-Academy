'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/providers/toast-provider';

interface ExamConfigProps {
  config: {
    id: string;
    code: string;
    name: string;
    description: string;
    version: number;
    totalQuestions: number;
    durationMinutes: number;
    passingScore: number;
    pointsPerQuestion: number;
    allowNonNativeBonus: boolean;
    nonNativeBonusPercent: number;
    chapterDistribution: Record<string, number>;
  };
  chapters: Array<{ id: string; number: number; title: string }>;
}

export function ExamConfigManager({ config, chapters }: ExamConfigProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(config.name);
  const [totalQuestions, setTotalQuestions] = useState(config.totalQuestions);
  const [durationMinutes, setDurationMinutes] = useState(config.durationMinutes);
  const [passingScore, setPassingScore] = useState(config.passingScore);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(config.pointsPerQuestion);
  const [allowNonNativeBonus, setAllowNonNativeBonus] = useState(
    config.allowNonNativeBonus
  );
  const [nonNativeBonusPercent, setNonNativeBonusPercent] = useState(
    config.nonNativeBonusPercent
  );
  const [distribution, setDistribution] = useState<Record<string, number>>(
    config.chapterDistribution || {
      '1': 8,
      '2': 6,
      '3': 4,
      '4': 12,
      '5': 8,
      '6': 2,
    }
  );
  const [saving, setSaving] = useState(false);

  const sumDistribution = Object.values(distribution).reduce(
    (acc, val) => acc + Number(val || 0),
    0
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/exam-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: config.id,
          name,
          totalQuestions: Number(totalQuestions),
          durationMinutes: Number(durationMinutes),
          passingScore: Number(passingScore),
          pointsPerQuestion: Number(pointsPerQuestion),
          allowNonNativeBonus,
          nonNativeBonusPercent: Number(nonNativeBonusPercent),
          chapterDistribution: distribution,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao atualizar configuração',
          description: data.error || 'Verifique os valores informados.',
          variant: 'error',
        });
        return;
      }

      toast({
        title: 'Configuração de Prova Atualizada',
        description: `Nova versão v${data.configuration.version} salva com sucesso. Tentativas anteriores mantêm seu snapshot imutável.`,
        variant: 'success',
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4 text-primary" />
              Matriz Oficial de Exame — {config.code}
            </CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <Badge variant="info">Versão Ativa v{config.version}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Input
                label="Nome da Configuração Oficial"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Total de Questões (Padrão: 40)"
              type="number"
              min={5}
              max={100}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              required
            />

            <Input
              label="Duração Padrão em Minutos (Padrão: 60)"
              type="number"
              min={10}
              max={240}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Nota de Corte / Aprovação (Padrão: 26 pontos = 65%)"
              type="number"
              min={1}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              required
            />

            <Input
              label="Pontos por Questão (Padrão: 1)"
              type="number"
              min={1}
              max={10}
              value={pointsPerQuestion}
              onChange={(e) => setPointsPerQuestion(Number(e.target.value))}
              required
            />

            <Input
              label="Bônus Idioma Não-Nativo (% — Padrão: 25% = 75 min)"
              type="number"
              min={0}
              max={100}
              value={nonNativeBonusPercent}
              onChange={(e) => setNonNativeBonusPercent(Number(e.target.value))}
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={allowNonNativeBonus}
              onChange={(e) => setAllowNonNativeBonus(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Permitir que candidatos ativem o tempo estendido (+{nonNativeBonusPercent}%) para idioma não-nativo
          </label>

          {/* Distribuição por Capítulo */}
          <div className="space-y-3 rounded-xl border border-border bg-secondary/10 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Distribuição de Questões por Capítulo no Simulado Completo
              </h4>
              <Badge
                variant={sumDistribution === totalQuestions ? 'success' : 'warning'}
              >
                Soma atual: {sumDistribution} / {totalQuestions} questões
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {chapters.map((ch) => {
                const key = String(ch.number);
                return (
                  <Input
                    key={ch.id}
                    label={`Cap. ${ch.number} — ${ch.title}`}
                    type="number"
                    min={0}
                    max={40}
                    value={distribution[key] ?? 0}
                    onChange={(e) =>
                      setDistribution((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value),
                      }))
                    }
                  />
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" isLoading={saving} className="gap-1.5">
              <Save className="h-4 w-4" />
              Salvar Nova Versão da Configuração
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
