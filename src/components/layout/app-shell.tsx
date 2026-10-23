'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Layers,
  Clock,
  History,
  AlertOctagon,
  BarChart2,
  Award,
  UserCog,
  Settings,
  FileSpreadsheet,
  ClipboardCheck,
  FileSearch,
  LogOut,
  Menu,
  X,
  Flame,
  Zap,
  Shield,
  Loader2,
  Brain,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { FloatingNotebook } from '@/components/student/floating-notebook';

export interface ShellUser {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'ADMIN';
  totalXp: number;
  currentStreak: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STUDENT_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/capitulos', label: 'Capítulos & Aulas', icon: BookOpen },
  { href: '/exercicios', label: 'Exercícios de Fixação', icon: CheckSquare },
  { href: '/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/caderno', label: 'Caderno & Mapas', icon: Brain },
  { href: '/simulados', label: 'Central de Simulados', icon: Clock },
  { href: '/historico', label: 'Histórico de Provas', icon: History },
  { href: '/revisao-erros', label: 'Revisão de Erros', icon: AlertOctagon },
  { href: '/progresso', label: 'Progresso por Capítulo', icon: BarChart2 },
  { href: '/conquistas', label: 'Conquistas & XP', icon: Award },
  { href: '/perfil', label: 'Perfil e Preferências', icon: UserCog },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard Admin', icon: Shield },
  { href: '/admin/capitulos', label: 'Capítulos & Tópicos', icon: BookOpen },
  { href: '/admin/questoes', label: 'Banco de Questões', icon: FileSpreadsheet },
  { href: '/admin/revisao', label: 'Fila de Revisão', icon: ClipboardCheck },
  { href: '/admin/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/admin/provas', label: 'Provas e Configurações', icon: Settings },
  { href: '/admin/conquistas', label: 'Conquistas e Regras XP', icon: Award },
  { href: '/admin/estatisticas', label: 'Estatísticas', icon: BarChart2 },
  { href: '/admin/auditoria', label: 'Auditoria Administrativa', icon: FileSearch },
];

export function AppShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const [focusMode, setFocusMode] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
        return;
      }

      if (
        (e.key === 'f' || e.key === 'F') &&
        !isEditing &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        setFocusMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode]);
  React.useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const isAdminSection = pathname?.startsWith('/admin');

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const renderNavLinks = (items: NavItem[], onNavigate?: () => void) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive =
        item.href === '/dashboard' || item.href === '/admin'
          ? pathname === item.href
          : pathname === item.href || pathname?.startsWith(`${item.href}/`);
      const isPending = pendingHref === item.href && pathname !== item.href;

      return (
        <Link
          key={item.href}
          href={item.href}
          prefetch={true}
          onClick={() => {
            if (pathname !== item.href) {
              setPendingHref(item.href);
            }
            onNavigate?.();
          }}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
            isActive || isPending
              ? 'bg-primary/12 text-primary ring-1 ring-inset ring-primary/25 font-semibold'
              : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          ) : (
            <Icon
              className={cn('h-4 w-4 shrink-0', isActive && 'text-primary')}
            />
          )}
          <span>{item.label}</span>
        </Link>
      );
    });

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-hidden bg-card ring-1 ring-border/80 lg:flex',
          focusMode && '!hidden'
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 bg-secondary/40 px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-extrabold tracking-tight">
                CTFL Academy
              </span>
              <span className="mt-0.5 text-xs font-medium text-primary">
                Syllabus 4.0.1
              </span>
            </div>
          </Link>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-6">
          <div>
            <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
              Área do Estudante
            </p>
            <nav aria-label="Menu do estudante" className="space-y-1">
              {renderNavLinks(STUDENT_NAV)}
            </nav>
          </div>

          {user.role === 'ADMIN' && (
            <div>
              <p className="mb-2 px-3 text-xs font-semibold text-primary">
                Administração & Curadoria
              </p>
              <nav aria-label="Menu administrativo" className="space-y-1">
                {renderNavLinks(ADMIN_NAV)}
              </nav>
            </div>
          )}
        </div>

        <div className="shrink-0 bg-secondary/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Badge variant={user.role === 'ADMIN' ? 'purple' : 'default'}>
              {user.role === 'ADMIN' ? 'Admin' : 'Estudante'}
            </Badge>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            isLoading={loggingOut}
            className="mt-3 w-full justify-center"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Floating exit control when Focus Mode is active */}
        {focusMode && (
          <div className="fixed top-3 right-4 z-50">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFocusMode(false)}
              className="border border-border bg-card gap-2 text-xs font-semibold ring-1 ring-border/80 hover:bg-secondary"
              aria-label="Sair do Modo Foco (ESC ou F)"
              title="Sair do Modo Foco (ESC ou F)"
            >
              <Minimize2 className="h-3.5 w-3.5 text-primary" />
              <span>Sair do Foco (ESC)</span>
            </Button>
          </div>
        )}

        {/* Top AppHeader */}
        {!focusMode && (
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-card/95 ring-1 ring-border/80 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir navegação"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <span className="text-xs font-medium text-muted-foreground">
                {isAdminSection
                  ? 'Console Administrativo • Governança Editorial'
                  : 'Ambiente de Preparação ISTQB® CTFL v4.0.1'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              title="Sequência de dias estudados"
              className="flex items-center gap-1.5 rounded-full bg-amber-500/12 ring-1 ring-inset ring-amber-600/30 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 tabular-nums"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>{user.currentStreak}d</span>
            </div>

            <div
              title="XP Acumulado"
              className="flex items-center gap-1.5 rounded-full bg-primary/12 ring-1 ring-inset ring-primary/30 px-3 py-1 text-xs font-semibold text-primary tabular-nums"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{user.totalXp} XP</span>
            </div>

            {user.role === 'ADMIN' && (
              <Link
                href={isAdminSection ? '/dashboard' : '/admin'}
                className="hidden sm:inline-block"
              >
                <Button variant="secondary" size="sm">
                  {isAdminSection ? 'Visão Estudante' : 'Painel Admin'}
                </Button>
              </Link>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFocusMode(true)}
              title="Ativar Modo Foco (Atalho: F)"
              aria-label="Ativar Modo Foco para leitura imersiva"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="font-medium">Modo Foco</span>
              <kbd className="ml-0.5 rounded border border-border/80 bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                F
              </kbd>
            </Button>

            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Sair da conta"
              onClick={handleLogout}
              disabled={loggingOut}
              className="lg:hidden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          </header>
        )}

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-10 flex h-full max-h-dvh w-72 max-w-[85vw] flex-col overflow-hidden bg-card p-4 ring-1 ring-border">
              <div className="flex shrink-0 items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                <span className="font-bold">CTFL Academy</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Fechar menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 space-y-6">
                <div>
                  <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
                    Estudante
                  </p>
                  <nav className="space-y-1">
                    {renderNavLinks(STUDENT_NAV, () => setMobileOpen(false))}
                  </nav>
                </div>
                {user.role === 'ADMIN' && (
                  <div>
                    <p className="mb-2 px-3 text-xs font-semibold text-primary">
                      Administração
                    </p>
                    <nav className="space-y-1">
                      {renderNavLinks(ADMIN_NAV, () => setMobileOpen(false))}
                    </nav>
                  </div>
                )}
              </div>
              <div className="shrink-0 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  isLoading={loggingOut}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}

        <main
          className={cn(
            'flex-1 p-4 sm:p-6 lg:p-8 pb-24 sm:pb-28 lg:pb-32',
            focusMode && 'pt-6 max-w-5xl mx-auto w-full'
          )}
        >
          <div className={cn('mx-auto', focusMode ? 'max-w-4xl' : 'max-w-7xl')}>
            {children}
          </div>
        </main>

        <FloatingNotebook />
      </div>
    </div>
  );
}
