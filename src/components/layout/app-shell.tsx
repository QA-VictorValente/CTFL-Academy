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
            'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
            isActive || isPending
              ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/20 text-indigo-400 border border-indigo-500/30 font-semibold'
              : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-400" />
          ) : (
            <Icon
              className={cn('h-4 w-4 shrink-0', isActive && 'text-indigo-400')}
            />
          )}
          <span>{item.label}</span>
        </Link>
      );
    });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-border/70 bg-card/60 lg:flex">
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border/70 px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-extrabold tracking-tight">
                CTFL Academy
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-indigo-400">
                Syllabus 4.0.1
              </span>
            </div>
          </Link>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-6">
          <div>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Área do Estudante
            </p>
            <nav aria-label="Menu do estudante" className="space-y-1">
              {renderNavLinks(STUDENT_NAV)}
            </nav>
          </div>

          {user.role === 'ADMIN' && (
            <div>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-violet-400">
                Administração & Curadoria
              </p>
              <nav aria-label="Menu administrativo" className="space-y-1">
                {renderNavLinks(ADMIN_NAV)}
              </nav>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border/70 p-4">
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
        {/* Top AppHeader */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-md sm:px-6">
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
              className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400"
            >
              <Flame className="h-3.5 w-3.5" />
              <span>{user.currentStreak}d</span>
            </div>

            <div
              title="XP Acumulado"
              className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400"
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

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-10 flex h-full max-h-screen w-72 max-w-[85vw] flex-col overflow-hidden bg-card p-4 shadow-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-border pb-3">
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
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Estudante
                  </p>
                  <nav className="space-y-1">
                    {renderNavLinks(STUDENT_NAV, () => setMobileOpen(false))}
                  </nav>
                </div>
                {user.role === 'ADMIN' && (
                  <div>
                    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-violet-400">
                      Administração
                    </p>
                    <nav className="space-y-1">
                      {renderNavLinks(ADMIN_NAV, () => setMobileOpen(false))}
                    </nav>
                  </div>
                )}
              </div>
              <div className="shrink-0 border-t border-border pt-3">
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 sm:pb-28 lg:pb-32">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>

        <FloatingNotebook />
      </div>
    </div>
  );
}
