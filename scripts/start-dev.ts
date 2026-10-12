import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { spawn } from 'child_process';

const PG_DATA_DIR = path.resolve(process.cwd(), '.pgdata');
const PG_PORT = 5432;

function getDatabaseUrlFromEnv(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m);
      if (match?.[1]) return match[1];
    }
  } catch {
    // Ignore read error
  }
  return '';
}

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
  let pg: EmbeddedPostgres | null = null;
  const dbUrl = getDatabaseUrlFromEnv();
  const isLocalDatabase =
    dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

  if (!isLocalDatabase && dbUrl) {
    console.log(
      '[CTFL Academy] DATABASE_URL aponta para banco remoto (Supabase). Pulando PostgreSQL local.'
    );
  } else {
    const alreadyRunning = await isPortListening(PG_PORT);

    if (alreadyRunning) {
      console.log(`[CTFL Academy] PostgreSQL já está ativo na porta ${PG_PORT}.`);
    } else {
      pg = new EmbeddedPostgres({
        databaseDir: PG_DATA_DIR,
        user: 'postgres',
        password: 'postgres',
        port: PG_PORT,
        persistent: true,
        initdbFlags: ['--encoding=UTF8', '--locale=C'],
      });

      const pgVersionFile = path.join(PG_DATA_DIR, 'PG_VERSION');
      if (!fs.existsSync(pgVersionFile)) {
        console.log('[CTFL Academy] Inicializando banco PostgreSQL local (.pgdata)...');
        await pg.initialise();
      }

      console.log(`[CTFL Academy] Iniciando PostgreSQL local na porta ${PG_PORT}...`);
      await pg.start();

      try {
        await pg.createDatabase('ctfl_academy');
      } catch {
        // Banco já existe
      }
      console.log('[CTFL Academy] Banco PostgreSQL local ativo e pronto!');
    }
  }

  console.log('[CTFL Academy] Iniciando servidor Next.js em http://localhost:3000 ...');
  const nextBin = path.resolve(
    process.cwd(),
    'node_modules',
    'next',
    'dist',
    'bin',
    'next'
  );

  const nextProc = spawn(process.execPath, [nextBin, 'dev'], {
    stdio: 'inherit',
    env: process.env,
  });

  const cleanup = async () => {
    nextProc.kill();
    if (pg) {
      try {
        await pg.stop();
      } catch {
        // Ignore stop errors
      }
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((err) => {
  console.error('[CTFL Academy] Erro ao iniciar aplicação:', err);
  process.exit(1);
});
