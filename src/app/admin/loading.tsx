import { Loader2, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div data-ui className="flex items-center justify-between rounded-2xl border border-primary/25 bg-card px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Carregando módulo administrativo...
            </p>
            <p className="text-xs text-muted-foreground">
              Consultando base editorial e registros de auditoria
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-1.5 text-xs font-medium text-primary sm:flex">
          <Shield className="h-4 w-4" />
          <span>Console Admin</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton data-ui className="h-24 rounded-2xl border border-border/50 bg-card/60" />
        <Skeleton data-ui className="h-24 rounded-2xl border border-border/50 bg-card/60" />
        <Skeleton data-ui className="h-24 rounded-2xl border border-border/50 bg-card/60" />
        <Skeleton data-ui className="h-24 rounded-2xl border border-border/50 bg-card/60" />
      </div>

      <Skeleton data-ui className="h-80 rounded-2xl border border-border/50 bg-card/60" />
    </div>
  );
}
