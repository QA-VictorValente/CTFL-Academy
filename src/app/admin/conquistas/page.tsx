import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AchievementManager } from '@/components/admin/achievement-manager';

export const dynamic = 'force-dynamic';

export default async function AdminConquistasPage() {
  await requireAdmin();

  const achievements = await prisma.achievement.findMany({
    orderBy: { xpReward: 'asc' },
    include: {
      _count: {
        select: { userAchievements: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Gerenciamento de Conquistas e Regras de XP
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure medalhas, limites de desbloqueio e recompensas de pontos de experiência da plataforma.
        </p>
      </div>

      <AchievementManager achievements={achievements} />
    </div>
  );
}
