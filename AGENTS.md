<!-- trail:start -->
## Trail — repo context graph

This repo is indexed in `.trail/cache/`: small linked markdown nodes that explain each
system and carry exact file:line spans, kept in sync with the code through git.

For ANY task here — understanding how something works, finding where code lives,
or scoping a change — get context from the graph before grepping or opening
source files. Re-ask freely (it's cheap) and reuse literal identifiers you
already have (symbol, error string, file name) as the query. New to this repo?
Run `trail map` first — a token-budgeted orientation (dir clusters, hubs,
hotspots), no LLM, no key.

- Run `trail ask "<your question>" --source` → ranked nodes with the relevant
  code spans inlined (each hit's ≤8-line crux by default; `--full` for whole
  definitions when the crux isn't enough). Match the tool to the task shape:
  for understanding or editing, the top node IS the answer — cite its
  `covers:` file:line spans and edit straight from `--source`. For
  exhaustive tasks ("every occurrence / every caller of this pattern"), ranked
  results are top-N, not complete — run `trail grep "<literal>"` instead
  (exhaustive over indexed files, grouped by enclosing symbol), falling back
  to raw `grep -rn` only for unindexed files.
- `trail skeleton <file>` → every definition's signature + span, ~10× cheaper
  than reading the file; use it to skim an API surface.
- `trail callers <symbol>` gives precomputed, exact edges — who calls this.
  Add `--direction out` for what it calls, or `--depth N` to walk
  transitively for the full blast radius. For structural questions, skip
  ranking and use this directly.
- Or browse: `.trail/cache/INDEX.md` lists every node; follow the links.
- Monorepos and folders of multiple repos rank fairly across sub-projects —
  hits carry `[scope/]` labels naming which one they're from. Narrow with
  `trail ask "<task>" --in <scope>/` once you know where you're working.

If a returned span is truncated ("+N more lines"), open the file at that exact
range before finalizing. Only open source files when a node genuinely lacks a
needed detail, and then at the exact file:line the node points to — never
re-read whole files.

After big code changes, refresh the graph with `trail build` (deterministic,
no API key, $0).
<!-- trail:end -->

## AI Skills, Agents & Design Guidelines (CTFL Academy)

Complete setup reference: `docs/ai-tools-setup.md`.

### Local CLI Invocation (no global installs)
- `trail`: `node .tools/ai-cli/node_modules/@trailhq/trail-code/dist/bin/trail.js <cmd>`
- `agent-browser`: `node .tools/ai-cli/node_modules/agent-browser/bin/agent-browser.js <cmd>`

### Installed Skills (`.claude/skills/`)
| Skill | Role & Scope |
|---|---|
| `trail` | Codebase graph & team learnings in `.trail/` |
| `agent-browser` | Headless Chrome automation & accessibility snapshots |
| `grill-me` / `grilling` | Relentless design-tree interview before writing specs (`docs/productivity/grill-me.md`) |
| `design-taste-frontend` | Anti-slop art direction & layout critique (`--app` mode for CTFL Academy dashboard/study screens) |
| `ui-ux-pro-max` | Design intelligence & UX/accessibility rules (79 styles, 192 palettes, 119 UX guidelines) |
| `design-motion-principles` | Purposeful motion creation & audit (Emil Kowalski / Jakub Krehel / Jhey Tompkins lenses) |
| `ctfl-orquestracao` | Dedicated 5-agent orchestration workflow, 4 operating modes, persistence & final report rules (`docs/orquestracao/MANUAL_ORQUESTRACAO.md`) |

### Precedence & Non-Conflict Rules (Design Skills)
1. **Project source of truth wins:** Existing tokens and components in `tailwind.config.ts`, `src/app/globals.css`, and `src/components/` outrank external palette/typography suggestions unless a redesign is explicitly requested.
2. **`ui-ux-pro-max` vs. `design-taste-frontend`:**
   - Use `ui-ux-pro-max` for UX heuristics, WCAG 2.2 AA checks, component ergonomics, and structured design-system queries.
   - Use `design-taste-frontend` (`references/app-screens.md` for study/exam/dashboard views; page mode only for public landing pages) to prevent generic AI-slop layouts (banned: decorative gradients/glows, icons in tinted squares, invented vanity metrics).
   - Do not run both skills' layout generators on the same screen at once.
3. **Motion & Accessibility (`design-motion-principles`):**
   - Primary lens for CTFL Academy study/exam screens: **Emil Kowalski** (restraint & speed — high-frequency interactions must feel instant; avoid decorative animation during timed exams).
   - Secondary lens: **Jakub Krehel** (subtle production polish on transitions, modals, toasts).
   - **Mandatory accessibility:** Every CSS/JS animation MUST respect `@media (prefers-reduced-motion: reduce)` (Tailwind `motion-safe:` / `motion-reduce:`), avoid vestibular triggers (large zoom, spin, parallax), and keep all functionality usable with animations disabled.
   - Animate only compositor-friendly properties (`transform`, `opacity`); never animate layout properties (`width`, `height`, `top`, `left`).

### Specialized Task Subagents (`.omp/agents/`)
Dispatch via `task` tool `agent` field:
- **Product / Agile:** `product-manager`, `sprint-prioritizer`, `feedback-synthesizer`, `project-shepherd`, `senior-project-manager`
- **Engineering:** `frontend-developer`, `backend-architect`, `software-architect`, `code-reviewer`, `database-optimizer`
- **QA / Testing:** `test-automation-engineer`, `api-tester`, `accessibility-auditor`, `performance-benchmarker`, `evidence-collector`, `reality-checker`
- **DevOps:** `devops-automator`, `git-workflow-master`
- **Design:** `ui-designer`, `ux-architect`, `ux-researcher`, `ui-finish-gate-reviewer`

## Orquestração Multiagente Autônoma com Cérebro Central — CTFL Academy

Manual completo: `docs/orquestracao/MANUAL_ORQUESTRACAO.md` | Contexto central: `docs/orquestracao/CONTEXTO_PROJETO.md`.

### Mandato Inviolável: Orquestração Obrigatória em 100% das Solicitações
**O Cérebro Central NUNCA trabalha sozinho.** Sempre que o usuário solicitar qualquer demanda (dúvida, bug, refatoração, análise, teste, infraestrutura ou nova funcionalidade), o Orquestrador DEVE OBRIGATORIAMENTE acionar e coordenar os agentes especializados da equipe (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`). Em problemas de código e banco, acione no mínimo `desenvolvedor` + `qa`; em infraestrutura/deploy, `devops`; em produto/backlog, `po` + `scrum-master`.

### Cérebro Central e Equipe Oficial Independente (`.omp/agents/`)
| Agente (`agent`) | Papel | Foco e Responsabilidade Central |
|---|---|---|
| `orquestrador` | **Cérebro Central** | Ponto único de comando, interpretação de ordens, delegação real, arbitragem de conflitos/contradições, consolidação de propostas e controle de pausa/retomada |
| `po` | Product Owner | Prioriza **valor de produto e eficácia pedagógica** (Syllabus ISTQB CTFL v4.0.1), histórias de usuário, critérios de aceitação e aceite final |
| `scrum-master` | Scrum Master | Prioriza **fluxo de trabalho, capacidade de execução e dependências**, DoR/DoD, remoção de gargalos e consolidação atômica (*Single-Writer*) |
| `desenvolvedor` | Desenvolvedor Full-Stack | Prioriza **simplicidade arquitetural e Clean Layered Architecture** (`@shared`, `@backend`, `@frontend`, `src/app/api`), código, testes e refatorações |
| `qa` | Quality Assurance | Prioriza **prevenção de defeitos (*shift-left*) e evidências reais** (Vitest, Playwright, k6), questionamento crítico de critérios e abertura/reteste de bugs |
| `devops` | DevOps Engineer | Prioriza **confiabilidade de build, ambientes e CI/CD** (`typecheck`, `lint`, Prisma, PostgreSQL local/Docker e pipeline de 7 estágios) |

### Comandos da Sessão Central (`.omp/commands/`)
- `/planejar [foco]` — Consultoria proativa do `po` e `scrum-master` (3–5 prioridades, esforço, riscos, recomendação; **Nível A**: não implementa código).
- `/executar <tarefa>` — Ciclo Autônomo de 12 Etapas (**Nível B**: execução autorizada até cumprir critérios de aceitação).
- `/consultar <agente> <tema>` — Delega análise direta a um ou mais especialistas com retorno consolidado pelo Orquestrador.
- `/debater <agentes e tema>` — Promove discussão e avaliação conjunta entre agentes independentes (ex.: `desenvolvedor` + `devops` ou `po` + `scrum-master`).
- `/propostas [top5|aceitar|rejeitar]` — Reúne, desduplica e delibera sobre sugestões espontâneas originadas por qualquer agente (`BACKLOG_PROPOSTAS_AGENTES.md`).
- `/pausar [motivo]` e `/retomar [tarefa]` — Pausa a execução salvando checkpoint atômico em `ESTADO_EXECUCAO.json` e retoma exatamente da etapa pendente.
- `/status`, `/backlog`, `/diagnostico [escopo]`, `/corrigir <bug>`, `/equipe <pedido>`.

### Documentos Persistentes de Estado e Comunicação (`docs/orquestracao/`)
- `docs/orquestracao/ESTADO_EXECUCAO.json` — Máquina de estados atômica (etapa atual 1..12, checkpoint de pausa/retomada e agentes registrados)
- `docs/orquestracao/BACKLOG_PROPOSTAS_AGENTES.md` — Registro consolidado de sugestões espontâneas de todos os 5 agentes
- `docs/orquestracao/BARRAMENTO_COMUNICACAO.md` — Protocolo anti-loop (`max 2 hops`) e histórico auditável de comunicações e discordâncias inter-agentes
- `docs/orquestracao/CONTEXTO_PROJETO.md` — Contexto central do CTFL Academy
- `docs/CLICKUP_BACKLOG.md` — Product & Sprint Backlog canônico
- `docs/orquestracao/DECISOES_ADR_PDR.md` — Decisões arquiteturais (ADR) e de produto (PDR)
- `docs/orquestracao/REGISTRO_QA_DEFEITOS.md` — Defeitos (`BUG-xxx`), riscos preventivos e resultados de testes
- `docs/orquestracao/HISTORICO_EXECUCAO.md` — Ponteiro `ESTADO_ATUAL` e histórico de execuções
- `docs/orquestracao/PROTOCOLO_RETOMADA.md` — Procedimento de pausa, retomada e limites reais de processos da plataforma
