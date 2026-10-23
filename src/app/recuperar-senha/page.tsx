'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Mail, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { recoverPasswordSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/providers/toast-provider';
import { PublicHeader } from '@/components/layout/public-header';

type RecoverFormValues = z.infer<typeof recoverPasswordSchema>;

export default function RecuperarSenhaPage() {
  const { toast } = useToast();
  const [completed, setCompleted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverPasswordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      newPassword: '',
    },
  });

  async function onSubmit(data: RecoverFormValues) {
    setServerError(null);
    if (!data.newPassword || data.newPassword.trim().length === 0) {
      const msg = 'Insira sua nova senha.';
      setError('newPassword', { type: 'manual', message: msg });
      setServerError(msg);
      return;
    }

    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error || 'Tente novamente.';
        setServerError(msg);
        if (json.field === 'email' || json.field === 'newPassword') {
          setError(json.field, { type: 'server', message: msg });
        }
        toast({
          title: 'Erro ao recuperar acesso',
          description: msg,
          variant: 'error',
        });
        return;
      }

      setCompleted(true);
      toast({
        title: 'Senha redefinida!',
        description: json.message,
        variant: 'success',
      });
    } catch {
      const msg = 'Não foi possível contatar o servidor.';
      setServerError(msg);
      toast({
        title: 'Erro de conexão',
        description: msg,
        variant: 'error',
      });
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Recuperação de Acesso
            </CardTitle>
            <CardDescription>
              Informe seu e-mail cadastrado e defina uma nova senha de acesso
            </CardDescription>
          </CardHeader>

          <CardContent>
            {completed ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Sua senha foi redefinida com sucesso! Você já pode entrar na
                  plataforma com a nova senha.
                </p>
                <Link href="/login" className="block">
                  <Button className="w-full">Ir para o Login</Button>
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                {serverError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs font-medium text-destructive"
                  >
                    {serverError}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    E-mail da Conta
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="voce@exemplo.com"
                      className="pl-9"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-foreground"
                  >
                    Nova Senha (mínimo 8 caracteres)
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      {...register('newPassword')}
                    />
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-destructive">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  Redefinir Senha
                </Button>
              </form>
            )}

            <div className="mt-6 rounded-lg bg-secondary/50 p-3 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
