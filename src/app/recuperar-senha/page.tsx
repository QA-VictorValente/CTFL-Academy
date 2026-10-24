'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Mail, ArrowLeft, MailCheck, RotateCcw } from 'lucide-react';
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

const requestResetSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Insira seu e-mail cadastrado.')
    .email('Formato de e-mail inválido. Exemplo: voce@email.com'),
});

type RequestResetFormValues = z.infer<typeof requestResetSchema>;

export default function RecuperarSenhaPage() {
  const { toast } = useToast();
  const [completed, setCompleted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState('');
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: RequestResetFormValues) {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error || 'Ocorreu um erro ao processar sua solicitação.';
        setServerError(msg);
        if (json.field === 'email') {
          setError('email', { type: 'server', message: msg });
        }
        toast({
          title: 'Erro na recuperação',
          description: msg,
          variant: 'error',
        });
        return;
      }

      setSubmittedEmail(data.email);
      setCompleted(true);
      toast({
        title: 'Solicitação enviada',
        description: 'Verifique sua caixa de entrada para continuar.',
        variant: 'success',
      });
    } catch {
      const msg = 'Não foi possível contatar o servidor. Verifique sua conexão.';
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {completed ? (
                <MailCheck className="h-6 w-6 text-primary" />
              ) : (
                <KeyRound className="h-6 w-6" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {completed ? 'Verifique seu e-mail' : 'Recuperação de Acesso'}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {completed
                ? 'Enviamos as instruções para prosseguir com a redefinição de senha.'
                : 'Informe seu e-mail para receber um link seguro de redefinição.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {completed ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-border/70 bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground">
                  <p>
                    Se o endereço <strong className="text-foreground">{submittedEmail}</strong> estiver registrado em nossa plataforma, você receberá uma mensagem contendo o link de acesso.
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    O link é válido por <strong>15 minutos</strong> e pode ser utilizado uma única vez. Caso não localize na caixa principal, consulte a pasta de spam.
                  </p>
                </div>

                <div className="space-y-2">
                  <Link href="/login" className="block">
                    <Button className="w-full">Voltar para o Login</Button>
                  </Link>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setCompleted(false)}
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Tentar outro e-mail
                  </Button>
                </div>
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
                    E-mail cadastrado
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
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

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  Enviar Link de Acesso
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
                  Voltar para o login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
