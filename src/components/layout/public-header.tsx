'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-card/95 ring-1 ring-border/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-extrabold">CTFL Academy</span>
            <span className="mt-0.5 text-xs font-medium text-primary">
              Syllabus v4.0.1
            </span>
          </div>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-6 md:flex"
        >
          <Link
            href="/sobre"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            A Plataforma
          </Link>
          <Link
            href="/#syllabus"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Syllabus 4.0.1
          </Link>
          <Link
            href="/#simulados"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Metodologia Completa
          </Link>
          <Link
            href="/privacidade"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacidade
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/cadastro">
            <Button size="sm">
              Começar Agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="bg-card ring-1 ring-border px-4 py-4 md:hidden">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/sobre"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              A Plataforma
            </Link>
            <Link
              href="/#syllabus"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              Syllabus 4.0.1
            </Link>
            <Link
              href="/#simulados"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              Metodologia Completa
            </Link>
            <Link
              href="/privacidade"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              Termos de Uso
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">
                  Entrar
                </Button>
              </Link>
              <Link href="/cadastro" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Criar Conta Gratuita</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
