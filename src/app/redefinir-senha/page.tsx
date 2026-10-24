'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
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

const resetPasswordFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'Insira a nova senha.')
      .min(8, 'A senha deve possuir no mínimo 8 caracteres.')
      .max(72, 'A senha deve possuir no máximo 72 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas informadas não coincidem.',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();

  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [completed, setCompleted] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: ResetPasswordFormValues) {
    if (!token) {
      setServerError('Token de redefinição não encontrado na URL.');
      return;
    }

    setServerError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const errorMsg = json.error || 'Não foi possível redefinir sua senha.';
        setServerError(errorMsg);
        if (json.field === 'newPassword') {
          setError('newPassword', { type: 'server', message: errorMsg });
        }
        toast({
          title: 'Falha na redefinição',
          description: errorMsg,
          variant: 'error',
        });
        return;
      }

      setCompleted(true);
      toast({
        title: 'Senha redefinida com sucesso!',
        description: 'Redirecionando para a tela de autenticação...',
        variant: 'success',
      });

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch {
      const msg = 'Erro de conexão com o servidor. Tente novamente.';
      setServerError(msg);
      toast({
        title: 'Erro de comunicação',
        description: msg,
        variant: 'error',
      });
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            Link Inválido ou Ausente
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            O token de recuperação de senha não foi identificado nesta requisição.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Por motivos de segurança, solicite um novo link de acesso para prosseguir com a redefinição de suas credenciais.
          </p>
          <Link href="/recuperar-senha" className="block">
            <Button className="w-full">Solicitar Novo Link</Button>
          </Link>
          <div className="rounded-lg bg-secondary/40 p-3 text-center">
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
    );
  }

  return (
    <Card className="w-full max-w-md border-border bg-card">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {completed ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : (
            <KeyRound className="h-6 w-6" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {completed ? 'Senha Atualizada!' : 'Criar Nova Senha'}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {completed
            ? 'Suas novas credenciais já foram validadas e persistidas.'
            : 'Defina uma senha segura com no mínimo 8 caracteres.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {completed ? (
          <div className="space-y-4 text-center">
            <div className="rounded-lg border border-border/70 bg-secondary/30 p-4 text-sm text-muted-foreground">
              Você já pode acessar todas as funcionalidades da sua conta CTFL Academy utilizando a nova senha cadastrada.
            </div>
            <Link href="/login" className="block">
              <Button className="w-full">Acessar Login Agora</Button>
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
                htmlFor="newPassword"
                className="text-sm font-medium text-foreground"
              >
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Mínimo de 8 caracteres"
                  className="pl-9 pr-10"
                  autoComplete="new-password"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showNewPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  className="pl-9 pr-10"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={
                    showConfirmPassword ? 'Ocultar confirmação' : 'Exibir confirmação'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
            >
              Salvar Nova Senha
            </Button>
          </form>
        )}

        {!completed && (
          <div className="rounded-lg bg-secondary/40 p-3 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Cancelar e voltar ao login
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <React.Suspense
          fallback={
            <Card className="w-full max-w-md border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Carregando formulário...
            </Card>
          }
        >
          <ResetPasswordContent />
        </React.Suspense>
      </main>
    </div>
  );
}
