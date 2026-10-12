import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

function parseArg(flag: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${flag}=`));
  if (arg) return arg.split('=').slice(1).join('=');
  return undefined;
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) =>
    rl.question(question, (ans) => resolve(ans.trim()))
  );
}

async function main() {
  let targetEmail = parseArg('email')?.trim().toLowerCase();
  const targetId = parseArg('id')?.trim();
  let mode = (parseArg('mode') || 'hard').trim().toLowerCase();
  const force = process.argv.includes('--yes') || process.argv.includes('-y');

  const rl =
    !targetEmail && !targetId
      ? readline.createInterface({ input: process.stdin, output: process.stdout })
      : null;

  if (!targetEmail && !targetId && rl) {
    console.log('\n=== EXCLUIR USUÁRIO (CTFL Academy) ===\n');
    targetEmail = (
      await ask(rl, 'Informe o E-mail do usuário que deseja excluir: ')
    ).toLowerCase();
    const modeAns = (
      await ask(
        rl,
        'Modo de exclusão [hard = apaga tudo p/ recadastrar | soft = anonimiza] (padrão: hard): '
      )
    ).toLowerCase();
    if (modeAns === 'soft' || modeAns === 'hard') {
      mode = modeAns;
    }
  }

  const user = await prisma.userProfile.findFirst({
    where: targetId ? { id: targetId } : { email: targetEmail },
  });

  if (!user) {
    if (rl) rl.close();
    console.error(
      `[User Delete] Erro: Usuário não encontrado (${targetId || targetEmail}). Use "npm run user:list" para ver os usuários.`
    );
    process.exit(1);
  }

  if (!force) {
    const confirmRl =
      rl ||
      readline.createInterface({ input: process.stdin, output: process.stdout });
    const confirm = await ask(
      confirmRl,
      `Confirma a exclusão (${mode.toUpperCase()}) de "${user.fullName}" <${user.email}>? Digite SIM para confirmar: `
    );
    confirmRl.close();
    if (confirm.toUpperCase() !== 'SIM') {
      console.log('[User Delete] Operação cancelada.');
      process.exit(0);
    }
  } else if (rl) {
    rl.close();
  }

  await prisma.$transaction(async (tx) => {
    await tx.userAnswer.deleteMany({ where: { userId: user.id } });
    await tx.examAttempt.deleteMany({ where: { userId: user.id } });
    await tx.flashcardReview.deleteMany({ where: { userId: user.id } });
    await tx.topicProgress.deleteMany({ where: { userId: user.id } });
    await tx.userAchievement.deleteMany({ where: { userId: user.id } });
    await tx.xPEvent.deleteMany({ where: { userId: user.id } });
    await tx.studyActivity.deleteMany({ where: { userId: user.id } });

    if (mode === 'soft') {
      await tx.userProfile.update({
        where: { id: user.id },
        data: {
          email: `deleted-${user.id}@anonymized.local`,
          fullName: 'Conta Excluída',
          passwordHash: null,
          supabaseUserId: null,
          deletedAt: new Date(),
        },
      });
    } else {
      await tx.question.updateMany({
        where: { authorId: user.id },
        data: { authorId: null },
      });
      await tx.question.updateMany({
        where: { reviewerId: user.id },
        data: { reviewerId: null },
      });
      await tx.questionRevision.updateMany({
        where: { editorId: user.id },
        data: { editorId: null },
      });
      await tx.questionReview.deleteMany({
        where: { reviewerId: user.id },
      });
      await tx.auditLog.updateMany({
        where: { actorId: user.id },
        data: { actorId: null },
      });
      await tx.userProfile.delete({
        where: { id: user.id },
      });
    }
  });

  console.log(
    `\n✅ Usuário "${user.fullName}" <${user.email}> ${
      mode === 'soft' ? 'anonimizado (soft delete)' : 'excluído permanentemente (hard delete)'
    } com sucesso!`
  );
}

main()
  .catch((err) => {
    console.error('[User Delete] Erro ao excluir usuário:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
