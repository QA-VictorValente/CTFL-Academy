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
  let email = parseArg('email')?.trim().toLowerCase();
  let password = parseArg('password');
  let fullName = parseArg('name')?.trim();
  let roleInput = parseArg('role')?.trim().toUpperCase();
  const xpArg = parseArg('xp');

  if (!email || !password || !fullName) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log('\n=== ADICIONAR NOVO USUÁRIO (CTFL Academy) ===\n');
    if (!fullName) {
      fullName = await ask(rl, 'Nome completo: ');
    }
    if (!email) {
      email = (await ask(rl, 'E-mail: ')).toLowerCase();
    }
    if (!password) {
      password = await ask(rl, 'Senha (mín. 8 caracteres): ');
    }
    if (!roleInput) {
      const r = await ask(rl, 'Perfil [STUDENT / ADMIN] (padrão: STUDENT): ');
      roleInput = r ? r.toUpperCase() : 'STUDENT';
    }
    rl.close();
  }

  if (!email || !email.includes('@')) {
    console.error('[User Add] Erro: Informe um e-mail válido.');
    process.exit(1);
  }

  if (!fullName || fullName.length < 2) {
    console.error('[User Add] Erro: Informe o nome completo.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('[User Add] Erro: A senha deve ter pelo menos 8 caracteres.');
    process.exit(1);
  }

  const role: UserRole = roleInput === 'ADMIN' ? 'ADMIN' : 'STUDENT';
  const totalXp = xpArg ? Math.max(0, Number(xpArg) || 0) : 0;

  const existing = await prisma.userProfile.findUnique({ where: { email } });
  if (existing) {
    console.error(
      `[User Add] Erro: Já existe um usuário com o e-mail "${email}" (ID: ${existing.id}). Use o script de edição (npm run user:edit).`
    );
    process.exit(1);
  }

  const roleEntity = await prisma.role.upsert({
    where: { code: role },
    update: {},
    create: {
      code: role,
      name:
        role === 'ADMIN'
          ? 'Administrador Editorial e de Sistema'
          : 'Estudante CTFL',
      description:
        role === 'ADMIN'
          ? 'Acesso administrativo completo.'
          : 'Acesso completo aos módulos de estudo e simulados.',
      permissions:
        role === 'ADMIN'
          ? [
              'chapters:manage',
              'questions:manage',
              'questions:review',
              'questions:publish',
              'flashcards:manage',
              'exams:manage',
              'achievements:manage',
              'audit:view',
            ]
          : ['chapters:read', 'exams:take', 'flashcards:study'],
    },
  });

  const user = await prisma.userProfile.create({
    data: {
      email,
      fullName,
      passwordHash: hashPassword(password),
      role,
      roleId: roleEntity.id,
      totalXp,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'USER_CREATED_CLI',
      entityType: 'UserProfile',
      entityId: user.id,
      details: { email: user.email, role: user.role },
    },
  });

  console.log('\n✅ Usuário criado com sucesso!');
  console.table([
    {
      ID: user.id,
      Nome: user.fullName,
      Email: user.email,
      Perfil: user.role,
      XP: user.totalXp,
    },
  ]);
}

main()
  .catch((err) => {
    console.error('[User Add] Erro ao criar usuário:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (stopLocalPg) await stopLocalPg();
  });
