# Registro de Qualidade (QA), Defeitos e Bloqueios — CTFL Academy

**Mantido por:** Engenheiro de QA (`qa`) & Scrum Master (`scrum-master`)  
**Objetivo:** Rastrear execuções reais de testes, status do Quality Gate, defeitos encontrados (`BUG-xxx`), evidências de reprodução/reteste e bloqueios técnicos.

---

## 1. Regras de Registro do QA

1. **Classificação Obrigatória de Testes:**
   - `✅ APROVADOS`: Testes executados no ambiente atual com saída verificada.
   - `❌ REPROVADOS`: Testes executados que apresentaram falha.
   - `⚠️ BLOQUEADOS`: Testes que não puderam rodar por impedimento de ambiente/dependência (documentar causa exata).
   - `⏭️ NÃO EXECUTADOS`: Testes fora do escopo da tarefa atual.
2. **Ciclo de Vida de um Defeito (`BUG-xxx`):**
   - `ABERTO` $\rightarrow$ `EM CORREÇÃO (DEV)` $\rightarrow$ `AGUARDANDO RETESTE (QA)` $\rightarrow$ `VALIDADO / FECHADO` (ou `REABERTO`).

---

## 2. Histórico Recente do Quality Gate do Projeto

| Data | Escopo / Tarefa | Unit & Integ. (Vitest) | Typecheck & Lint | API & Web E2E (Playwright) | Performance (k6) | Veredito QA |
|---|---|---|---|---|---|---|
| Ciclo 1 | `CTFL-101` a `CTFL-103` e `CTFL-105` | ✅ Aprovado (30 testes) | ✅ Aprovado (`tsc --noEmit` + `next lint`) | ✅ Aprovado (20 API + 5 Web E2E) | ✅ Aprovado (`smoke.k6.js`) | **APROVADO COM EVIDÊNCIAS** |
| 2026-10-22 | `EXEC-2026-10-22-01` — Validação da Orquestração Multiagente (Fase 6) | ✅ **26 aprovados** (`22` unit + `4` API ctrl) / ❌ **0 reprovados** / ⚠️ **4 bloqueados** (DB read-only) | ✅ **Aprovado** (`tsc --noEmit` + `next lint` + `prisma validate`) | ⏭️ **Não executado** (28 specs — escopo Diagnóstico) | ⏭️ **Não executado** (3 scripts k6 — escopo Diagnóstico) | **APROVADO COM RESSALVAS** |

---

## 3. Registro de Defeitos (`BUG-xxx`)

> Template obrigatório para abertura de novos defeitos pelo agente `qa`:
> - **ID:** `BUG-XXX` | **Data:** `YYYY-MM-DD` | **Status:** `ABERTO` | `EM CORREÇÃO` | `AGUARDANDO RETESTE` | `VALIDADO / FECHADO`
> - **Severidade:** `Crítica` | `Alta` | `Média` | `Baixa` | **Prioridade:** `Alta` | `Média` | `Baixa`
> - **Tarefa Relacionada:** `CTFL-XXX`
> - **Ambiente:** (SO, Node, Banco, Branch)
> - **Passos para Reprodução:** (1, 2, 3...)
> - **Resultado Esperado:** (...)
> - **Resultado Obtido:** (...)
> - **Evidências / Logs / Arquivos Afetados:** (...)
> - **Resolução e Reteste do QA:** (...)

### Defeitos Ativos
- *Nenhum defeito funcional ativo em código de produção no momento.*

### Achados Preventivos de Qualidade e Documentação (Shift-Left QA — `EXEC-2026-10-22-01`)
- **`[DOC-QA-01]` Divergência de XP no Caso de Teste `CT-10.2` (`+20 XP` vs `+30 XP`)**
  - **Severidade:** Baixa | **Prioridade:** Alta | **Tarefa Associada:** `CTFL-106` | **Status:** `ABERTO`
  - **Evidência:** `docs/ROTEIRO_DE_TESTES_QA.md:86` especifica `+20 XP` ao concluir aula, enquanto `docs/CRITERIOS_XP.md:9`, `src/shared/constants/gamification.constants.ts:2` (`LESSON_COMPLETED: 30`) e `src/backend/services/lesson.service.ts:82` concedem **`+30 XP`**.
- **`[DOC-QA-02]` Divergência de Peso do Capítulo 4 no Caso de Teste `CT-08.1` (`11` vs `12` questões)**
  - **Severidade:** Baixa | **Prioridade:** Alta | **Tarefa Associada:** `CTFL-106` | **Status:** `ABERTO`
  - **Evidência:** `docs/ROTEIRO_DE_TESTES_QA.md:73` cita `Cap. 4 = 11 questões`, enquanto a matriz oficial do Syllabus ISTQB® CTFL v4.0.1 (`docs/REGRAS_SIMULADOS.md:15` e `src/shared/constants/ctfl.constants.ts:14`) define **12 questões** (`8 + 6 + 4 + 12 + 8 + 2 = 40`).
- **`[DOC-QA-03]` Divergência de Capitalização no Prefixo de `idempotencyKey` (`lesson:` vs `LESSON:`)**
  - **Severidade:** Baixa | **Prioridade:** Média | **Tarefa Associada:** `CTFL-106` | **Status:** `ABERTO`
  - **Evidência:** `src/backend/services/lesson.service.ts:83` grava `lesson:${userId}:${lesson.id}` (minúsculas), enquanto `docs/CRITERIOS_XP.md:9` e `tests/integration/persistence-workflows.test.ts:138` utilizam o prefixo `LESSON:` (maiúsculas).

- **`[RISCO-SIM-01]` *Side-Channel Answer Key Oracle* durante Simulado `IN_PROGRESS` (`POST /api/exams/[id]/answer`)**
  - **Severidade:** Alta | **Prioridade:** Crítica / Alta | **Tarefa Associada:** `CTFL-110` (`PROP-006`) | **Status:** `ABERTO`
  - **Evidência (`AgenteQA` + `AgenteDesenvolvedor`):** `src/app/api/exams/[id]/answer/route.ts:90-109` avalia e grava `isCorrect: isCorrect` real na tabela `UserAnswer` enquanto `ExamAttempt.status === 'IN_PROGRESS'`. Embora o response HTTP oculte o campo, as páginas `/dashboard` (`src/app/(student)/dashboard/page.tsx:58`) e `/progresso` (`src/app/(student)/progresso/page.tsx:16`) agregam `prisma.userAnswer.count({ where: { userId, isCorrect: true } })` sem filtrar `examAttempt.status !== 'IN_PROGRESS'`, permitindo inferir o gabarito em tempo real a cada clique.
- **`[RISCO-SIM-02]` Condição de Corrida TOCTOU (`P2002`) na Finalização Concorrente de Simulado (`finalizeExamAttemptIdempotent`)**
  - **Severidade:** Alta | **Prioridade:** Alta | **Tarefa Associada:** `CTFL-110` (`PROP-006`) | **Status:** `ABERTO`
  - **Evidência (`AgenteQA` + `AgenteDesenvolvedor`):** Em `src/backend/services/exam.service.ts:12-63, 191-211`, quando o auto-submit por expiração (`GET /api/exams/[id]`) e o submit manual (`POST /api/exams/[id]/submit`) ocorrem em paralelo sob `READ COMMITTED`, ambas as transações passam pelo check `attempt.status === 'IN_PROGRESS'` e tentam inserir `XPEvent` com a mesma `idempotencyKey` (`EXAM_COMPLETE:${userId}:${attemptId}`), causando erro `P2002 Unique constraint failed` e `HTTP 500` na segunda requisição.
- **`[RISCO-SIM-03]` Uso de `attempt.configuration` Mutável em vez de `configSnapshot` e Loop Sequencial (~84 Queries) na Transação de Submit**
  - **Severidade:** Média | **Prioridade:** Alta | **Tarefa Associada:** `CTFL-110` (`PROP-006`) | **Status:** `ABERTO`
  - **Evidência (`AgenteQA` + `AgenteDesenvolvedor`):** Em `src/backend/services/exam.service.ts:35-100`, o cálculo de `passingScore` lê `attempt.configuration.passingScore` ao vivo em vez do snapshot imutável `attempt.configSnapshot`, e executa até 84 queries sequenciais dentro da transação interativa (40 `tx.userAnswer.update` em loop + 40 `tx.userAnswer.create` em loop), elevando o risco de timeout `P2028` (`5000ms`) sob carga concorrente de 20–50 VUs (`CTFL-104`).
### Defeitos Históricos Resolvidos
- **[BUG-001] Seleção acidental de vozes SAPI5 robóticas na leitura de aulas no Windows (`CTFL-105`)**
  - **Status:** `VALIDADO / FECHADO` (Commit `73c2892` / Merge `2454880`)
  - **Severidade:** Média | **Prioridade:** Alta
  - **Resultado Esperado:** Priorizar vozes neurais naturais (Edge Natural / Google PT-BR) e orientar o estudante.
  - **Resolução e Reteste:** Implementada ordenação inteligente com badges visuais, isolamento de vozes `[Desktop]` no fim da lista, persistência em `localStorage` e modal educativo `💡 Vozes HD Grátis`. Validado com Vitest e Playwright.

---

## 4. Registro de Bloqueios e Limitações de Ambiente Conhecidas

| ID | Descrição do Bloqueio / Limitação | Impacto | Mitigação / Ação Recomendada | Status |
|---|---|---|---|---|
| `BLK-ENV-01` | Python 3 nativo e Visual Studio C++ Build Tools ausentes na estação Windows atual (`docs/ai-tools-setup.md`). | Scripts opcionais em Python (`ui-ux-pro-max/scripts/search.py`) e compilação `node-gyp` nativa não rodam diretamente. | Utilizar parsers WASM do Trail (`--ignore-scripts`), Node.js `v20.20.2` para scripts e consultar bases CSV do `ui-ux-pro-max` via `read`/`grep`. | **Mitigado** |
| `BLK-ENV-02` | Suítes de integração (`tests/integration`), E2E (`playwright`) e `k6` dependem de instância PostgreSQL ativa na porta `5432` e servidor Next.js em `localhost:3000`. | Se o banco ou servidor não estiverem iniciados antes do teste, os testes de integração/E2E falham por conexão recusada (`ECONNREFUSED`). | O `qa` e o `devops` devem verificar a disponibilidade da porta `5432`/`3000` (e iniciar `npm run db:local` quando autorizado no escopo de teste) ou classificar como `⚠️ BLOQUEADO` caso o escopo proíba subir serviços. | **Monitorado** |
| `BLK-ENV-03` | Worktree secundária (`C:/Users/Victor/orca/workspaces/CTFL Academy/refatoracao`) não possui `node_modules` nem `.env` locais (ignorados pelo `.gitignore`), enquanto a worktree principal (`C:/Users/Victor/Documents/CTFL Academy`, mesmo commit `2454880`) possui `node_modules` completo. | Comandos executados diretamente na worktree secundária sem apontar para a principal falham ao resolver binários locais (`tsc`, `vitest`, `@prisma/client`). | Na validação diagnóstica, `qa` e `devops` executaram `npm run typecheck`, `npm run lint`, `npx prisma validate` e `npx vitest run` na worktree principal (`2454880`) com **100% de aprovação**. Para desenvolvimento em worktree secundária, criar junction (`mklink /J node_modules`) ou rodar `npm ci`. | **Mitigado** |

---

## 5. Detalhamento da Execução de Testes — `EXEC-2026-10-22-01` (Fase 6)

- **✅ Aprovados (26 testes em 5 suítes Vitest, 0 falhas):**
  - `tests/unit/domain-logic.test.ts` (11 testes aprovados — 13ms)
  - `tests/unit/backend/services.test.ts` (4 testes aprovados — 3ms)
  - `tests/unit/frontend/api-clients.test.ts` (4 testes aprovados — 4ms)
  - `tests/unit/frontend/formatters.test.ts` (3 testes aprovados — 35ms)
  - `tests/api/api-controllers.test.ts` (4 testes aprovados — 12ms)
- **❌ Reprovados:** `0`
- **⚠️ Bloqueados:** `4` testes em `tests/integration/persistence-workflows.test.ts` (`BLK-ENV-02` + restrição somente-leitura no banco durante o Modo Diagnóstico) e execução direta na worktree secundária sem junction (`BLK-ENV-03`, contornada via worktree principal no mesmo commit `2454880`).
- **⏭️ Não Executados (Fora do escopo do Modo Diagnóstico):** `20` testes em `tests/api/*.api.spec.ts`, `5` fluxos em `tests/web/*.web.spec.ts`, `3` suítes em `tests/e2e/ctfl-academy.spec.ts` e `3` scripts em `tests/performance/*.k6.js`.
