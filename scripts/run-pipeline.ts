/**
 * Pipeline de Testes e Quality Gate — CTFL Academy
 * Regra: Só sobe se estiver 100% aprovado!
 */
import { spawnSync } from 'child_process';
import net from 'net';

interface PipelineStage {
  name: string;
  command: string;
  args: string[];
  description: string;
  requiresDb?: boolean;
  requiresServer?: boolean;
  requiresK6?: boolean;
  fastSkip?: boolean;
}

const STAGES: PipelineStage[] = [
  {
    name: '1. Prisma Schema Validation',
    command: 'npx',
    args: ['prisma', 'validate'],
    description: 'Validação estrutural e relacional do schema Prisma (22 modelos)',
  },
  {
    name: '2. TypeScript Typecheck (Gate 1)',
    command: 'npm',
    args: ['run', 'typecheck'],
    description: 'Verificação estática de tipos e contratos TS sem erros (tsc --noEmit)',
  },
  {
    name: '3. ESLint Code Quality (Gate 2)',
    command: 'npm',
    args: ['run', 'lint'],
    description: 'Conformidade com padrões de código e regras do Next.js',
  },
  {
    name: '4. UI Anti-Slop Design Gate (Gate 3)',
    command: 'npm',
    args: ['run', 'lint:ui'],
    description: 'Auditoria estática de design, tokens de cor e acessibilidade em src/app e src/components',
  },
  {
    name: '5. Vitest Unit & API Controllers Suite (Gate 4a)',
    command: 'npx',
    args: ['vitest', 'run', 'tests/unit', 'tests/api/api-controllers.test.ts'],
    description: 'Testes unitários de domínio, serviços, formatadores e todos os controllers HTTP',
  },
  {
    name: '6. Vitest Database Integration Suite (Gate 4b)',
    command: 'npm',
    args: ['run', 'test:integration'],
    description: 'Testes de integração transacional com PostgreSQL real',
    requiresDb: true,
    fastSkip: true,
  },
  {
    name: '7. Next.js Production Build (Gate 5)',
    command: 'npm',
    args: ['run', 'build'],
    description: 'Geração do Prisma Client e compilação de produção de todas as páginas e rotas',
    fastSkip: true,
  },
  {
    name: '8. Playwright HTTP API Suite (Gate 6)',
    command: 'npm',
    args: ['run', 'test:api:pw'],
    description: '20 testes de endpoints HTTP (Auth, RBAC 403, Exercícios, Flashcards, Notas)',
    requiresDb: true,
    requiresServer: true,
    fastSkip: true,
  },
  {
    name: '9. Playwright Web E2E Suite (Gate 7)',
    command: 'npm',
    args: ['run', 'test:web'],
    description: '5 fluxos completos de interface (Jornada, Simulado, Admin, Caderno & Mapas)',
    requiresDb: true,
    requiresServer: true,
    fastSkip: true,
  },
  {
    name: '10. Playwright Complete E2E Suite (Gate 8)',
    command: 'npm',
    args: ['run', 'test:e2e'],
    description: 'Jornada ponta a ponta completa (--project=e2e)',
    requiresDb: true,
    requiresServer: true,
    fastSkip: true,
  },
  {
    name: '11. k6 Performance & Smoke Gate (Gate 9)',
    command: 'k6',
    args: ['run', 'tests/performance/smoke.k6.js'],
    description: 'Teste de performance (latência p95 < 350ms, erros < 1%)',
    requiresDb: true,
    requiresServer: true,
    requiresK6: true,
    fastSkip: true,
  },
];

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bgRed: '\x1b[41m\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
};

function logHeader() {
  console.log(`\n${ANSI.cyan}${ANSI.bold}╔════════════════════════════════════════════════════════════════════╗${ANSI.reset}`);
  console.log(`${ANSI.cyan}${ANSI.bold}║           CTFL ACADEMY — PIPELINE DE QUALIDADE & TESTES           ║${ANSI.reset}`);
  console.log(`${ANSI.cyan}${ANSI.bold}║       Diretriz: "Só sobe algo se estiver 100% aprovado"            ║${ANSI.reset}`);
  console.log(`${ANSI.cyan}${ANSI.bold}╚════════════════════════════════════════════════════════════════════╝${ANSI.reset}\n`);
}

function checkPortOpen(port: number, host = '127.0.0.1', timeoutMs = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(timeoutMs);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
}

function checkBinaryAvailable(bin: string): boolean {
  const isWindows = process.platform === 'win32';
  const res = spawnSync(isWindows ? 'where' : 'which', [bin], { stdio: 'ignore', shell: isWindows });
  return res.status === 0;
}

async function runPipeline() {
  logHeader();

  const args = process.argv.slice(2);
  const isFastMode = args.includes('--fast');
  const isStrictMode = args.includes('--strict') || process.env.CI === 'true';

  const dbAvailable = await checkPortOpen(5432);
  const k6Available = checkBinaryAvailable('k6');

  console.log(
    `${ANSI.dim}Modo: ${isFastMode ? 'FAST (Estático + Unit/Controllers)' : isStrictMode ? 'STRICT CI (100% Obrigatório)' : 'AUTO-DETECT'} | PostgreSQL (5432): ${dbAvailable ? 'ONLINE' : 'OFFLINE'} | k6 CLI: ${k6Available ? 'DISPONÍVEL' : 'AUSENTE'}${ANSI.reset}\n`
  );

  const startTime = Date.now();
  const results: { stage: string; status: 'PASSED' | 'SKIPPED'; reason?: string; duration: number }[] = [];

  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];

    if (isFastMode && stage.fastSkip) {
      console.log(`${ANSI.cyan}⏭ Pulando Etapa [${i + 1}/${STAGES.length}]: ${stage.name} (--fast)${ANSI.reset}\n`);
      results.push({ stage: stage.name, status: 'SKIPPED', reason: '--fast', duration: 0 });
      continue;
    }

    if (!isStrictMode && stage.requiresDb && !dbAvailable) {
      console.log(
        `${ANSI.yellow}⏭ Pulando Etapa [${i + 1}/${STAGES.length}]: ${stage.name} (PostgreSQL local offline na porta 5432)${ANSI.reset}\n`
      );
      results.push({ stage: stage.name, status: 'SKIPPED', reason: 'PostgreSQL offline (porta 5432)', duration: 0 });
      continue;
    }

    if (!isStrictMode && stage.requiresK6 && !k6Available) {
      console.log(
        `${ANSI.yellow}⏭ Pulando Etapa [${i + 1}/${STAGES.length}]: ${stage.name} (Binário k6 ausente no PATH local)${ANSI.reset}\n`
      );
      results.push({ stage: stage.name, status: 'SKIPPED', reason: 'k6 ausente no PATH', duration: 0 });
      continue;
    }

    console.log(`${ANSI.yellow}${ANSI.bold}▶ Executando Etapa [${i + 1}/${STAGES.length}]: ${stage.name}${ANSI.reset}`);
    console.log(`  ${ANSI.dim}${stage.description}${ANSI.reset}`);

    const stageStart = Date.now();
    const isWindows = process.platform === 'win32';
    const cmd =
      isWindows && (stage.command === 'npm' || stage.command === 'npx')
        ? `${stage.command}.cmd`
        : stage.command;

    const proc = spawnSync(cmd, stage.args, {
      stdio: 'inherit',
      shell: isWindows,
      env: {
        ...process.env,
        DISABLE_RATE_LIMIT: 'true',
      },
    });

    const duration = ((Date.now() - stageStart) / 1000).toFixed(1);

    if (proc.status !== 0) {
      console.log(`\n${ANSI.bgRed}${ANSI.bold} ❌ FALHA CRÍTICA NA ETAPA: ${stage.name} ${ANSI.reset}`);
      console.log(`${ANSI.red}${ANSI.bold}[QUALITY GATE REPROVADO] Pipeline abortada imediatamente.`);
      console.log(`Regra estrita violada: nada será promovido ou publicado sem 100% de sucesso.${ANSI.reset}\n`);
      process.exit(1);
    }

    console.log(`${ANSI.green}✔ Etapa concluída com sucesso em ${duration}s!${ANSI.reset}\n`);
    results.push({ stage: stage.name, status: 'PASSED', duration: Number(duration) });
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  const passedCount = results.filter((r) => r.status === 'PASSED').length;
  const skippedCount = results.filter((r) => r.status === 'SKIPPED').length;

  console.log(`\n${ANSI.green}${ANSI.bold}╔════════════════════════════════════════════════════════════════════╗${ANSI.reset}`);
  console.log(`${ANSI.green}${ANSI.bold}║           🎉 QUALITY GATE CONCLUÍDO SEM FALHAS!                    ║${ANSI.reset}`);
  console.log(`${ANSI.green}${ANSI.bold}╚════════════════════════════════════════════════════════════════════╝${ANSI.reset}`);
  console.log(
    `\n${ANSI.bold}Relatório Consolidado de Execução (${totalDuration}s | ${passedCount} aprovadas, ${skippedCount} puladas):${ANSI.reset}`
  );

  results.forEach((r, idx) => {
    if (r.status === 'PASSED') {
      console.log(
        `  ${ANSI.green}✔ [Etapa ${idx + 1}]${ANSI.reset} ${r.stage.padEnd(45)} ${ANSI.dim}(${r.duration}s)${ANSI.reset}`
      );
    } else {
      console.log(
        `  ${ANSI.yellow}⏭ [Etapa ${idx + 1}]${ANSI.reset} ${r.stage.padEnd(45)} ${ANSI.dim}[PULADA: ${r.reason}]${ANSI.reset}`
      );
    }
  });

  console.log(`\n${ANSI.cyan}${ANSI.bold}Status: Todas as etapas executadas passaram com 100% de sucesso!${ANSI.reset}\n`);
  process.exit(0);
}

runPipeline();
