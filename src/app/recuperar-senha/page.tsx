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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: {
      email: '',
      newPassword: '',
    },
  });

  async function onSubmit(data: RecoverFormValues) {
    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: 'Erro ao recuperar acesso',
          description: json.error || 'Tente novamente.',
          variant: 'error',
        });
        return;
      }

      setCompleted(true);
      toast({
        title: 'Recuperação processada',
        description: json.message,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível contatar o servidor.',
        variant: 'error',
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md border-indigo-500/20 shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400">
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
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Seu procedimento de recuperação foi concluído. Você já pode
                  autenticar-se na plataforma.
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
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
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
                    <p className="text-xs text-rose-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="newPassword"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
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
                    <p className="text-xs text-rose-400">
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

            <div className="mt-6 border-t border-border/60 pt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:underline"
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
