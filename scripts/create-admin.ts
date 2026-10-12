import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

function parseArg(flag: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${flag}=`));
  if (arg) return arg.split('=').slice(1).join('=');
  return undefined;
}

async function main() {
  const email = (
    parseArg('email') ||
    process.env.ADMIN_EMAIL ||
    'admin@ctfl.local'
  )
    .trim()
    .toLowerCase();
  const password =
    parseArg('password') || process.env.ADMIN_PASSWORD || 'AdminCTFL2026!';
  const fullName =
    parseArg('name') || process.env.ADMIN_NAME || 'Administrador CTFL Academy';

  if (!email || !email.includes('@')) {
    console.error(
      'Uso: npm run admin:create -- --email=admin@ctfl.local --password=SenhaSegura123! --name="Admin CTFL"'
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Erro: A senha do administrador deve ter pelo menos 8 caracteres.');
    process.exit(1);
  }

  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'Administrador Editorial e de Sistema',
      description:
        'Acesso administrativo completo ao banco de questões, capítulos, revisão editorial e auditoria.',
      permissions: [
        'chapters:manage',
        'questions:manage',
        'questions:review',
        'questions:publish',
        'flashcards:manage',
        'exams:manage',
        'achievements:manage',
        'audit:view',
      ],
    },
  });

  const passwordHash = hashPassword(password);

  const adminUser = await prisma.userProfile.upsert({
    where: { email },
    update: {
      fullName,
      passwordHash,
      role: 'ADMIN',
      roleId: adminRole.id,
      deletedAt: null,
    },
    create: {
      email,
      fullName,
      passwordHash,
      role: 'ADMIN',
      roleId: adminRole.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      action: 'ADMIN_PROVISIONED_CLI',
      entityType: 'UserProfile',
      entityId: adminUser.id,
      details: {
        email: adminUser.email,
        method: 'scripts/create-admin.ts',
      },
    },
  });

  console.log(
    `[Admin CLI] Administrador configurado com sucesso: ${adminUser.email} (ID: ${adminUser.id})`
  );
}

main()
  .catch((err) => {
    console.error('[Admin CLI] Falha ao criar administrador:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
