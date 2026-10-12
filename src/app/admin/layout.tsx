import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  if (user.role !== 'ADMIN') {
    return (
      <AppShell
        user={{
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          totalXp: user.totalXp,
          currentStreak: user.currentStreak,
        }}
      >
        <div className="mx-auto max-w-xl py-16">
          <Card className="border-destructive/40">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">
                Acesso Restrito — Permissão Insuficiente (403)
              </CardTitle>
              <CardDescription>
                Esta área é exclusiva para administradores da plataforma CTFL Academy. Sua conta possui o perfil <strong>Estudante</strong> e a verificação de autorização foi bloqueada no servidor.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/dashboard">
                <Button className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Dashboard do Estudante
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={{
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        totalXp: user.totalXp,
        currentStreak: user.currentStreak,
      }}
    >
      {children}
    </AppShell>
  );
}
