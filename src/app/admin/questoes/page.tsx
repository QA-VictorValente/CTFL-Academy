import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { QuestionBankManager } from '@/components/admin/question-bank-manager';

export const dynamic = 'force-dynamic';

export default async function AdminQuestoesPage() {
  await requireAdmin();

  const [questions, chapters, sources] = await Promise.all([
    prisma.question.findMany({
      where: { deletedAt: null },
      include: {
        chapter: { select: { id: true, number: true, title: true } },
        topic: { select: { id: true, code: true, title: true } },
        source: { select: { id: true, name: true, sourceType: true } },
        options: { orderBy: { orderIndex: 'asc' } },
      },
      orderBy: [{ updatedAt: 'desc' }, { code: 'asc' }],
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
    prisma.questionSource.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, sourceType: true },
    }),
  ]);

  const serializedQuestions = questions.map((q) => ({
    ...q,
    updatedAt: q.updatedAt.toISOString(),
    options: q.options.map((o) => ({
      id: o.id,
      label: o.label as 'A' | 'B' | 'C' | 'D',
      content: o.content,
      isCorrect: o.isCorrect,
      justification: o.justification,
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Banco de Questões — Cadastro, Edição e Versionamento
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie o acervo de questões CTFL 4.0.1, edite alternativas e justificativas, duplique itens para versão autoral e consulte o histórico de revisões.
        </p>
      </div>

      <QuestionBankManager
        initialQuestions={serializedQuestions}
        chapters={chapters}
        sources={sources}
      />
    </div>
  );
}
