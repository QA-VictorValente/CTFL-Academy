import { Loader2, ShieldCheck } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/10">
        <ShieldCheck className="h-6 w-6 opacity-80" />
        <Loader2 className="absolute -bottom-1.5 -right-1.5 h-5 w-5 animate-spin text-violet-400" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground">
          Carregando CTFL Academy...
        </p>
        <p className="text-xs text-muted-foreground">
          Preparando ambiente ISTQB® CTFL v4.0.1
        </p>
      </div>
    </div>
  );
}
