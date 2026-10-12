import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReviewQueueManager } from '@/components/admin/review-queue-manager';

export const dynamic = 'force-dynamic';

export default async function AdminRevisaoPage() {
  await requireAdmin();

  const queueQuestions = await prisma.question.findMany({
    where: {
      deletedAt: null,
      status: {
        in: ['IN_REVIEW', 'APPROVED', 'DRAFT', 'REJECTED'],
      },
    },
    include: {
      chapter: { select: { number: true, title: true } },
      topic: { select: { code: true, title: true } },
      options: { orderBy: { orderIndex: 'asc' } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
  });

  const serialized = queueQuestions.map((q) => ({
    ...q,
    updatedAt: q.updatedAt.toISOString(),
    reviews: q.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Fila de Revisão e Tela de Aprovação Editorial
        </h1>
        <p className="text-sm text-muted-foreground">
          Avalie questões em rascunho ou revisão técnica. Nenhuma questão pode entrar em simulados sem passar pela aprovação e publicação formal.
        </p>
      </div>

      <ReviewQueueManager questions={serialized} />
    </div>
  );
}
