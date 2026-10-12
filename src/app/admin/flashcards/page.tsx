import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FlashcardManager } from '@/components/admin/flashcard-manager';

export const dynamic = 'force-dynamic';

export default async function AdminFlashcardsPage() {
  await requireAdmin();

  const [flashcards, chapters] = await Promise.all([
    prisma.flashcard.findMany({
      where: { deletedAt: null },
      include: {
        chapter: { select: { number: true, title: true } },
        topic: { select: { code: true, title: true } },
      },
      orderBy: [{ chapter: { number: 'asc' } }, { createdAt: 'desc' }],
    }),
    prisma.chapter.findMany({
      where: { deletedAt: null },
      orderBy: { number: 'asc' },
      select: {
        id: true,
        number: true,
        title: true,
        topics: {
          where: { deletedAt: null },
          orderBy: { orderIndex: 'asc' },
          select: { id: true, code: true, title: true },
        },
      },
    }),
  ]);

  const serialized = flashcards.map((fc) => ({
    ...fc,
    tags: Array.isArray(fc.tags) ? (fc.tags as string[]) : [],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Gerenciamento de Flashcards Autorais
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastre, edite e organize cartões de repetição espaçada vinculados aos capítulos e tópicos oficiais.
        </p>
      </div>

      <FlashcardManager flashcards={serialized} chapters={chapters} />
    </div>
  );
}
