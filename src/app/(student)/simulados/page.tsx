import Link from 'next/link';
import { History } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExamLauncher } from '@/components/student/exam-launcher';

export default async function SimuladosCentralPage({
  searchParams,
}: {
  searchParams: { chapterId?: string };
}) {
  const user = await requireAuth();

  const [chapters, inProgressAttempt] = await Promise.all([
    prisma.chapter.findMany({
      where: { isPublished: true, deletedAt: null },
      include: {
        topics: {
          where: { deletedAt: null },
          select: { id: true, code: true, title: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { number: 'asc' },
    }),
    prisma.examAttempt.findFirst({
      where: {
        userId: user.id,
        status: 'IN_PROGRESS',
        expiresAt: { gt: new Date() },
      },
      orderBy: { startedAt: 'desc' },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="default">Motor Determinístico de Simulados</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Central de Simulados CTFL 4.0.1
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Escolha entre o Simulado Completo Oficial (40 questões / 60 min),
            Simulado por Capítulo ou Simulado Personalizado. Todas as respostas
            são persistidas em tempo real no servidor.
          </p>
        </div>

        <Link href="/historico">
          <Button variant="outline">
            <History className="h-4 w-4" />
            Consultar Histórico de Provas
          </Button>
        </Link>
      </div>

      <ExamLauncher
        chapters={chapters.map((ch) => ({
          id: ch.id,
          number: ch.number,
          title: ch.title,
          examWeightQuestions: ch.examWeightQuestions,
          topics: ch.topics,
        }))}
        inProgressAttempt={
          inProgressAttempt
            ? {
                id: inProgressAttempt.id,
                title: inProgressAttempt.title,
                totalQuestions: inProgressAttempt.totalQuestions,
                startedAt: inProgressAttempt.startedAt.toISOString(),
              }
            : null
        }
        nonNativeEligible={user.nonNativeLanguageBonus}
        initialChapterId={searchParams.chapterId}
      />
    </div>
  );
}
