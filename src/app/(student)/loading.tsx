import { Loader2, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Banner sutil de carregamento alinhado ao tema */}
      <div className="flex items-center justify-between rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-card/80 to-violet-950/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Carregando conteúdo...
            </p>
            <p className="text-xs text-muted-foreground">
              Sincronizando dados do Syllabus CTFL 4.0.1
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-1.5 text-xs font-medium text-indigo-400 sm:flex">
          <ShieldCheck className="h-4 w-4" />
          <span>CTFL Academy</span>
        </div>
      </div>

      {/* Skeletons de cards no padrão visual da plataforma */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24 rounded-2xl border border-border/50 bg-card/60" />
        <Skeleton className="h-24 rounded-2xl border border-border/50 bg-card/60" />
        <Skeleton className="h-24 rounded-2xl border border-border/50 bg-card/60" />
        <Skeleton className="h-24 rounded-2xl border border-border/50 bg-card/60" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl border border-border/50 bg-card/60 lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl border border-border/50 bg-card/60" />
      </div>
    </div>
  );
}
