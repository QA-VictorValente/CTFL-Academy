/**
 * Pipeline de Testes e Quality Gate — CTFL Academy
 * Regra: Só sobe se estiver 100% aprovado!
 */
import { spawnSync } from 'child_process';

interface PipelineStage {
  name: string;
  command: string;
  args: string[];
  description: string;
}

const STAGES: PipelineStage[] = [
  {
    name: '1. TypeScript Typecheck',
    command: 'npm',
    args: ['run', 'typecheck'],
    description: 'Verificação estática de tipos e contratos TS sem erros',
  },
  {
    name: '2. ESLint Code Quality',
    command: 'npm',
    args: ['run', 'lint'],
    description: 'Conformidade com padrões de código e regras do Next.js',
  },
  {
    name: '3. Vitest Unit & Integration',
    command: 'npm',
    args: ['run', 'test'],
    description: '30 testes unitários e de integração com banco de dados',
  },
  {
    name: '4. Playwright HTTP API Suite',
    command: 'npx',
    args: ['playwright', 'test', '--project=api'],
    description: '20 testes de endpoints HTTP (Auth, RBAC 403, Exercícios, Flashcards, Notas)',
  },
  {
    name: '5. Playwright Web E2E Suite',
    command: 'npx',
    args: ['playwright', 'test', '--project=web'],
    description: '5 fluxos completos de interface (Jornada, Simulado, Admin, Caderno & Mapas)',
  },
  {
    name: '6. k6 Performance & Smoke Gate',
    command: 'k6',
    args: ['run', 'tests/performance/smoke.k6.js'],
    description: 'Teste de performance (latência p95 < 350ms, erros < 1%)',
  },
  {
    name: '7. Next.js Production Build',
    command: 'npx',
    args: ['next', 'build'],
    description: 'Compilação de produção e bundle de todas as páginas e rotas',
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

function runPipeline() {
  logHeader();

  const startTime = Date.now();
  const results: { stage: string; passed: boolean; duration: number }[] = [];

  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];
    console.log(`${ANSI.yellow}${ANSI.bold}▶ Executando Etapa [${i + 1}/${STAGES.length}]: ${stage.name}${ANSI.reset}`);
    console.log(`  ${ANSI.dim}${stage.description}${ANSI.reset}`);

    const stageStart = Date.now();
    const isWindows = process.platform === 'win32';
    const cmd = isWindows && (stage.command === 'npm' || stage.command === 'npx') 
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
    results.push({ stage: stage.name, passed: true, duration: Number(duration) });
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n${ANSI.green}${ANSI.bold}╔════════════════════════════════════════════════════════════════════╗${ANSI.reset}`);
  console.log(`${ANSI.green}${ANSI.bold}║           🎉 QUALITY GATE APROVADO COM 100% DE SUCESSO!            ║${ANSI.reset}`);
  console.log(`${ANSI.green}${ANSI.bold}╚════════════════════════════════════════════════════════════════════╝${ANSI.reset}`);
  console.log(`\n${ANSI.bold}Relatório Consolidado de Execução (${totalDuration}s):${ANSI.reset}`);
  
  results.forEach((r, idx) => {
    console.log(`  ${ANSI.green}✔ [Etapa ${idx + 1}]${ANSI.reset} ${r.stage.padEnd(35)} ${ANSI.dim}(${r.duration}s)${ANSI.reset}`);
  });

  console.log(`\n${ANSI.cyan}${ANSI.bold}Status: Pronto para commit, push e deploy em produção!${ANSI.reset}\n`);
  process.exit(0);
}

runPipeline();
