import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import fs from 'fs';
import net from 'net';
import { spawn, execSync } from 'child_process';

const PG_DATA_DIR = path.resolve(process.cwd(), '.pgdata');
const PG_PORT = 5432;

function loadEnvFile(): Record<string, string> {
  const loaded: Record<string, string> = {};
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed
          .slice(eqIdx + 1)
          .trim()
          .replace(/^["']|["']$/g, '');
        loaded[key] = val;
        process.env[key] = val;
      }
    }
  } catch {
    // Ignore read error
  }
  return loaded;
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

function isSourceNewerThanBuild(buildIdPath: string): boolean {
  if (!fs.existsSync(buildIdPath)) return true;
  const buildMtime = fs.statSync(buildIdPath).mtimeMs;

  function checkDir(dir: string): boolean {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (checkDir(fullPath)) return true;
        } else if (entry.isFile()) {
          if (fs.statSync(fullPath).mtimeMs > buildMtime) {
            return true;
          }
        }
      }
    } catch {
      // Ignore read errors
    }
    return false;
  }

  const srcDir = path.resolve(process.cwd(), 'src');
  if (fs.existsSync(srcDir) && checkDir(srcDir)) return true;
  return false;
}

async function main() {
  loadEnvFile();
  let pg: EmbeddedPostgres | null = null;
  const dbUrl = process.env.DATABASE_URL || '';
  const isLocalDatabase =
    !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

  if (isLocalDatabase) {
    const alreadyRunning = await isPortListening(PG_PORT);

    if (alreadyRunning) {
      console.log(`[CTFL Academy] PostgreSQL local já está ativo na porta ${PG_PORT}.`);
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

  const nextBin = path.resolve(
    process.cwd(),
    'node_modules',
    'next',
    'dist',
    'bin',
    'next'
  );

  const forceDev = process.argv.includes('--dev');
  const buildIdPath = path.resolve(process.cwd(), '.next', 'BUILD_ID');
  const needsBuild = !forceDev && isSourceNewerThanBuild(buildIdPath);

  if (needsBuild) {
    console.log(
      '[CTFL Academy] Alterações detectadas nos arquivos fonte. Gerando build otimizado...'
    );
    execSync(`"${process.execPath}" "${nextBin}" build`, {
      stdio: 'inherit',
      env: process.env,
    });
  }

  const nextArgs = forceDev ? ['dev'] : ['start'];
  console.log(
    `[CTFL Academy] Iniciando servidor Next.js (${
      forceDev ? 'modo dev' : 'modo ultra-rápido pré-compilado'
    }) em http://localhost:3000 ...`
  );

  const nextProc = spawn(process.execPath, [nextBin, ...nextArgs], {
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
