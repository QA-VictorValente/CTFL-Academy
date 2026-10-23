# Backlog de Propostas e Iniciativas Espontâneas dos Agentes — CTFL Academy

**Gerenciado por:** Cérebro Central (`orquestrador`) em conjunto com `po` e `scrum-master`  
**Regra de Governança (Nível A — Sugestão):** Qualquer um dos 5 agentes (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`) pode registrar propostas espontâneas a qualquer momento ao identificar problemas estruturais, dívidas técnicas, riscos de qualidade/segurança ou oportunidades de produto. **Nenhuma proposta entra em execução sem aprovação explícita do usuário.**

---

## 1. Fluxo de Captura, Desduplicação e Avaliação

1. **Origem Livre (Qualquer Agente):** Durante qualquer tarefa, o agente grava sua iniciativa em `local://propostas-<papel>.md` com o marcador `[PROPOSTA-ESPONTANEA]` (ou `[ALERTA-URGENTE]` para riscos imediatos).
2. **Consolidação pelo Cérebro Central (`Single-Writer`):**
   - O Orquestrador recolhe as propostas de todos os agentes, **unifica propostas semelhantes** (evitando duplicação), classifica a relevância (`Crítica`, `Alta`, `Média`, `Baixa`) e registra na tabela canônica abaixo.
3. **Deliberação do Usuário (Sessão Central de Comando):**
   - O usuário pode **Aceitar** (promovendo a proposta para `docs/CLICKUP_BACKLOG.md` ou autorizando execução imediata), **Solicitar Debate entre os Agentes (`/debater`)** ou **Rejeitar/Adiar (`/propostas`)**.

---

## 2. Top Propostas Espontâneas Consolidadas (Ordenadas por Relevância e Impacto)

| Ranking / ID | Agente(s) Proponente(s) | Especialidade Origem | Relevância | Esforço | Problema / Oportunidade Detectada Espontaneamente | Benefício Esperado | Status da Proposta |
|---|---|---|---|---|---|---|---|
| **1º `PROP-006`** *(Nova — Origem Técnica QA + Dev)* | `qa` (`AgenteQA`) + `desenvolvedor` (`AgenteDesenvolvedor`) | **QA (Segurança/Concorrência) & Engenharia** *(Não-PO/SM)* | **Crítica / Alta** | **P/M** | **Blindagem do Motor de Simulados (`exam.service.ts` e `api/exams/[id]/answer`):** (1) *Side-channel* de gabarito durante `IN_PROGRESS` (`POST /api/exams/[id]/answer` grava `isCorrect` real lido por `/dashboard` e `/progresso`); (2) Condição de corrida TOCTOU (`P2002`) entre auto-submit por expiração e submit manual; (3) Leitura de `configuration` mutável em vez de `configSnapshot` + 84 queries sequenciais na transação de submit. | Fecha vazamento indireto de gabarito com prova em andamento, elimina risco de `HTTP 500 (P2002 / P2028)` sob concorrência e reduz de ~84 para ~4 queries SQL no submit. | `AGUARDANDO_DECISAO_USUARIO` (Candidata `CTFL-110`) |
| **2º `PROP-001`** | `qa` (`AgenteQA`) + `po` (`AgentePO`) | **QA Preventivo & Produto** | **Alta** | **P** | **Sincronização Canônica Documental e Prefixo de XP:** Divergência em `ROTEIRO_DE_TESTES_QA.md` (`+20 XP` em `CT-10.2` vs `+30 XP` reais; `Cap. 4 = 11` em `CT-08.1` vs `12`), `README.md:49` (`55` vs `80 questões`) e prefixo `lesson:` minúsculo em `lesson.service.ts:83`. | Elimina falsos-positivos nos testes de QA e padroniza `LESSON:` em banco e docs. | `AGUARDANDO_DECISAO_USUARIO` (Vinculada a `CTFL-106`) |
| **3º `PROP-003`** *(Origem Técnica DevOps)* | `devops` (`AgenteDevOps`) | **DevOps (CI/CD & Segurança Operacional)** *(Não-PO/SM)* | **Alta** | **P** | **Otimização da Pipeline CI (Fatia 0) e *Lazy Fail-Fast* de `AUTH_SECRET`:** (1) `package.json:36` define `"test:e2e": "playwright test"` sem `--project=e2e`, fazendo o Step 14 do GitHub Actions reexecutar `api` e `web` duplicados; (2) `auth.service.ts:16-17` usa fallback hardcoded de `AUTH_SECRET`, devendo validar *lazy fail-fast* em `getAuthSecret()` (`NEXT_PHASE !== 'phase-production-build'`). | Reduz tempo de CI em ~40% sem quebrar `next build` e impede subida insegura em produção sem `AUTH_SECRET`. | `AGUARDANDO_DECISAO_USUARIO` (Vinculada a `CTFL-109`) |
| **4º `PROP-004`** | `po` (`AgentePO`) | **Produto / Pedagogia CTFL** | **Alta** | **M** | **Evolução do Caderno de Erros (`/revisao-erros`):** Separar erros **Pendentes** de **Superados**, filtrar por Nível Cognitivo (`K1`–`K3`) e Objetivo (`FL-x.x.x`), e permitir reteste com gabarito oculto (`CT-17.2`). | Aumenta retenção de estudo e alinha a tela ao roteiro oficial de QA. | `AGUARDANDO_DECISAO_USUARIO` (Vinculada a `CTFL-107`) |
| **5º `PROP-002`** *(Origem Técnica Dev)* | `desenvolvedor` (`AgenteDesenvolvedor`) | **Engenharia / Arquitetura** *(Não-PO/SM)* | **Média** | **M** | **Fatiamento em 3 Etapas para 100% Thin Route Handlers e `@frontend/api-clients`:** Extrair controllers das 14 rotas restantes em 3 fatias atômicas (Fatia A: `exams`; Fatia B: `auth/profile`; Fatia C: `admin/*`) e substituir `fetch` inline em `src/components/student/*`. | Conclui 100% do padrão `ADR-001` com baixo risco de regressão e cobertura unitária por fatia. | `AGUARDANDO_DECISAO_USUARIO` (Vinculada a `CTFL-109`) |
| **6º `PROP-005`** | `scrum-master` (`AgenteScrumMaster`) + `devops` | **Processo & Ambiente Local** | **Média** | **P** | **Bootstrap de Worktrees Secundárias (`BLK-ENV-03`):** Automação/junction de `node_modules` e `.env` em worktrees secundárias do Git. | Destrava execução direta de `vitest` e `tsc` em qualquer worktree secundária. | `AGUARDANDO_DECISAO_USUARIO` |
