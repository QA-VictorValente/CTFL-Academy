# Registro de Decisões Arquiteturais (ADR) e de Produto (PDR) — CTFL Academy

**Objetivo:** Manter a memória institucional das decisões de produto e engenharia do CTFL Academy para que os agentes (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`) não repitam perguntas já decididas nem violem contratos estabelecidos.

---

## Decisões de Produto (PDR)

### PDR-001 — Fidelidade Estrita à Matriz Oficial ISTQB CTFL v4.0.1
- **Data:** Ciclo 1 (Consolidado)
- **Status:** Aceito e Ativo
- **Decisor:** Product Owner (`po`) & Usuário
- **Contexto:** Estudantes precisam treinar nas condições exatas do exame oficial.
- **Decisão:** O Simulado Oficial Completo tem obrigatoriamente 40 questões (`Cap.1: 8`, `Cap.2: 6`, `Cap.3: 4`, `Cap.4: 12`, `Cap.5: 8`, `Cap.6: 2`), duração de 60 minutos (ou 75 minutos com +25% para idioma não-nativo) e nota de aprovação de 26 acertos ($\ge 65\%$).
- **Consequências:** Nenhuma alteração pode modificar esses pesos ou expor o gabarito antes da submissão (`IN_PROGRESS`).

### PDR-002 — Expansão do Banco para 80 Questões Comentadas Alternativa por Alternativa
- **Data:** Ciclo 1 (`CTFL-102`)
- **Status:** Aceito e Concluído
- **Decisor:** Product Owner (`po`)
- **Contexto:** Com 55 questões, dois simulados de 40 questões geravam alta repetição imediata.
- **Decisão:** Expandir o banco para 80 questões (78 `PUBLISHED` e 2 `IN_REVIEW` para testes de curadoria), exigindo justificativa didática individual em cada uma das 4 alternativas (`A`, `B`, `C`, `D`) e referência explícita ao objetivo de aprendizagem (`FL-x.x.x`).

### PDR-003 — Priorização de Vozes Neurais HD no Leitor de Áudio das Aulas
- **Data:** Ciclo 1 (`CTFL-105`)
- **Status:** Aceito e Concluído
- **Decisor:** Product Owner (`po`) & Desenvolvedor (`desenvolvedor`)
- **Contexto:** Vozes SAPI5 antigas do Windows prejudicavam a experiência de estudo em áudio.
- **Decisão:** Ordenar automaticamente vozes neurais (Microsoft Edge Natural, Google Português) no topo do seletor, isolar vozes antigas no fim com tag `[Desktop]`, persistir escolha no `localStorage` e incluir modal educativo `💡 Vozes HD Grátis`.

### PDR-004 — Gamificação Idempotente e Auditável
- **Data:** Ciclo 1 (Consolidado)
- **Status:** Aceito e Ativo
- **Decisor:** Product Owner (`po`) & Engenharia
- **Contexto:** Evitar exploração de pontos por cliques repetidos ou reenvio de requisições HTTP.
- **Decisão:** Todo evento de XP (`LESSON_COMPLETED`, `EXERCISE_CORRECT`, `FLASHCARD_REVIEWED`, `EXAM_COMPLETED`, `EXAM_PASSED`) exige chave única `idempotencyKey` validada em transação no PostgreSQL.

---

## Decisões Arquiteturais e de Operação (ADR)

### ADR-001 — Clean Layered Architecture em 3 Camadas (`@shared`, `@backend`, `@frontend`)
- **Data:** Ciclo 1 (Consolidado)
- **Status:** Aceito e Ativo
- **Decisor:** Engenharia (`desenvolvedor`)
- **Contexto:** Evitar acoplamento entre componentes React, rotas do Next.js e queries Prisma.
- **Decisão:**
  - Componentes React (`src/components/`, `src/frontend/`) comunicam-se apenas via `@frontend/api-clients/*`.
  - Rotas `src/app/api/**/route.ts` são *thin delegates* para `@backend/controllers/*`.
  - Regras de negócio residem exclusivamente em `@backend/services/*`.
  - Schemas Zod e tipos compartilhados ficam em `@shared/*`.

### ADR-002 — Quality Gate Estrito de 7 Estágios (`scripts/run-pipeline.ts` e GitHub Actions)
- **Data:** Ciclo 1 (`CTFL-103`)
- **Status:** Aceito e Ativo
- **Decisor:** `qa` & `devops`
- **Contexto:** Garantir zero regressões antes de merges na branch principal.
- **Decisão:** A pipeline oficial (`npm run pipeline` e `.github/workflows/ci.yml`) executa em sequência obrigatória: Typecheck (`tsc --noEmit`), ESLint, Vitest (Unit + Integration), Playwright API, Playwright Web E2E, k6 Smoke Test e Next.js Production Build.

### ADR-003 — Isolamento de Ferramentas CLI de IA em `.tools/ai-cli/`
- **Data:** 2026-10-22
- **Status:** Aceito e Ativo
- **Decisor:** `devops`
- **Contexto:** Ferramentas auxiliares de IA (`@trailhq/trail-code`, `agent-browser`) não devem poluir o `package.json` nem quebrar o `npm ci` da aplicação Next.js no CI, e instalações globais (`npm i -g`) são vedadas.
- **Decisão:** Manter CLIs auxiliares isoladas em `.tools/ai-cli/` (ignorado no `.gitignore`) e invocá-las via `node .tools/ai-cli/node_modules/...`.

### ADR-004 — Arquitetura de Orquestração Multiagente Nativa no OMP
- **Data:** 2026-10-22
- **Status:** Aceito e Ativo
- **Decisor:** Orquestrador OMP & Usuário
- **Contexto:** Necessidade de operar uma equipe real de 5 agentes dedicados ao CTFL Academy (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`) com responsabilidades independentes, comunicação entre agentes, persistência entre sessões e preservação dos 22 agentes especialistas preexistentes.
- **Decisão:**
  1. Definir os 5 agentes dedicados em `.omp/agents/{po,scrum-master,desenvolvedor,qa,devops}.md` (descoberta nativa de prioridade máxima do OMP), preservando os 22 agentes de apoio em `.omp/agents/`.
  2. Utilizar a ferramenta nativa `task` (e `eval` `agent()`/`workpool()` quando necessário) para delegação real em subprocessos independentes, com comunicação via `agent://<id>`, `history://<id>` e artefatos de sessão `local://<nome>.md`.
  3. Persistir estado inter-sessão em arquivos versionáveis em `docs/orquestracao/` e `docs/CLICKUP_BACKLOG.md`.
  4. Disponibilizar comandos nativos `.omp/commands/{planejar,executar,diagnostico,corrigir,equipe,backlog,retomar}.md` e a skill `.claude/skills/ctfl-orquestracao/SKILL.md`.
  5. Utilizar `.omp/RULES.md` para regras *sticky* (`RULES@project`) sem criar `.omp/AGENTS.md` (evitando sombrear o `AGENTS.md` da raiz do repositório).
