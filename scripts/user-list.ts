import { PrismaClient } from '@prisma/client';
import { ensureLocalPgRunning } from './local-pg-helper';

const prisma = new PrismaClient();
let stopLocalPg: (() => Promise<void>) | null = null;

async function main() {
  stopLocalPg = await ensureLocalPgRunning();

  const users = await prisma.userProfile.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      totalXp: true,
      currentStreak: true,
      deletedAt: true,
      createdAt: true,
    },
  });

  if (users.length === 0) {
    console.log('\n[User CLI] Nenhum usuário encontrado no banco de dados.\n');
    return;
  }

  console.log(`\n=== USUÁRIOS CADASTRADOS (${users.length}) ===`);
  console.table(
    users.map((u) => ({
      ID: u.id,
      Email: u.email,
      Nome: u.fullName,
      Perfil: u.role,
      XP: u.totalXp,
      Streak: `${u.currentStreak}d`,
      Status: u.deletedAt ? 'EXCLUÍDO' : 'ATIVO',
      CriadoEm: u.createdAt.toISOString().slice(0, 10),
    }))
  );
}

main()
  .catch((err) => {
    console.error('[User CLI] Erro ao listar usuários:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (stopLocalPg) await stopLocalPg();
  });
