import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContentManager } from '@/components/admin/content-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCapitulosPage() {
  await requireAdmin();

  const chapters = await prisma.chapter.findMany({
    orderBy: { number: 'asc' },
    include: {
      topics: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Gerenciamento de Capítulos, Tópicos e Editor de Aulas
        </h1>
        <p className="text-sm text-muted-foreground">
          Edite textos didáticos, exemplos práticos de engenharia de qualidade e objetivos de aprendizagem do Syllabus CTFL 4.0.1.
        </p>
      </div>

      <ContentManager chapters={chapters} />
    </div>
  );
}
