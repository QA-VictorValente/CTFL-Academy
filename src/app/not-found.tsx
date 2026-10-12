import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/15 text-indigo-400">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-400">
        Erro 404 • Rota Não Encontrada
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Esta página falhou no critério de aceite
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        O recurso ou endereço que você tentou acessar não existe ou foi movido.
        Verifique a URL ou retorne para a plataforma de estudos.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Página Inicial
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button>
            <LayoutDashboard className="h-4 w-4" />
            Ir para o Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
