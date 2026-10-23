import fs from 'fs';
import path from 'path';
import net from 'net';
import EmbeddedPostgres from 'embedded-postgres';

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

function isLocalEnv(): boolean {
  const envUrl = process.env.DATABASE_URL || '';
  if (envUrl) {
    return envUrl.includes('localhost') || envUrl.includes('127.0.0.1');
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      return content.includes('localhost') || content.includes('127.0.0.1');
    }
  } catch {
    // Ignore
  }
  return false;
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

export async function ensureLocalPgRunning(): Promise<(() => Promise<void>) | null> {
  if (!isLocalEnv()) return null;

  const running = await isPortListening(PG_PORT);
  if (running) return null;

  const pg = new EmbeddedPostgres({
    databaseDir: PG_DATA_DIR,
    user: 'postgres',
    password: 'postgres',
    port: PG_PORT,
    persistent: true,
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
  });

  if (!fs.existsSync(path.join(PG_DATA_DIR, 'PG_VERSION'))) {
    await pg.initialise();
  }
  await pg.start();
  return async () => {
    try {
      await pg.stop();
    } catch {
      // Ignore
    }
  };
}
