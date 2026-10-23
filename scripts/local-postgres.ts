import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import fs from 'fs';
import net from 'net';

function resolvePgDataDir(): string {
  if (process.env.PG_DATA_DIR) {
    return path.resolve(process.cwd(), process.env.PG_DATA_DIR);
  }
  try {
    const { execSync } = require('child_process');
    const commonDir = execSync('git rev-parse --git-common-dir', { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf-8' }).trim();
    if (commonDir) {
      const mainRoot = path.resolve(process.cwd(), commonDir, '..');
      const mainPgData = path.resolve(mainRoot, '.pgdata');
      if (fs.existsSync(path.join(mainPgData, 'PG_VERSION'))) {
        return mainPgData;
      }
    }
  } catch {
    // fallback
  }
  return path.resolve(process.cwd(), '.pgdata');
}

const PG_DATA_DIR = resolvePgDataDir();
const PG_PORT = 5432;

function isPortListening(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function main() {
  const alreadyRunning = await isPortListening(PG_PORT);
  if (alreadyRunning) {
    console.log(`[Postgres] Servidor PostgreSQL já está ativo na porta ${PG_PORT}.`);
    return;
  }

  const pg = new EmbeddedPostgres({
    databaseDir: PG_DATA_DIR,
    user: 'postgres',
    password: 'postgres',
    port: PG_PORT,
    persistent: true,
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
  });

  const pgVersionFile = path.join(PG_DATA_DIR, 'PG_VERSION');
  if (!fs.existsSync(pgVersionFile)) {
    console.log('[Postgres] Inicializando diretório de dados local (.pgdata) com UTF8...');
    await pg.initialise();
  }

  console.log(`[Postgres] Iniciando servidor PostgreSQL local na porta ${PG_PORT}...`);
  await pg.start();

  try {
    await pg.createDatabase('ctfl_academy');
    console.log('[Postgres] Banco de dados "ctfl_academy" criado com sucesso.');
  } catch {
    console.log('[Postgres] Banco de dados "ctfl_academy" já existe.');
  }

  console.log('[Postgres] Servidor pronto em postgresql://postgres:postgres@localhost:5432/ctfl_academy');

  process.on('SIGINT', async () => {
    await pg.stop();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await pg.stop();
    process.exit(0);
  });

  setInterval(() => {}, 60000);
}

main().catch((err) => {
  console.error('[Postgres] Erro ao iniciar PostgreSQL local:', err);
  process.exit(1);
});
