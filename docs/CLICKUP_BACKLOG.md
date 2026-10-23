# BACKLOG CANÔNICO DO PROJETO CTFL ACADEMY (PADRÃO CLICKUP)
**Versão:** 1.0.1 | **Gerenciado por:** Scrum Master & Orquestrador da Equipe Multiagente  
**Repositório:** `https://github.com/QA-VictorValente/CTFL-Academy`  
**Referência Metodológica:** Seção 3 do Script Mestre da Equipe Multiagente

---

## 1. ESTRUTURA DO WORKFLOW NO CLICKUP

Os status padrão adotados para o fluxo de valor do CTFL Academy são:

1. **Backlog:** Tarefas levantadas aguardando refinamento.
2. **A analisar:** Sob análise inicial do PO ou arquiteto.
3. **Refinamento:** Definição detalhada de regras e critérios de aceite.
4. **Pronto para desenvolvimento:** Requisitos fechados e dependências liberadas.
5. **Em desenvolvimento:** Implementação pelo Desenvolvedor.
6. **Em revisão de código:** Revisão estática e análise de diff.
7. **Em QA:** Validação funcional independente pelo QA Engineer.
8. **Correção necessária:** Defeito identificado com evidências anexas.
9. **Reteste:** Verificação da correção da causa raiz.
10. **Aguardando aprovação:** Validação executiva do PO/Orquestrador.
11. **Pronto para implantação:** Build e testes do CI 100% verdes.
12. **Em implantação:** Execução de migração ou deploy.
13. **Concluído:** Em produção/homologação com smoke tests aprovados.
14. **Bloqueado:** Impedimento técnico ou dependência externa documentada.

---

## 2. SPRINT 1 — GOVERNANÇA, EXPANSÃO DE QUALIDADE & BANCO DE QUESTÕES (100% CONCLUÍDA / ZERADA — 5/5 CARDS)

### [CTFL-101] Governança de Versionamento, Estratégia de Branches e PR Template
- **Tipo:** Tarefa / DevOps
- **Status:** Concluído
- **Prioridade:** Alta
- **Responsável:** DevOps Engineer
- **Contexto e Justificativa:** O projeto necessita de rastreabilidade formal e proteção contra commits diretos desavisados na branch principal, além de padronizar a submissão de Pull Requests com checklist de qualidade.
- **Comportamento Atual:** Fluxo padronizado estabelecido na branch `feature/ciclo-1-governanca-qualidade`, com template de PR e rastreabilidade por commits semânticos.
- **Comportamento Esperado:** Fluxo padronizado baseado em branches `feature/*`, `fix/*` e `chore/*`, com template de PR exigindo evidências de testes do Quality Gate.
- **Critérios de Aceitação:**
  1. Criação do template de Pull Request em `.github/pull_request_template.md`. (Atendido)
  2. Documentação da estratégia de branches e convenção de commits convencionais (`feat:`, `fix:`, `test:`, `ci:`). (Atendido)
  3. Todas as modificações anteriores do pipeline integradas e versionadas com mensagens semânticas. (Atendido)
- **Evidências:** Commit `e9d17ae` e template em `.github/pull_request_template.md`.
- **Testes Relacionados:** Verificação de status do Git e execução de `npm run pipeline`.
- **Dependências / Bloqueios:** Nenhum bloqueio.

---

### [CTFL-102] Expansão do Banco de Questões Oficiais CTFL v4.0.1 (K1, K2 e K3)
- **Tipo:** Feature / Conteúdo Educacional
- **Status:** Concluído
- **Prioridade:** Alta
- **Responsável:** Product Owner & Desenvolvedor de Software
- **Contexto e Justificativa:** O banco continha 55 questões publicadas. Para um exame padrão de 40 questões, realizar 2 simulados consecutivos gerava sobreposição excessiva de questões para o estudante.
- **Comportamento Atual:** 80 questões persistidas (78 publicadas e 2 em moderação), garantindo ampla variabilidade para exames consecutivos de 40 questões.
- **Comportamento Esperado:** Inclusão de 25 novas questões originais de alta fidelidade técnica cobrindo todos os capítulos (Capítulos 1 ao 6) e objetivos de aprendizagem (K1, K2, K3), elevando o total do banco para 80 questões.
- **Critérios de Aceitação:**
  1. Cada questão deve possuir código único (`Q-CTFL-xxx`), objetivo de aprendizagem (`FL-x.x.x`), nível cognitivo (`K1`, `K2`, `K3`) e dificuldade. (Atendido)
  2. 4 alternativas (A, B, C, D) com exatamente 1 alternativa correta. (Atendido)
  3. Cada uma das 4 opções deve conter justificativa didática individual explicando por que está certa ou errada. (Atendido)
  4. Explicação geral consolidada com referência direta à seção do Syllabus CTFL v4.0.1. (Atendido)
  5. Carga via seed idempotente sem duplicações (`npm run db:seed`). (Atendido - 80 questões ativas)
- **Evidências:** Commit `e19b257`, fixture `prisma/fixtures/questions-ch-expansion.ts` e log do seed.
- **Testes Relacionados:** `tests/integration/persistence-workflows.test.ts` e `tests/api/exercises.api.spec.ts`.
- **Dependências / Bloqueios:** Nenhum bloqueio.

---

### [CTFL-103] Consolidação do Quality Gate de 7 Estágios na Pipeline de CI
- **Tipo:** Tarefa / QA & DevOps
- **Status:** Concluído
- **Prioridade:** Alta
- **Responsável:** QA Engineer & DevOps Engineer
- **Contexto e Justificativa:** Garantir que nenhuma alteração possa ser mesclada na aplicação caso algum teste unitário, de API, de interface (E2E) ou de desempenho (k6) falhe.
- **Comportamento Atual:** Pipeline estrita executável via `npm run pipeline` validada com 100% de sucesso nas 7 etapas (98.7s).
- **Comportamento Esperado:** Pipeline executável via `npm run pipeline` cobrindo estritamente: ESLint, TypeScript Typecheck, Vitest Unit, Vitest Integration, Playwright API, Playwright Web E2E e k6 Smoke Test.
- **Critérios de Aceitação:**
  1. Script `scripts/run-pipeline.ts` executável com sucesso em ambiente Windows e CI. (Atendido)
  2. Falha em qualquer etapa deve abortar o processo com código de saída != 0. (Atendido)
  3. Sucesso completo em todas as etapas exibe relatório consolidado com resumo de métricas. (Atendido)
- **Evidências:** Commit `ee2ff48` e log terminal da execução do Quality Gate.
- **Testes Relacionados:** Todos os testes das suítes de `tests/`.
- **Dependências / Bloqueios:** Nenhum bloqueio.

---

### [CTFL-104] Suíte de Testes de Carga e Estresse para Submissão Concorrente
- **Tipo:** Tarefa / QA
- **Status:** Concluído
- **Prioridade:** Normal
- **Responsável:** QA Engineer & Desenvolvedor
- **Contexto e Justificativa:** Validar a resiliência do backend quando múltiplos alunos submetem respostas de simulado e anotações simultaneamente.
- **Comportamento Atual:** Scripts k6 de carga (`tests/performance/load.k6.js`) e estresse (`tests/performance/stress.k6.js`) executando 20 a 50 usuários virtuais concorrentes (VUs) com thresholds estritos de $p(95) < 200\text{ms}$, $p(99) < 400\text{ms}$ e taxa de falhas $< 1\%$.
- **Critérios de Aceitação:**
  1. Script `load.k6.js` com estágios escalonados de 20 a 50 VUs cobrindo navegação pública, catálogo de capítulos, exercícios e auth. (Atendido)
  2. Script `stress.k6.js` com estágios até 50 VUs e thresholds $p(95) < 300\text{ms}$. (Atendido)
  3. Thresholds calibrados em `k6.config.js` e validação homologada pelo QA. (Atendido)
- **Evidências:** Homologação do `QASprintAuditor` em `local://outbox-qa.md` e typecheck 100% verde.
- **Testes Relacionados:** `tests/performance/load.k6.js`, `tests/performance/stress.k6.js` e `npm run typecheck`.
- **Dependências / Bloqueios:** Nenhum bloqueio.

---

### [CTFL-105] Aprimoramento da Síntese de Áudio com Fallback de Vozes e Orientação de Vozes Neurais
- **Tipo:** Feature / UX
- **Status:** Concluído
- **Prioridade:** Alta
- **Responsável:** Desenvolvedor de Software & QA
- **Contexto e Justificativa:** A leitura em áudio depende da Web Speech API do navegador. Em navegadores padrão no Windows, vozes robóticas antigas eram frequentemente selecionadas por engano, gerando uma experiência desconfortável para o aluno.
- **Comportamento Atual:** Seletor com ordenação inteligente priorizando vozes neurais de estúdio (Edge Natural e Google Português) no topo, vozes robóticas isoladas no fim com rótulo `[Desktop]`, modal educativo `💡 Vozes HD Grátis` integrado e persistência em `localStorage`.
- **Comportamento Esperado:**
  1. Ordenação inteligente colocando vozes naturais (Edge Natural, Google português, Windows Natural) no topo e vozes antigas no fim com rótulo descritivo. (Atendido)
  2. Botão/modal integrado de ajuda pedagógica ("💡 Dicas de Vozes Humanas Gratuitas") com instruções práticas para Edge, Chrome e Windows. (Atendido)
  3. Persistência da preferência no `localStorage`. (Atendido)
- **Critérios de Aceitação:**
  1. O seletor de vozes exibe badges visuais claras (✨ Natural HD, 🌸 Feminina Calma, 🌐 Google Online, 🖥️ Desktop). (Atendido)
  2. Modal informativo abre e fecha sem quebrar a leitura nem interferir no layout fixo. (Atendido)
  3. Preferência de voz persiste entre trocas de página. (Atendido)
  4. Suíte de testes unitários e de interface valida a ausência de regressões. (Atendido)
- **Evidências:** Commit rastreável e validação com 100% de aprovação no Vitest, Playwright e k6.
- **Testes Relacionados:** `tests/web/student-journey.web.spec.ts`, `npm run typecheck` e `npm run lint`.
- **Dependências / Bloqueios:** Nenhum bloqueio.

---

## 2.1. BACKLOG CANDIDATO (SPRINT 2) — OPORTUNIDADES LEVANTADAS PELA EQUIPE MULTIAGENTE (`EXEC-2026-10-22-01`)

### [CTFL-106] Sincronização Canônica de Documentação (+30 XP, Matriz Cap. 4 = 12, Banco de 80 Questões e Prefixo `LESSON:`)
- **Tipo:** Tarefa / Qualidade & Documentação (Quick Win)
- **Status:** Concluído
- **Prioridade:** Alta
- **Esforço Estimado:** P (Pequeno)
- **Responsável:** Product Owner, QA Engineer & Desenvolvedor
- **Contexto e Justificativa:** Auditoria cruzada (`DOC-QA-01`, `DOC-QA-02`, `DOC-QA-03`) identificou divergências entre `docs/ROTEIRO_DE_TESTES_QA.md` (`+20 XP` na linha 86 vs `+30 XP` reais; `Cap. 4 = 11 questões` na linha 73 vs `12` oficiais), referências legadas a `55 questões` em `README.md:49` e `docs/DIREITOS_E_FONTES.md:10` (pós-`CTFL-102` são `80 questões`) e capitalização `lesson:` vs `LESSON:` em `src/backend/services/lesson.service.ts:83`.
- **Critérios de Aceitação:**
  1. Atualizar `docs/ROTEIRO_DE_TESTES_QA.md:86` (`CT-10.2`) para `+30 XP` e `docs/ROTEIRO_DE_TESTES_QA.md:73` (`CT-08.1`) para `Cap. 4 = 12 questões`. (Atendido)
  2. Atualizar `README.md:49` e `docs/DIREITOS_E_FONTES.md:10` de `55` para `80 questões`. (Atendido)
  3. Alinhar o prefixo de `idempotencyKey` entre `src/backend/services/lesson.service.ts:83` e `docs/CRITERIOS_XP.md:9` para `LESSON:`. (Atendido)
- **Evidências:** Homologação de QA em `local://outbox-qa.md`, 26 testes aprovados no Vitest e `npm run typecheck` sem erros.
- **Testes Relacionados:** `tests/unit/domain-logic.test.ts` e `tests/integration/persistence-workflows.test.ts`.
- **Dependências / Bloqueios:** Nenhum bloqueio.
---

### [CTFL-107] Evolução do Caderno de Erros (`/revisao-erros`): Status "Pendente vs. Superado", Filtros K1/K2/K3 e Reteste Rápido
- **Tipo:** Feature / Produto & Estudo
- **Status:** A analisar
- **Prioridade:** Alta
- **Esforço Estimado:** M (Médio)
- **Responsável:** Product Owner & Desenvolvedor de Software
- **Contexto e Justificativa:** Atualmente `/revisao-erros` lista estaticamente todas as respostas erradas passadas, mesmo quando o estudante já acertou a questão posteriormente, desalinhando-se do caso `CT-17.2` (`docs/ROTEIRO_DE_TESTES_QA.md:125`).
- **Critérios de Aceitação:**
  1. Separar questões em **Pendentes** (última tentativa incorreta) e **Superadas** (acertada em tentativa posterior).
  2. Adicionar filtros combináveis por Status, Capítulo (`1` a `6`), Nível Cognitivo (`K1`, `K2`, `K3`) e Objetivo de Aprendizagem (`FL-x.x.x`).
  3. Permitir retestar a questão ocultando o gabarito antes da submissão, preservando o sigilo de tentativas `IN_PROGRESS` e respeitando `prefers-reduced-motion`.

---

### [CTFL-108] Exportação e Portabilidade do Caderno de Notas e Flashcards (`.md` / `.json`)
- **Tipo:** Feature / UX & Retenção
- **Status:** Backlog
- **Prioridade:** Normal
- **Esforço Estimado:** P/M (Pequeno a Médio)
- **Responsável:** Desenvolvedor de Software & QA Engineer
- **Contexto e Justificativa:** Permitir ao estudante exportar suas anotações de estudo (`/caderno`) e flashcards (`/flashcards`) organizados por Capítulo e Tópico (`1.1` a `6.2`) do Syllabus v4.0.1 para revisão offline.
- **Critérios de Aceitação:**
  1. Exportação em Markdown (`.md`) e JSON restrita estritamente aos registros `{ userId: user.id, deletedAt: null }`.
  2. Testes unitários cobrindo a formatação e isolamento de dados por estudante.

---

### [CTFL-109] Padronização Completa de Thin Route Handlers (4 Fatias), Clientes `@frontend/api-clients` e Hardening de CI/Auth
- **Tipo:** Tarefa Técnica / Arquitetura & DevOps (Derivada de `PROP-002` e `PROP-003`)
- **Status:** A analisar
- **Prioridade:** Normal
- **Esforço Estimado:** M (Médio — Fatiado em 4 entregas atômicas)
- **Responsável:** Desenvolvedor de Software & DevOps Engineer
- **Contexto e Justificativa:** Consenso técnico firmado no debate entre `AgenteDesenvolvedor` e `AgenteDevOps` (`#COM-004` e `#COM-005` em `docs/orquestracao/BARRAMENTO_COMUNICACAO.md`): fatiar a padronização arquitetural e o hardening de CI/Auth em 4 fatias independentes sem quebrar `next build` nem o CI.
- **Critérios de Aceitação (Fatiamento Acordado):**
  1. **Fatia 0 (CI & Config Playwright — `devops`):** Configurar projeto `e2e` dedicado (`testDir: './tests/e2e'`) em `playwright.config.ts` e ajustar `"test:e2e": "playwright test --project=e2e"` em `package.json:36`, eliminando a reexecução duplicada dos projetos `api` e `web` no Step 14 do GitHub Actions (`.github/workflows/ci.yml:85-86`).
  2. **Fatia A (Domínio de Simulados — `desenvolvedor`):** Extrair `src/backend/controllers/exam.controller.ts` + criar `src/frontend/api-clients/exams.api.ts`, convertendo as 4 rotas de `src/app/api/exams/**` em *Thin Route Handlers* (`ADR-001`).
  3. **Fatia B (Autenticação, Perfil e *Lazy Fail-Fast* de `AUTH_SECRET` — `desenvolvedor` + `devops`):** Extrair `auth.controller.ts` e `profile.controller.ts` e implementar validação *lazy fail-fast* de `AUTH_SECRET` dentro de `getAuthSecret()` (`src/backend/services/auth.service.ts:16`, verificando `process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build'`) para impedir fallback inseguro em runtime sem quebrar o `next build` estático.
  4. **Fatia C (Administração e Curadoria — `desenvolvedor`):** Extrair controllers de `src/app/api/admin/**` (8 rotas) e conectar componentes restantes aos clientes tipados de `@frontend/api-clients/*`.

---

### [CTFL-110] Blindagem de Segurança (Anti-Side-Channel), Concorrência (CAS) e Batching SQL no Motor de Simulados
- **Tipo:** Segurança & Confiabilidade Crítica (Derivada de `PROP-006` — Iniciativa Espontânea `AgenteQA` + `AgenteDesenvolvedor`)
- **Status:** A analisar
- **Prioridade:** Alta / Crítica
- **Esforço Estimado:** P/M (Pequeno a Médio)
- **Responsável:** Desenvolvedor de Software & QA Engineer
- **Contexto e Justificativa:** Investigação espontânea entre `AgenteQA` e `AgenteDesenvolvedor` (`#COM-006` e `#COM-007` em `docs/orquestracao/BARRAMENTO_COMUNICACAO.md`) identificou 3 riscos reais no motor de simulados (`RISCO-SIM-01`, `RISCO-SIM-02`, `RISCO-SIM-03`): vazamento indireto de gabarito via contadores de `/dashboard` e `/progresso` durante prova `IN_PROGRESS`, condição de corrida TOCTOU (`P2002`) entre auto-submit por expiração e submit manual, e ~84 queries sequenciais na transação de finalização.
- **Critérios de Aceitação:**
  1. **Correção de `RISCO-SIM-01` (Sigilo Absoluto em `IN_PROGRESS`):** Em `POST /api/exams/[id]/answer` (`src/app/api/exams/[id]/answer/route.ts:90-109`), gravar `isCorrect: false` provisório enquanto `ExamAttempt.status === 'IN_PROGRESS'` (calculando o `isCorrect` definitivo apenas na finalização em `exam.service.ts`) e filtrar `examAttempt: { status: { not: 'IN_PROGRESS' } }` nas agregações de `/dashboard` e `/progresso`.
  2. **Correção de `RISCO-SIM-02` (Idempotência Concorrente / CAS):** Em `finalizeExamAttemptIdempotent` (`src/backend/services/exam.service.ts`), aplicar trava atômica *Compare-And-Swap* (`updateMany` com `where: { id: attemptId, status: 'IN_PROGRESS' }`) ou `tx.xPEvent.upsert` para garantir `0%` de erro `P2002` sob submissões paralelas.
  3. **Correção de `RISCO-SIM-03` (Snapshot Imutável e Batching SQL):** Priorizar `attempt.configSnapshot.passingScore` sobre `attempt.configuration` e substituir os dois loops `for (... await tx.userAnswer...)` por operações em lote (`createMany` + `updateMany`), reduzindo de ~84 para $\le 4$ round-trips SQL na transação.
  4. Cobertura de testes automatizados (unitários e integração/API) validando sigilo de gabarito em `IN_PROGRESS` e submissão concorrente idempotente.

---

### [CTFL-111] Reformulação Visual Anti-Slop e Conforto de Leitura (Light & Dark Mode) com as 3 Skills de Design
- **Tipo:** Épica / UI-UX & Frontend Architecture (`design-taste-frontend` + `ui-ux-pro-max` + `design-motion-principles`)
- **Status:** Concluído
- **Prioridade:** Alta
- **Esforço Estimado:** M/G (Fatiado em 4 entregas atômicas seguras: `CTFL-111A` a `CTFL-111D`)
- **Responsável:** Product Owner (`po`), Desenvolvedor (`desenvolvedor`), QA Engineer (`qa`) & DevOps (`devops`)
- **Contexto e Justificativa:** Auditoria quantitativa com `design-taste-frontend/scripts/lint.mjs` em 102 arquivos de interface identificou **`412 FAIL e 57 WARN`** (`41 arquivos` com classes hardcoded `indigo-*`/`violet-*`, gradientes `from-indigo-600 to-violet-600`, `bg-clip-text`, `Sparkles` eyebrows, quadrados coloridos em arco-íris no `StatCard`, `animate-pulse` no cronômetro do simulado e falhas de contraste no Tema Claro como `selection:text-indigo-200` e banner escuro `from-indigo-950/60` em `dashboard/page.tsx:147`).
- **Fatiamento Operacional Acordado (`CTFL-111A` a `CTFL-111D`):**
  1. **`[CTFL-111A]` Fundação de Tokens Semânticos (Light & Dark), Tipografia e Acessibilidade (`Esforço P`):** Refatorar `src/app/globals.css` e `tailwind.config.ts` substituindo o par `indigo/violet` pela direção escolhida pelo usuário (Light em papel editorial suave sem ofuscamento; Dark em grafite/carbono neutro sem azul-marinho/neon), corrigindo `selection`/`focus-visible` e adicionando `@media (prefers-reduced-motion: reduce)` + `.tabular-nums`.
  2. **`[CTFL-111B]` Primitivos de UI (`src/components/ui/*`) e Moldura (`src/components/layout/*`) (`Esforço M`):** Remover gradientes e `transition-all` de `button.tsx`, transformar `stat-card.tsx` em indicador tipográfico limpo (`tabular-nums`, sem caixas coloridas em arco-íris), ajustar `app-shell.tsx` / `public-header.tsx` para superfícies neutras com contraste WCAG 2.2 AA em Light/Dark e aplicar lente Jakub Krehel em modais/toasts (`180ms` enter / `120ms` exit).
  3. **`[CTFL-111C]` Landing Page Pública (`src/app/page.tsx`) e Páginas de Auth (`login`, `cadastro`, `recuperar-senha`, `sobre`) (`Esforço M`):** Zerar os 27 `FAIL` de `src/app/page.tsx`, remover *eyebrow pills* e texto em gradiente, usar `min-h-dvh` e destacar a Matriz Oficial CTFL v4.0.1 (`data-ui`).
  4. **`[CTFL-111D]` Telas de Estudo, Simulado Cronometrado e Console Admin (`Esforço M/G`):** Aplicar lente Emil Kowalski em `exam-runner.tsx`, `lesson-viewer.tsx`, `exercises-hub.tsx` e `flashcards-study.tsx` (zero animação distrativa em prova, remoção de `animate-pulse` do timer, substituição de emojis estruturais por SVG `lucide-react` e medida de leitura `60ch–72ch`).
- **Critérios de Aceitação e Guardrails E2E:**
  1. Temas Claro e Escuro preservados e calibrados com contraste WCAG 2.2 AA ($\ge 4.5:1$ para texto normal e $\ge 3:1$ para bordas/controles).
  2. Zeramento dos `FAIL` do `design-taste-frontend/scripts/lint.mjs` (`[purple]`, `[gradient]`, `[gradient-text]`, `[emoji]`, `[shadow]`, `[micro-label]`, `[mono]`) nos arquivos do escopo.
  3. Preservação estrita de 100% dos seletores E2E mapeados pelo `AgenteQA` (incluindo `button:has(> span:text-is("A"))`, `#fullName`, `#email`, `#password`, `#custom-count`, `#floating-notebook-btn` e headings/botões verificados pelo Playwright).
  4. `npm run typecheck`, `npm run lint` e suítes Vitest/Playwright 100% aprovados.
- **Evidências de Execução (`EXEC-2026-10-22-03`):**
  - `lint.mjs`: Redução de `412 FAIL, 57 WARN` para **`0 FAIL, 1 WARN`** em todos os 102 arquivos de `src/app` e `src/components`.
  - `typecheck`: `tsc --noEmit` aprovado com 0 erros.
  - `lint`: `next lint` aprovado com `✔ No ESLint warnings or errors`.
  - `prisma`: `npx prisma validate` aprovado com schema válido (22 modelos).
  - `vitest`: `26/26` testes aprovados (5 suítes unitárias e de controllers).
  - `next build`: Build de produção concluído com sucesso (`47/47` páginas estáticas geradas).
  - `CI/CD`: Gate `npm run lint:ui`, concorrência cancel-in-progress, upload-artifact no GitHub Actions e `pipeline:fast` implementados.
  - `trail build`: Grafo de contexto atualizado com 591 nós e 1460 arestas.
---

## 3. MATRIZ DE RASTREABILIDADE

| ID Tarefa | Tipo | Responsável | Status | Branch | PR Associado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CTFL-101** | Governança | DevOps | Concluído | `feature/ciclo-1-governanca-qualidade` | Mergeado na main |
| **CTFL-102** | Conteúdo/Dev | PO / Dev | Concluído | `feature/ciclo-1-governanca-qualidade` | Mergeado na main |
| **CTFL-103** | QA/CI | QA / DevOps | Concluído | `feature/ciclo-1-governanca-qualidade` | Mergeado na main |
| **CTFL-104** | Performance | QA / Dev | Concluído | `refatoracao` | - |
| **CTFL-105** | UX/Frontend | Dev | Concluído | `feature/ctfl-105-audio-voices` | Mergeado na main |
| **CTFL-106** | Qualidade/Docs | PO / QA / Dev | Concluído | `refatoracao` | - |
| **CTFL-107** | Feature/Estudo | PO / Dev | A analisar | - | - |
| **CTFL-108** | UX/Portabilidade | Dev / QA | Backlog | - | - |
| **CTFL-109** | Arquitetura/CI | Dev / DevOps | A analisar | - | - |
| **CTFL-110** | Segurança/Simulado | Dev / QA | A analisar | - | - |
| **CTFL-111** | UI-UX/Frontend | PO / Dev / QA / DevOps | Concluído | `refatoracao` | - |
