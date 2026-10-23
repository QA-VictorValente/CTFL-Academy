# Configuração de Ferramentas de IA e Design — CTFL Academy

Este documento registra o diagnóstico de ambiente, a instalação, a configuração, os modos de uso, a verificação e as limitações dos 9 recursos de IA e Design avaliados para o projeto **CTFL Academy**.

---

## 1. Diagnóstico do Ambiente e do Projeto

| Item | Estado Encontrado |
|---|---|
| **Raiz desta worktree** | `C:/Users/Victor/orca/workspaces/CTFL Academy/refatoracao` (branch `refatoracao`) |
| **Worktree principal do Git** | `C:/Users/Victor/Documents/CTFL Academy` (branch `main`) |
| **Stack da aplicação** | Next.js 14.2.15 (App Router), React 18.3.1, TypeScript 5.6.3, Tailwind CSS 3.4.14 (`tailwindcss-animate`), Prisma 5.22.0 + PostgreSQL (`embedded-postgres`), Supabase SSR, Edge TTS, Zod, React Hook Form |
| **Qualidade e testes** | Vitest 2.1.4, Playwright 1.48.2, ESLint 8, Prettier 3, Grafana k6 (`scripts/run-pipeline.ts` e `.github/workflows/ci.yml` exigem Node 20) |
| **Gerenciador de pacotes** | `npm` 11.0.0 (`package-lock.json` presente) |
| **Runtimes instalados** | Node.js `v20.20.2`, Git `2.44.0.windows.1`, Google Chrome `155.0.8059.85`, Microsoft Edge, Playwright Chromium |
| **Runtimes ausentes** | Python 3 (apenas alias da Microsoft Store ativo), Visual Studio C++ Build Tools (para `node-gyp`), `uv`, `bun`, `ffmpeg` |
| **Agente de IA ativo** | **omp (Oh My Pi)** (`C:\Users\Victor\AppData\Local\omp\omp.exe`). Diretórios `~/.claude`, `~/.codex` e `~/.gemini` existem no perfil do usuário, mas os binários `claude`, `codex` e `gemini` não estão no `PATH` |

### Compatibilidade de diretórios com o agente (`omp` + Claude Code / Codex)

De acordo com a documentação interna do `omp` (`omp://skills.md`, `omp://task-agent-discovery.md`, `omp://mcp-config.md`):

- **Skills de projeto:** `.claude/skills/<nome>/SKILL.md` (prioridade 80, `enableClaudeProject: true` por padrão no `omp`, e nativo no Claude Code) e `.omp/skills/<nome>/SKILL.md` (prioridade 100). Para evitar duplicação, todas as skills foram instaladas em **`.claude/skills/`**, que atende simultaneamente o `omp` e o Claude Code.
- **Subagentes da ferramenta `task`:** o `omp` descobre agentes **exclusivamente** em `.omp/agents/*.md` (projeto) e `~/.omp/agent/agents/*.md` (usuário), exigindo frontmatter com `name` e `description`. Diretórios `.claude/agents` são ignorados pelo `omp`.
- **Servidores MCP:** `.omp/mcp.json` (nativo do `omp` no projeto).
- **Instruções globais do repositório:** `AGENTS.md` na raiz do projeto (carregado automaticamente pelo `omp`, Codex, Cursor e OpenCode).
- **Isolamento de pacotes CLI:** para não poluir o `package.json` nem o `package-lock.json` da aplicação Next.js (protegendo o `npm ci` do GitHub Actions em Node 20) e evitar instalações globais (`npm i -g`), os pacotes CLI foram instalados na sandbox local **`.tools/ai-cli/`** (ignorada no `.gitignore`).

---

## 2. Resumo Geral de Status

| # | Ferramenta / Repositório | Status | Onde foi instalado / configurado | Observação principal |
|---|---|---|---|---|
| 1 | **Trail-Code** (`trailhq/Trail-Code`) | **Instalado e ativo** | `.tools/ai-cli/`, `.trail/`, `.claude/settings.json`, `.claude/skills/trail/SKILL.md`, `.omp/mcp.json`, `AGENTS.md` | Grafo construído (588 nós, 1.454 arestas em 192 arquivos) via parser WASM (`--ignore-scripts`). |
| 2 | **Agency Agents** (`msitarzewski/agency-agents`) | **Instalado e adaptado** | `.omp/agents/*.md` (22 agentes priorizados) | Frontmatter adaptado para o formato de subagentes do `omp` (PO, Agilidade/Scrum, Dev, QA, DevOps e Design). |
| 3 | **Agent Browser** (`vercel-labs/agent-browser`) | **Instalado e ativo** | `.tools/ai-cli/`, `.claude/skills/agent-browser/SKILL.md`, `.omp/mcp.json` | Binário nativo `v0.39.2` (`win32-x64`) + Chrome 155 detectado (`doctor`: 4 pass, 0 fail). |
| 4 | **Grill Me** (`mattpocock/skills`) | **Instalado e ativo** | `.claude/skills/grill-me/` e `.claude/skills/grilling/` | Inclui a skill `grill-me`, a primitiva `grilling` e a documentação `reference-grill-me.md`. |
| 5 | **Taste Skill** (`Leonxlnx/taste-skill`) | **Instalado e ativo** | `.claude/skills/design-taste-frontend/` | SKILL, biblioteca (247 sites) e scripts (`draw.mjs`, `lint.mjs`, `inspect.mjs`) testados e funcionais em Node 20. |
| 6 | **UI/UX Pro Max** (`nextlevelbuilder/ui-ux-pro-max-skill`) | **Parcial (Skill + CSVs instalados; CLI Python pendente)** | `.claude/skills/ui-ux-pro-max/` e `.tools/ai-cli/` | SKILL e bases CSV/stacks instalados; execução de `scripts/search.py` aguarda instalação de Python 3 no Windows. |
| 7 | **Awesome Claude Design** (`VoltAgent/awesome-claude-design`) | **Apenas documentado (catálogo)** | Referenciado neste documento e em `AGENTS.md` | É uma lista curada de links `DESIGN.md` em `getdesign.md`, não um pacote instalável. |
| 8 | **Design Motion Principles** (`kylezantos/design-motion-principles`) | **Instalado e integrado** | `.claude/skills/design-motion-principles/` e `AGENTS.md` | Modos Create/Audit + regras obrigatórias de `prefers-reduced-motion` integradas ao `AGENTS.md`. |
| 9 | **Design MD Chrome** (`bergside/design-md-chrome`) | **Preparado localmente (carregamento manual no Chrome pendente)** | `.tools/design-md-chrome/` | Extensão Manifest V3 testada (`All tests passed`); exige clique manual em `chrome://extensions` (*Load unpacked*). |
| 10 | **Orquestração Multiagente CTFL Academy** | **Instalado e ativo** | `.omp/agents/{po,scrum-master,desenvolvedor,qa,devops}.md`, `.omp/commands/*.md`, `.omp/RULES.md`, `.claude/skills/ctfl-orquestracao/`, `docs/orquestracao/` | Equipe dedicada de 5 agentes com 4 modos de operação, fluxo de 13 etapas e persistência inter-sessão. |

---

## 3. Detalhamento por Ferramenta

### 3.1. Trail-Code (`@trailhq/trail-code`)

- **Finalidade:** Camada de contexto com mapa estrutural do código (*graft map* via tree-sitter: arquivos, funções e quem chama quem) e memória de decisões da equipe em `.trail/learnings/`.
- **Fonte oficial:** https://github.com/trailhq/Trail-Code (`v0.24.1`, commit `13c6da5`, licença MIT).
- **Método de instalação:**
  - Pacote instalado localmente em `.tools/ai-cli/` com `DO_NOT_TRACK=1 npm i --ignore-scripts @trailhq/trail-code@0.24.1`.
  - A flag `--ignore-scripts` foi usada porque dependências opcionais de gramáticas nativas (`tree-sitter-kotlin` etc.) invocam `node-gyp` e exigem o Visual Studio C++ Build Tools (ausente na máquina). O Trail-Code faz fallback automático para seus parsers WASM (`web-tree-sitter` / `tree-sitter-wasm`) para TypeScript, TSX e JavaScript.
  - Inicializado no repositório com `trail init --agents claude agents --no-global --no-statusline .` (sem alterar arquivos globais fora do repositório).
- **Caminho dos arquivos instalados:**
  - CLI local: `.tools/ai-cli/node_modules/@trailhq/trail-code/dist/bin/trail.js`
  - Grafo e aprendizados do repositório: `.trail/cache/` (ignorado pelo `.trail/.gitignore`), `.trail/learnings/`, `.trail/hook.cjs`, `.trail/README.md`
  - Skill: `.claude/skills/trail/SKILL.md`
  - Hooks (para Claude Code): `.claude/settings.json` e `.claude/settings.local.json`
  - Servidor MCP (para `omp`): `.omp/mcp.json` (`trail`)
  - Instruções: seção `<!-- trail:start --> ... <!-- trail:end -->` em `AGENTS.md`
- **Dependências necessárias:** Node.js >= 20 (atendido: `v20.20.2`). Sem chave de API para `build`, `map`, `ask`, `grep`, `skeleton`, `callers`, `check` e `note`.
- **Como utilizar:**
  ```bash
  # Orientação geral do repositório (clusters, hubs e hotspots)
  node .tools/ai-cli/node_modules/@trailhq/trail-code/dist/bin/trail.js map .

  # Buscar código e aprendizados relevantes para uma tarefa
  node .tools/ai-cli/node_modules/@trailhq/trail-code/dist/bin/trail.js ask "como funciona o calculo de XP" --source .

  # Ver assinaturas de um arquivo (~10x menos tokens)
  node .tools/ai-cli/node_modules/@trailhq/trail-code/dist/bin/trail.js skeleton src/backend/services/gamification.service.ts .

  # Rastrear quem chama uma função (blast radius)
  node .tools/ai-cli/node_modules/@trailhq/trail-code/dist/bin/trail.js callers requireAuth .

  # Atualizar o grafo após alterações de código
  node .tools/ai-cli/node_modules/@trailhq/trail-code/dist/bin/trail.js build .

  # Verificar mudanças da branch contra aprendizados da equipe antes de PR
  node .tools/ai-cli/node_modules/@trailhq/trail-code/dist/bin/trail.js check .
  ```
- **Como verificar se está funcionando:**
  ```bash
  node .tools/ai-cli/node_modules/@trailhq/trail-code/dist/bin/trail.js status .
  ```
  Saída esperada: `code map ✓ 588 nodes · in sync with the code`.
- **Limitações e incompatibilidades:**
  - Os hooks em `.claude/settings.json` são específicos do Claude Code; no `omp`, a integração ocorre via `AGENTS.md`, `.claude/skills/trail/SKILL.md`, CLI e servidor MCP em `.omp/mcp.json`.
  - Telemetria anônima pode ser desativada permanentemente com `node .tools/ai-cli/node_modules/@trailhq/trail-code/dist/bin/trail.js telemetry disable` ou `DO_NOT_TRACK=1`.
- **Atualização e remoção:**
  - Atualizar: `cd .tools/ai-cli && DO_NOT_TRACK=1 npm i --ignore-scripts @trailhq/trail-code@latest` e rodar `build .`.
  - Remover: `node .tools/ai-cli/node_modules/@trailhq/trail-code/dist/bin/trail.js uninstall -y --no-global .` e remover `.claude/skills/trail` e a entrada `trail` de `.omp/mcp.json`.

---

### 3.2. Agency Agents (`msitarzewski/agency-agents`)

- **Finalidade:** Coleção de especialistas de IA com identidade, missão, fluxos de trabalho, entregáveis técnicos e critérios de qualidade.
- **Fonte oficial:** https://github.com/msitarzewski/agency-agents (commit `4e3ac3c`, licença MIT).
- **Método de instalação:**
  - Seleção e adaptação de 22 agentes priorizando Product Owner, Scrum Master / Agilidade, Desenvolvedor, QA, DevOps e Design compatíveis com a stack do CTFL Academy.
  - Conversão do frontmatter original (que usa nomes com espaços e campos do Claude Code) para o contrato nativo de subagentes do `omp` (`.omp/agents/<slug>.md` com `name` em kebab-case, `description` e comentário de atribuição `# source:` preservando o link e a licença MIT).
- **Caminho dos arquivos instalados (`.omp/agents/`):**
  - **Product Owner / Produto (3):** `product-manager.md`, `sprint-prioritizer.md`, `feedback-synthesizer.md`
  - **Scrum Master / Gestão Ágil de Projetos (2):** `project-shepherd.md`, `senior-project-manager.md` *(observação: o repositório não possui um arquivo chamado literalmente `scrum-master.md`; `sprint-prioritizer` e `project-shepherd` cobrem cerimonias ágeis, planejamento de sprints, priorização de backlog e remoção de impedimentos)*
  - **Desenvolvedor / Engenharia (5):** `frontend-developer.md`, `backend-architect.md`, `software-architect.md`, `code-reviewer.md`, `database-optimizer.md`
  - **QA / Testes (6):** `test-automation-engineer.md`, `api-tester.md`, `accessibility-auditor.md`, `performance-benchmarker.md`, `evidence-collector.md`, `reality-checker.md`
  - **DevOps (2):** `devops-automator.md`, `git-workflow-master.md`
  - **Design (4):** `ui-designer.md`, `ux-architect.md`, `ux-researcher.md`, `ui-finish-gate-reviewer.md`
- **Dependências necessárias:** Nenhuma dependência externa; utiliza o sistema nativo de subagentes (`task`) do `omp`.
- **Como utilizar:**
  - No `omp`, acione pela ferramenta `task` passando `agent: "<slug>"` em `tasks[]` (ex.: `agent: "test-automation-engineer"`, `agent: "product-manager"`, `agent: "ui-finish-gate-reviewer"`), ou peça diretamente no chat: *"Use o agente `database-optimizer` para revisar os índices do `prisma/schema.prisma`"*.
  - Também é possível inspecionar na interface com `/agents` ou `Alt+A` (Agent Hub).
- **Como verificar se está funcionando:**
  ```bash
  ls .omp/agents
  head -n 6 .omp/agents/product-manager.md
  ```
- **Limitações e incompatibilidades:**
  - O `omp` ignora `.claude/agents/`; por isso os arquivos ficam em `.omp/agents/`. Caso utilize o Claude Code CLI no futuro, basta copiar ou criar symlink de `.omp/agents/*.md` para `.claude/agents/`.
  - O campo `tools:` restrito ao Claude Code (`WebFetch, WebSearch...`) foi omitido no frontmatter para que os subagentes herdem o conjunto padrão de ferramentas do `omp`.
- **Atualização e remoção:**
  - Atualizar: clonar `https://github.com/msitarzewski/agency-agents.git` em pasta temporária e regerar `.omp/agents/*.md` mantendo `name` (kebab-case) e `description`.
  - Remover: `rm -rf .omp/agents`.

---

### 3.3. Agent Browser (`vercel-labs/agent-browser`)

- **Finalidade:** CLI nativo em Rust e servidor MCP para automação de navegador (Chrome/Chromium via CDP) voltado para agentes de IA, com snapshots da árvore de acessibilidade e referências compactas (`@e1`, `@e2`).
- **Fonte oficial:** https://github.com/vercel-labs/agent-browser (`v0.39.2`, commit `50c34e7`, licença Apache-2.0).
- **Método de instalação:**
  - Instalado localmente em `.tools/ai-cli/` (`npm i --ignore-scripts agent-browser@0.39.2`) seguido da execução inspecionada de `node .tools/ai-cli/node_modules/agent-browser/scripts/postinstall.js`, que validou o binário nativo `agent-browser-win32-x64.exe` e detectou o Google Chrome já instalado no sistema.
  - Skill de descoberta copiada para `.claude/skills/agent-browser/SKILL.md`.
  - Servidor MCP registrado em `.omp/mcp.json` (`agent-browser`).
- **Caminho dos arquivos instalados:**
  - Wrapper JS / Binário nativo: `.tools/ai-cli/node_modules/agent-browser/bin/agent-browser.js` e `agent-browser-win32-x64.exe`
  - Skills embutidas no CLI: `.tools/ai-cli/node_modules/agent-browser/skill-data/` (`core`, `dogfood`, `electron`, `slack`, `derive-client`, `webmcp-gen`, etc.)
  - Skill de descoberta no projeto: `.claude/skills/agent-browser/SKILL.md`
  - Configuração MCP: `.omp/mcp.json`
- **Dependências necessárias:** Google Chrome (detectado em `C:\Program Files\Google\Chrome\Application\chrome.exe`, v155). `ffmpeg` é opcional (apenas para gravação de vídeo com `record`).
- **Como utilizar:**
  ```bash
  # Carregar o guia completo de uso para o agente
  node .tools/ai-cli/node_modules/agent-browser/bin/agent-browser.js skills get core

  # Carregar a skill de testes exploratórios / QA (dogfooding)
  node .tools/ai-cli/node_modules/agent-browser/bin/agent-browser.js skills get dogfood

  # Fluxo básico de automação
  node .tools/ai-cli/node_modules/agent-browser/bin/agent-browser.js open http://localhost:3000
  node .tools/ai-cli/node_modules/agent-browser/bin/agent-browser.js snapshot
  node .tools/ai-cli/node_modules/agent-browser/bin/agent-browser.js screenshot pagina.png
  node .tools/ai-cli/node_modules/agent-browser/bin/agent-browser.js close
  ```
- **Como verificar se está funcionando:**
  ```bash
  node .tools/ai-cli/node_modules/agent-browser/bin/agent-browser.js doctor --offline --quick
  ```
  Saída verificada: `Summary: 4 pass, 1 warn, 0 fail` (o único aviso é `ffmpeg` opcional ausente).
- **Limitações e incompatibilidades:**
  - No `omp`, quando a ferramenta nativa `browser` está habilitada (`browser.enabled: true`), o `omp` pode filtrar servidores MCP externos de navegador. O CLI via `bash` e a skill `.claude/skills/agent-browser/SKILL.md` funcionam independentemente disso.
  - Em shells Git Bash no Windows, invoque via `node .tools/ai-cli/node_modules/agent-browser/bin/agent-browser.js` (os shims `.cmd` do npm usam caminhos relativos em estilo CMD).
- **Atualização e remoção:**
  - Atualizar: `cd .tools/ai-cli && npm i agent-browser@latest`.
  - Remover: remover `agent-browser` de `.tools/ai-cli/package.json`, apagar `.claude/skills/agent-browser` e remover a entrada `agent-browser` de `.omp/mcp.json`.

---

### 3.4. Matt Pocock Skills — Grill Me (`mattpocock/skills`)

- **Finalidade:** Habilidade de entrevista estruturada em rodadas (*design tree frontier*) que questiona uma ideia, plano ou arquitetura até eliminar todas as ambiguidades antes da escrita de especificações ou código.
- **Fonte oficial:** https://github.com/mattpocock/skills (commit `5beb35b`, licença MIT) — especificamente `docs/productivity/grill-me.md`, `skills/productivity/grill-me/SKILL.md` e `skills/productivity/grilling/SKILL.md`.
- **Método de instalação:**
  - Como o instalador `npx skills@latest` exige Node `>=22.20.0` (usa `fs/promises.glob`, inexistente no Node `20.20.2`), foi utilizado o método de cópia direta dos diretórios oficiais `grill-me` e `grilling` (necessário porque `grill-me` delega a disciplina de entrevista para a skill `grilling`), além da documentação oficial `docs/productivity/grill-me.md`.
- **Caminho dos arquivos instalados:**
  - `.claude/skills/grill-me/SKILL.md` (entrada invocada pelo usuário, adaptada para apontar tanto para `Skill` no Claude Code quanto para `skill://grilling` no `omp`)
  - `.claude/skills/grill-me/reference-grill-me.md` (cópia integral de `docs/productivity/grill-me.md`)
  - `.claude/skills/grilling/SKILL.md` e `.claude/skills/grilling/reference-grilling.md`
- **Dependências necessárias:** Nenhuma. É uma skill *stateless* baseada em prompt.
- **Como utilizar:**
  - Em uma nova sessão (ou após `/clear`), digite `/skill:grill-me` (no `omp`) ou `/grill-me` (no Claude Code) seguido da ideia ou funcionalidade que deseja planejar para o CTFL Academy, mantendo o *plan mode* desligado.
- **Como verificar se está funcionando:**
  ```bash
  cat .claude/skills/grill-me/SKILL.md
  cat .claude/skills/grilling/SKILL.md
  ```
  *(Nota: no `omp`, recarregue a sessão ou execute `/clear` / `/new` para que novas skills adicionadas ao disco apareçam em `skill://grill-me` e `skill://grilling`.)*
- **Limitações e incompatibilidades:**
  - Possui `disable-model-invocation: true` por design oficial: o agente não ativa `grill-me` sozinho sem comando explícito do usuário, evitando transformar tarefas simples de código em longas entrevistas.
- **Atualização e remoção:**
  - Atualizar: atualizar os arquivos a partir de `skills/productivity/grill-me`, `skills/productivity/grilling` e `docs/productivity/grill-me.md` do repositório `mattpocock/skills`.
  - Remover: `rm -rf .claude/skills/grill-me .claude/skills/grilling`.

---

### 3.5. Taste Skill (`Leonxlnx/taste-skill`)

- **Finalidade:** Direção de arte frontend anti-*AI-slop* (`tasteskill v2` / `design-taste-frontend`), baseada no estudo de 247 sites premiados, com biblioteca de direções visuais, regras para telas de aplicação (`references/app-screens.md`), linter de código/UI e inspetor em navegador real.
- **Fonte oficial:** https://github.com/Leonxlnx/taste-skill (commit `6010f91`, licença MIT).
- **Método de instalação:**
  - Cópia integral de `skills/taste-skill` para `.claude/skills/design-taste-frontend/` (nome oficial de instalação definido no frontmatter `name: design-taste-frontend`).
- **Caminho dos arquivos instalados:**
  - `.claude/skills/design-taste-frontend/SKILL.md`
  - `.claude/skills/design-taste-frontend/references/` (`app-screens.md`, `colour.md`, `copy.md`, `critique.md`, `imagery.md`, `layout.md`, `motion.md`, `research.md`, `scenes.md`, `tells.md`, `type.md`)
  - `.claude/skills/design-taste-frontend/library/` (`app.json`, `directions.json`, `heroes.json`, `motions.json`, `palettes.json`, `photos.json`, `sections.json`, `sites.json`, `type.json`)
  - `.claude/skills/design-taste-frontend/scripts/` (`draw.mjs`, `inspect.mjs`, `lint.mjs`, `assets.mjs`, `scenes.mjs`)
- **Dependências necessárias:** Node.js e Google Chrome / Edge (presentes).
- **Como utilizar:**
  ```bash
  # Sortear direções de design para telas de aplicação educacional (--app)
  node .claude/skills/design-taste-frontend/scripts/draw.mjs --app --sector education

  # Sortear direções para landing page pública
  node .claude/skills/design-taste-frontend/scripts/draw.mjs --sector education

  # Inspecionar uma página em execução no Chrome em 3 larguras (1440, 768, 390)
  node .claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:3000 --app

  # Executar o linter de anti-slop em arquivos de interface
  node .claude/skills/design-taste-frontend/scripts/lint.mjs src/components
  ```
- **Como verificar se está funcionando:**
  ```bash
  node .claude/skills/design-taste-frontend/scripts/draw.mjs --help
  ```
- **Limitações e incompatibilidades:**
  - Embora o README mencione Node 22+, todos os 5 scripts `.mjs` foram testados e executam normalmente em Node `v20.20.2`.
  - Para evitar conflito com o UI/UX Pro Max e com o design atual do CTFL Academy, o `AGENTS.md` define que telas internas (dashboard, simulados, caderno, admin) devem usar o modo `--app` (`references/app-screens.md`) e respeitar os tokens existentes em `tailwind.config.ts`.
- **Atualização e remoção:**
  - Atualizar: substituir `.claude/skills/design-taste-frontend/` pela pasta `skills/taste-skill` mais recente de `Leonxlnx/taste-skill`.
  - Remover: `rm -rf .claude/skills/design-taste-frontend .taste-skill`.

---

### 3.6. UI/UX Pro Max Skill (`nextlevelbuilder/ui-ux-pro-max-skill`)

- **Finalidade:** Base de inteligência de UI/UX com 79 estilos visuais, 192 paletas por indústria, 74 combinações tipográficas, 119 diretrizes de UX/acessibilidade, 25 tipos de gráficos e guias para 22 stacks (incluindo `nextjs`, `react`, `shadcn`, `tailwind`).
- **Fonte oficial:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (`ui-ux-pro-max-cli@2.15.0`, commit `04cfb44`, licença MIT).
- **Método de instalação:**
  - CLI instalado em `.tools/ai-cli/` (`npm i --ignore-scripts ui-ux-pro-max-cli@2.15.0`).
  - Geração dos templates oficiais com `uipro init --ai claude` e instalação seletiva apenas da skill principal `.claude/skills/ui-ux-pro-max/` (omitindo skills extras não solicitadas como `slides` e `banner-design` para evitar conflitos e duplicação de regras).
- **Caminho dos arquivos instalados:**
  - `.claude/skills/ui-ux-pro-max/SKILL.md`
  - `.claude/skills/ui-ux-pro-max/data/` (arquivos CSV: `styles.csv`, `colors.csv`, `typography.csv`, `ux-guidelines.csv`, `charts.csv`, `ui-reasoning.csv`, etc. + `data/stacks/nextjs.csv`, `react.csv`, `shadcn.csv`, `tailwind.csv`)
  - `.claude/skills/ui-ux-pro-max/scripts/` (`search.py`, `core.py`, `design_system.py`)
  - CLI gerador: `.tools/ai-cli/node_modules/ui-ux-pro-max-cli/dist/index.js`
- **Dependências necessárias:**
  - **Leitura da SKILL e dos CSVs pela IA:** nenhuma dependência (funciona imediatamente via `read`/`grep`).
  - **Execução do motor de busca `scripts/search.py`:** requer **Python 3.x** (biblioteca padrão).
- **Como utilizar:**
  - **Sem Python (ativo agora):** a IA lê `.claude/skills/ui-ux-pro-max/SKILL.md` e consulta diretamente os CSVs em `.claude/skills/ui-ux-pro-max/data/` (ex.: `data/stacks/nextjs.csv`, `data/ux-guidelines.csv`).
  - **Com Python 3 instalado:**
    ```bash
    python .claude/skills/ui-ux-pro-max/scripts/search.py "education certification exam platform" --design-system -p "CTFL Academy"
    python .claude/skills/ui-ux-pro-max/scripts/search.py "accessibility focus keyboard" --domain ux
    python .claude/skills/ui-ux-pro-max/scripts/search.py "app router suspense" --stack nextjs
    ```
- **Como verificar se está funcionando:**
  ```bash
  ls .claude/skills/ui-ux-pro-max/data .claude/skills/ui-ux-pro-max/data/stacks
  ```
- **Limitações e incompatibilidades:**
  - **Python 3 não está instalado nesta máquina** (`python --version` aciona apenas o atalho da Microsoft Store). Conforme determinação explícita da própria documentação do UI/UX Pro Max (`SKILL.md` linha 331: *"If Python is not installed, do not install it yourself. Stop and ask the user"*), nenhuma instalação global de Python foi executada. Após instalar o Python 3 pelo site oficial ou `winget install Python.Python.3.12`, o script `search.py` passará a funcionar imediatamente.
- **Atualização e remoção:**
  - Atualizar: `cd .tools/ai-cli && npm i ui-ux-pro-max-cli@latest` e atualizar `.claude/skills/ui-ux-pro-max/`.
  - Remover: `rm -rf .claude/skills/ui-ux-pro-max`.

---

### 3.7. Awesome Claude Design (`VoltAgent/awesome-claude-design`)

- **Finalidade:** Catálogo curado de arquivos `DESIGN.md` (hospedados em `https://getdesign.md/`) de marcas e produtos reais (Linear, Stripe, Vercel, Raycast, Supabase, Claude, Notion, Sentry, etc.) para uso como referência de design system em ferramentas como Claude Design (`claude.ai/design`), Google Stitch ou agentes de código.
- **Fonte oficial:** https://github.com/VoltAgent/awesome-claude-design (commit `8f746b5`, licença MIT).
- **Método de instalação:**
  - **Apenas documentado (não instalável como pacote).** O repositório contém unicamente `README.md` e `LICENSE`. Seguindo as diretrizes da tarefa, não foi instalado como dependência da aplicação.
- **Caminho dos arquivos instalados:** Nenhum arquivo de código adicionado à aplicação; documentado nesta seção.
- **Dependências necessárias:** Nenhuma.
- **Como utilizar:**
  1. Consulte o catálogo em https://github.com/VoltAgent/awesome-claude-design (referências recomendadas para o perfil do CTFL Academy: **Linear**, **Raycast**, **Supabase**, **Vercel**, **Stripe** e **Notion**).
  2. Baixe o `DESIGN.md` desejado em `https://getdesign.md/<marca>/design-md` ou extraia um com a extensão **Design MD Chrome** (item 3.9).
  3. Utilize o arquivo no [Claude Design](https://claude.ai/design) (*Create new design system* → *Add assets*) ou salve como referência em `docs/` para orientar ajustes visuais.
- **Como verificar:** Acesso direto ao repositório oficial no GitHub.
- **Limitações:** O serviço web Claude Design (`claude.ai/design`) é externo ao terminal; localmente, arquivos `DESIGN.md` servem como especificação textual para os agentes e skills de design instalados.
- **Atualização e remoção:** Não aplicável (consulta online).

---

### 3.8. Design Motion Principles (`kylezantos/design-motion-principles`)

- **Finalidade:** Skill de design de movimento e interação com dois modos (**Create** e **Audit**) baseados nas lentes de **Emil Kowalski** (contenção e velocidade), **Jakub Krehel** (refinamento de produção) e **Jhey Tompkins** (experimentação criativa), incluindo checklist anti-*AI-slop* e diretrizes rigorosas de acessibilidade e performance.
- **Fonte oficial:** https://github.com/kylezantos/design-motion-principles (commit `4a9ca87`, licença MIT).
- **Método de instalação:**
  - Copiado de `skills/design-motion-principles` para `.claude/skills/design-motion-principles/`.
  - Diretrizes de movimento, acessibilidade (`prefers-reduced-motion`) e ponderação de lentes para o CTFL Academy integradas diretamente ao arquivo `AGENTS.md` na raiz do projeto.
- **Caminho dos arquivos instalados:**
  - `.claude/skills/design-motion-principles/SKILL.md`
  - `.claude/skills/design-motion-principles/workflows/` (`create.md`, `audit.md`)
  - `.claude/skills/design-motion-principles/references/` (`accessibility.md`, `performance.md`, `motion-cookbook.md`, `creation-gotchas.md`, `audit-checklist.md`, `anti-checklist.md`, `emil-kowalski.md`, `jakub-krehel.md`, `jhey-tompkins.md`, `output-format.md`, `demo-shell.html`, `report-template.html`)
  - Regras permanentes no projeto: `AGENTS.md` (seção *Motion & Accessibility*)
- **Dependências necessárias:** Nenhuma. Compatível com CSS puro, Tailwind (`tailwindcss-animate` já instalado no CTFL Academy) e React.
- **Como utilizar:**
  - **Para criar animações:** peça ao agente *"Adicione uma animação de entrada/saída acessível ao modal de resultado do simulado seguindo `design-motion-principles`"*.
  - **Para auditar animações existentes:** peça *"Audite as animações de `src/components/` com a skill `design-motion-principles` (`--terminal`)"*.
- **Como verificar se está funcionando:**
  ```bash
  ls .claude/skills/design-motion-principles/workflows .claude/skills/design-motion-principles/references
  ```
- **Limitações e incompatibilidades:** Nenhuma.
- **Atualização e remoção:**
  - Atualizar: atualizar `.claude/skills/design-motion-principles/` a partir do repositório `kylezantos/design-motion-principles`.
  - Remover: `rm -rf .claude/skills/design-motion-principles` e remover a subseção correspondente em `AGENTS.md`.

---

### 3.9. Design MD Chrome (`bergside/design-md-chrome`)

- **Finalidade:** Extensão do Google Chrome (Manifest V3) — *TypeUI DESIGN.md Extractor* — que inspeciona a aba ativa do navegador, extrai tokens visuais (tipografia, cores, espaçamento, bordas, sombras, movimento) e gera um arquivo `DESIGN.md` ou `SKILL.md` pronto para agentes de IA.
- **Fonte oficial:** https://github.com/bergside/design-md-chrome (`v0.4.0`, commit `8e07614`, licença MIT).
- **Método de instalação:**
  - **Não é uma dependência npm da aplicação.** O código-fonte da extensão foi copiado de forma isolada para `.tools/design-md-chrome/` (pasta ignorada pelo Git em `.gitignore`) e sua suíte de testes automatizados foi executada e aprovada.
  - O carregamento no navegador exige ação manual do usuário na interface gráfica do Google Chrome.
- **Caminho dos arquivos instalados:**
  - `.tools/design-md-chrome/` (`manifest.json`, `service-worker.js`, `content-script.js`, `popup/`, `lib/`, `assets/`, `tests/run-tests.mjs`)
- **Dependências necessárias:** Google Chrome (instalado) para uso da extensão; Node.js para rodar os testes locais da extensão.
- **Como ativar e utilizar no Chrome:**
  1. Abra o Google Chrome e acesse `chrome://extensions`.
  2. Ative a chave **Modo do desenvolvedor** (*Developer mode*) no canto superior direito.
  3. Clique em **Carregar sem compactação** (*Load unpacked*).
  4. Selecione a pasta:
     `C:\Users\Victor\orca\workspaces\CTFL Academy\refatoracao\.tools\design-md-chrome`
  5. Abra qualquer site de referência (ou o próprio `http://localhost:3000`), clique no ícone **DESIGN.md Style Extractor - TypeUI** na barra de extensões e clique em **Generate `DESIGN.md`** ou **Generate `SKILL.md`** → **Download**.
- **Como verificar se os arquivos da extensão estão íntegros:**
  ```bash
  node .tools/design-md-chrome/tests/run-tests.mjs
  ```
  Saída verificada: `All tests passed.`
- **Limitações e incompatibilidades:**
  - O Chrome bloqueia instalação silenciosa de extensões não empacotadas por linha de comando por motivos de segurança; o passo `Load unpacked` em `chrome://extensions` precisa ser feito pelo usuário.
- **Atualização e remoção:**
  - Atualizar: atualizar os arquivos em `.tools/design-md-chrome/` com `git clone https://github.com/bergside/design-md-chrome.git` e clicar no botão de recarregar da extensão em `chrome://extensions`.
  - Remover: remover a extensão em `chrome://extensions` e apagar `.tools/design-md-chrome/`.

---

### 3.10. Orquestração Multiagente Dedicada — CTFL Academy (`ctfl-orquestracao`)

- **Finalidade:** Estrutura nativa de orquestração multiagente no `omp` dedicada exclusivamente ao projeto CTFL Academy, com 5 agentes especializados, comunicação em tempo real (`agent://`, `local://`), 4 modos de operação e estado persistente em `docs/orquestracao/`.
- **Caminho dos arquivos instalados:**
  - **Cinco Agentes Dedicados (`.omp/agents/`):** `po.md`, `scrum-master.md`, `desenvolvedor.md`, `qa.md`, `devops.md` (preservando os 22 agentes de apoio do *Agency Agents*).
  - **Skill e Regras Permanentes:** `.claude/skills/ctfl-orquestracao/SKILL.md`, `.omp/RULES.md` (`RULES@project`) e seção dedicada em `AGENTS.md`.
  - **Comandos Nativos (`.omp/commands/`):** `/planejar`, `/executar`, `/diagnostico`, `/corrigir`, `/equipe`, `/backlog`, `/retomar`.
  - **Persistência e Governança (`docs/orquestracao/` e `docs/CLICKUP_BACKLOG.md`):** `CONTEXTO_PROJETO.md`, `MANUAL_ORQUESTRACAO.md`, `DECISOES_ADR_PDR.md`, `REGISTRO_QA_DEFEITOS.md`, `HISTORICO_EXECUCAO.md` e `PROTOCOLO_RETOMADA.md`.
- **Como utilizar:**
  - Use `/planejar`, `/executar <tarefa>`, `/diagnostico [escopo]`, `/corrigir <bug>`, `/backlog` ou `/retomar`, ou solicite diretamente em linguagem natural no chat do `omp`.
