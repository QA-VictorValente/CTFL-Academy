import { PrismaClient, UserRole } from '@prisma/client';
import * as readline from 'readline';
import { hashPassword } from '../src/lib/auth';
import { ensureLocalPgRunning } from './local-pg-helper';

const prisma = new PrismaClient();
let stopLocalPg: (() => Promise<void>) | null = null;

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
  stopLocalPg = await ensureLocalPgRunning();
  let targetEmail = parseArg('email')?.trim().toLowerCase();
  const targetId = parseArg('id')?.trim();
  let newName = parseArg('name')?.trim();
  let newEmail = parseArg('new-email')?.trim().toLowerCase();
  let newPassword = parseArg('password');
  let newRole = parseArg('role')?.trim().toUpperCase();
  let newXp = parseArg('xp');
  let newStreak = parseArg('streak');

  const hasDirectFlags = Boolean(
    newName || newEmail || newPassword || newRole || newXp || newStreak
  );

  const rl = !targetEmail && !targetId || !hasDirectFlags
    ? readline.createInterface({ input: process.stdin, output: process.stdout })
    : null;

  if (!targetEmail && !targetId && rl) {
    console.log('\n=== EDITAR USUÁRIO (CTFL Academy) ===\n');
    targetEmail = (
      await ask(rl, 'Informe o E-mail atual do usuário que deseja editar: ')
    ).toLowerCase();
  }

  const user = await prisma.userProfile.findFirst({
    where: targetId ? { id: targetId } : { email: targetEmail },
  });

  if (!user) {
    if (rl) rl.close();
    console.error(
      `[User Edit] Erro: Usuário não encontrado (${targetId || targetEmail}). Use "npm run user:list" para ver os usuários.`
    );
    process.exit(1);
  }

  if (!hasDirectFlags && rl) {
    console.log(
      `\nEditando: ${user.fullName} <${user.email}> [Perfil: ${user.role} | XP: ${user.totalXp}]`
    );
    console.log('(Deixe em branco e pressione ENTER para manter o valor atual)\n');

    newName = await ask(rl, `Novo nome [${user.fullName}]: `);
    newEmail = (await ask(rl, `Novo e-mail [${user.email}]: `)).toLowerCase();
    newPassword = await ask(rl, 'Nova senha (mín. 8 caracteres ou vazio p/ manter): ');
    newRole = (
      await ask(rl, `Novo perfil STUDENT/ADMIN [${user.role}]: `)
    ).toUpperCase();
    newXp = await ask(rl, `Novo XP [${user.totalXp}]: `);
    newStreak = await ask(rl, `Nova sequência de dias [${user.currentStreak}]: `);
    rl.close();
  } else if (rl) {
    rl.close();
  }

  if (newPassword && newPassword.length < 8) {
    console.error('[User Edit] Erro: A nova senha deve ter pelo menos 8 caracteres.');
    process.exit(1);
  }

  const roleToApply: UserRole =
    newRole === 'ADMIN'
      ? 'ADMIN'
      : newRole === 'STUDENT'
      ? 'STUDENT'
      : user.role;

  const roleEntity = await prisma.role.findUnique({
    where: { code: roleToApply },
  });

  const updated = await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      fullName: newName || user.fullName,
      email: newEmail || user.email,
      passwordHash: newPassword ? hashPassword(newPassword) : user.passwordHash,
      role: roleToApply,
      roleId: roleEntity ? roleEntity.id : user.roleId,
      totalXp:
        newXp !== undefined && newXp !== ''
          ? Math.max(0, Number(newXp) || 0)
          : user.totalXp,
      currentStreak:
        newStreak !== undefined && newStreak !== ''
          ? Math.max(0, Number(newStreak) || 0)
          : user.currentStreak,
      deletedAt: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: updated.id,
      action: 'USER_UPDATED_CLI',
      entityType: 'UserProfile',
      entityId: updated.id,
      details: {
        email: updated.email,
        role: updated.role,
        passwordChanged: Boolean(newPassword),
      },
    },
  });

  console.log('\n✅ Usuário atualizado com sucesso!');
  console.table([
    {
      ID: updated.id,
      Nome: updated.fullName,
      Email: updated.email,
      Perfil: updated.role,
      XP: updated.totalXp,
      Streak: `${updated.currentStreak}d`,
    },
  ]);
}

main()
  .catch((err) => {
    console.error('[User Edit] Erro ao editar usuário:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (stopLocalPg) await stopLocalPg();
  });
