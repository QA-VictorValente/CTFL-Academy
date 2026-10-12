'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Edit, Plus, Trophy, X, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/providers/toast-provider';
import { XP_RULES } from '@/lib/gamification';

interface AchievementItem {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  ruleType: string;
  ruleThreshold: number;
  isActive: boolean;
  _count: {
    userAchievements: number;
  };
}

export function AchievementManager({
  achievements,
}: {
  achievements: AchievementItem[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [xpReward, setXpReward] = useState(100);
  const [ruleType, setRuleType] = useState('LESSONS_COMPLETED');
  const [ruleThreshold, setRuleThreshold] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditingId(null);
    setCode(`MEDAL_${Math.floor(100 + Math.random() * 900)}`);
    setTitle('');
    setDescription('');
    setXpReward(100);
    setRuleType('LESSONS_COMPLETED');
    setRuleThreshold(5);
    setIsActive(true);
    setModalOpen(true);
  }

  function openEdit(ach: AchievementItem) {
    setEditingId(ach.id);
    setCode(ach.code);
    setTitle(ach.title);
    setDescription(ach.description);
    setXpReward(ach.xpReward);
    setRuleType(ach.ruleType);
    setRuleThreshold(ach.ruleThreshold);
    setIsActive(ach.isActive);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/achievements', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId || undefined,
          code,
          title,
          description,
          icon: 'Award',
          xpReward: Number(xpReward),
          ruleType,
          ruleThreshold: Number(ruleThreshold),
          isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao salvar conquista',
          description: data.error || 'Verifique os campos preenchidos.',
          variant: 'error',
        });
        return;
      }

      toast({
        title: editingId ? 'Conquista atualizada' : 'Nova conquista cadastrada',
        description: `Medalha "${title}" salva com sucesso.`,
        variant: 'success',
      });
      setModalOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="info" className="gap-1">
            <Zap className="h-3 w-3" /> Aula Concluída: +{XP_RULES.LESSON_COMPLETED} XP
          </Badge>
          <Badge variant="info" className="gap-1">
            <Zap className="h-3 w-3" /> Exercício Correto: +{XP_RULES.EXERCISE_CORRECT} XP
          </Badge>
          <Badge variant="info" className="gap-1">
            <Zap className="h-3 w-3" /> Flashcard: +{XP_RULES.FLASHCARD_REVIEWED} XP
          </Badge>
          <Badge variant="info" className="gap-1">
            <Zap className="h-3 w-3" /> Simulado Aprovado: +{XP_RULES.EXAM_PASSED} XP
          </Badge>
        </div>

        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nova Conquista / Medalha
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((ach) => (
          <Card key={ach.id}>
            <CardContent className="flex h-full flex-col justify-between p-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div>
                      <Badge variant="outline">{ach.code}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(ach)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <h3 className="mt-3 font-bold text-sm">{ach.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ach.description}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs">
                <Badge variant="success">+{ach.xpReward} XP</Badge>
                <span className="text-muted-foreground">
                  {ach.ruleType} ≥ {ach.ruleThreshold}
                </span>
                <Badge variant={ach.isActive ? 'info' : 'warning'}>
                  {ach._count.userAchievements} desbloqueios
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4 text-primary" />
                  {editingId ? 'Editar Conquista' : 'Cadastrar Nova Conquista'}
                </CardTitle>
                <CardDescription>
                  Defina o gatilho automático e a recompensa de XP da medalha.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Código Único"
                    value={code}
                    disabled={Boolean(editingId)}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                  <Input
                    label="Recompensa de XP"
                    type="number"
                    min={10}
                    max={2000}
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    required
                  />
                </div>

                <Input
                  label="Título da Conquista"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <Textarea
                  label="Descrição para o Estudante"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Tipo de Regra Automática"
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value)}
                    options={[
                      { value: 'LESSONS_COMPLETED', label: 'Aulas Concluídas' },
                      { value: 'CORRECT_ANSWERS', label: 'Questões Acertadas' },
                      { value: 'FLASHCARDS_REVIEWED', label: 'Flashcards Revisados' },
                      { value: 'EXAMS_COMPLETED', label: 'Simulados Realizados' },
                      { value: 'EXAMS_PASSED', label: 'Simulados Aprovados (≥65%)' },
                      { value: 'STREAK_DAYS', label: 'Dias Seguidos (Streak)' },
                    ]}
                  />
                  <Input
                    label="Meta Numérica (Threshold)"
                    type="number"
                    min={1}
                    max={1000}
                    value={ruleThreshold}
                    onChange={(e) => setRuleThreshold(Number(e.target.value))}
                    required
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  Conquista ativa para desbloqueio automático
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
                    Salvar Conquista
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
