import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ExamConfigManager } from '@/components/admin/exam-config-manager';

export const dynamic = 'force-dynamic';

export default async function AdminProvasPage() {
  await requireAdmin();

  const [config, chapters] = await Promise.all([
    prisma.examConfiguration.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.chapter.findMany({
      where: { deletedAt: null },
      orderBy: { number: 'asc' },
      select: { id: true, number: true, title: true },
    }),
  ]);

  if (!config) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Nenhuma configuração de simulado ativa encontrada. Execute o seed inicial.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Gerenciamento de Provas e Configurações Oficiais
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure os parâmetros do simulado padrão CTFL 4.0 (tempo limite, pontuação mínima de 65% e matriz de distribuição por capítulo). Alterações criam uma nova versão e preservam o histórico de provas anteriores.
        </p>
      </div>

      <ExamConfigManager
        config={{
          ...config,
          chapterDistribution: (config.chapterDistribution || {}) as Record<
            string,
            number
          >,
        }}
        chapters={chapters}
      />
    </div>
  );
}
