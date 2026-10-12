import Link from 'next/link';
import { FileSearch, Filter, ShieldCheck } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTimePtBr } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminAuditoriaPage({
  searchParams,
}: {
  searchParams?: { entityType?: string };
}) {
  await requireAdmin();

  const entityFilter = searchParams?.entityType || undefined;

  const [logs, entityTypes] = await Promise.all([
    prisma.auditLog.findMany({
      where: entityFilter ? { entityType: entityFilter } : undefined,
      include: {
        actor: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.auditLog.groupBy({
      by: ['entityType'],
      _count: { _all: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Auditoria Administrativa e Trilha de Segurança
        </h1>
        <p className="text-sm text-muted-foreground">
          Histórico imutável de ações administrativas, transições de status editorial, alterações de conteúdo e eventos de segurança.
        </p>
      </div>

      {/* Filtro por tipo de entidade */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Entidade:
            </span>
            <Link
              href="/admin/auditoria"
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                !entityFilter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Todas
            </Link>
            {entityTypes.map((et) => (
              <Link
                key={et.entityType}
                href={`/admin/auditoria?entityType=${encodeURIComponent(et.entityType)}`}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                  entityFilter === et.entityType
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {et.entityType} ({et._count._all})
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSearch className="h-4 w-4 text-primary" />
            Registros de Auditoria ({logs.length})
          </CardTitle>
          <CardDescription>
            Exibindo os últimos 100 eventos registrados no banco PostgreSQL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-xl border border-border">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col justify-between gap-2 p-3.5 text-xs sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info">{log.action}</Badge>
                    <Badge variant="outline">{log.entityType}</Badge>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      ID: {log.entityId}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Operador:{' '}
                    <strong className="text-foreground">
                      {log.actor?.fullName || 'Sistema / Conta Anonimizada'}
                    </strong>{' '}
                    {log.actor?.email ? `(${log.actor.email})` : ''}
                  </p>
                  {log.details && (
                    <pre className="mt-1 overflow-x-auto rounded bg-secondary/30 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                      {JSON.stringify(log.details)}
                    </pre>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground sm:text-right">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{formatDateTimePtBr(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
