'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ShieldAlert, Trash2, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useToast } from '@/components/providers/toast-provider';
import { useTheme } from '@/components/providers/theme-provider';

interface ProfileSettingsProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    preferredTheme: string;
    dailyGoalMinutes: number;
    nonNativeLanguageBonus: boolean;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { setTheme } = useTheme();

  const [fullName, setFullName] = useState(user.fullName);
  const [preferredTheme, setPreferredTheme] = useState<'dark' | 'light'>(
    user.preferredTheme === 'light' ? 'light' : 'dark'
  );
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user.dailyGoalMinutes || 30);
  const [nonNativeLanguageBonus, setNonNativeLanguageBonus] = useState(
    Boolean(user.nonNativeLanguageBonus)
  );
  const [saving, setSaving] = useState(false);

  const [confirmationText, setConfirmationText] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          preferredTheme,
          dailyGoalMinutes: Number(dailyGoalMinutes),
          nonNativeLanguageBonus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao salvar preferências',
          description: data.error || 'Verifique os campos preenchidos.',
          variant: 'error',
        });
        return;
      }

      setTheme(preferredTheme);
      toast({
        title: 'Preferências atualizadas',
        description: 'Suas configurações de estudo foram salvas com sucesso.',
        variant: 'success',
      });
      router.refresh();
    } catch {
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível comunicar com o servidor.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Não foi possível excluir a conta',
          description: data.error || 'Digite exatamente EXCLUIR MINHA CONTA.',
          variant: 'error',
        });
        setDeleteModalOpen(false);
        return;
      }

      toast({
        title: 'Conta excluída e dados anonimizados',
        description: 'Seus registros pessoais foram removidos com segurança.',
        variant: 'info',
      });
      router.push('/');
      router.refresh();
    } catch {
      toast({
        title: 'Erro ao excluir conta',
        description: 'Ocorreu uma falha inesperada.',
        variant: 'error',
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="h-5 w-5 text-primary" />
                Dados Pessoais e Preferências de Estudo
              </CardTitle>
              <CardDescription>
                Personalize sua rotina diária e configurações padrão para simulados CTFL.
              </CardDescription>
            </div>
            <Badge variant={user.role === 'ADMIN' ? 'info' : 'default'}>
              Perfil: {user.role === 'ADMIN' ? 'Administrador' : 'Estudante'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="E-mail da conta (somente leitura)"
                value={user.email}
                disabled
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Tema visual padrão"
                value={preferredTheme}
                onChange={(e) =>
                  setPreferredTheme(e.target.value === 'light' ? 'light' : 'dark')
                }
                options={[
                  { value: 'dark', label: 'Modo Escuro (Padrão Técnico)' },
                  { value: 'light', label: 'Modo Claro (Alto Contraste Diurno)' },
                ]}
              />

              <Input
                label="Meta diária de estudo (minutos)"
                type="number"
                min={5}
                max={480}
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                required
              />
            </div>

            <div className="rounded-xl border border-border bg-secondary/20 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={nonNativeLanguageBonus}
                  onChange={(e) => setNonNativeLanguageBonus(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-semibold">
                    Habilitar tempo estendido por padrão (+25% / 75 min no Simulado Oficial)
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Regra oficial ISTQB para candidatos que realizam o exame em idioma diferente da sua língua materna (adiciona 15 minutos ao simulado completo de 60 minutos).
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={saving} className="gap-1.5">
                <Save className="h-4 w-4" />
                Salvar Preferências
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Zona de Exclusão Segura */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Zona de Perigo - Exclusão Segura de Conta (LGPD)
          </CardTitle>
          <CardDescription>
            Ao excluir sua conta, seu histórico de simulados, respostas, progresso por tópico, revisões de flashcards e XP serão permanentemente removidos e seu perfil será anonimizado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-md">
            <Input
              label='Para habilitar a exclusão, digite exatamente: EXCLUIR MINHA CONTA'
              placeholder="EXCLUIR MINHA CONTA"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
            />
          </div>

          <Button
            type="button"
            variant="destructive"
            disabled={confirmationText !== 'EXCLUIR MINHA CONTA'}
            onClick={() => setDeleteModalOpen(true)}
            className="gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            Excluir Minha Conta Permanentemente
          </Button>
        </CardContent>
      </Card>

      <ConfirmModal
        open={deleteModalOpen}
        title="Confirmar Exclusão Definitiva da Conta"
        description="Esta operação é irreversível. Todos os seus simulados, estatísticas de acerto, conquistas e credenciais de acesso serão permanentemente apagados."
        confirmLabel="Sim, excluir minha conta agora"
        variant="destructive"
        isLoading={deleting}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
