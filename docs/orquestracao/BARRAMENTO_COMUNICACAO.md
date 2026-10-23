# Barramento de Comunicação Inter-Agentes e Controle de Concorrência — CTFL Academy

**Gerenciado por:** Cérebro Central (`orquestrador`) & Scrum Master (`scrum-master`)  
**Objetivo:** Garantir comunicação real, rastreável e livre de loops infinitos ou colisões de escrita entre os 5 agentes independentes (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`).

---

## 1. Arquitetura do Canal de Comunicação Real no OMP

O sistema combina **três canais nativos do OMP** conforme a natureza da interação:

1. **Mensageria Direta Peer-to-Peer em Tempo Real (OMP IRC: `agent://<id>`):**
   - Envio direto via `write` em `agent://AgentePO`, `agent://AgenteScrumMaster`, `agent://AgenteDesenvolvedor`, `agent://AgenteQA` ou `agent://AgenteDevOps`.
   - Reativação automática de agentes em estado `idle` ou `parked` preservando 100% da transcrição e memória individual.
2. **Caixas de Saída Isoladas por Agente (`local://outbox-<papel>.md` e `local://propostas-<papel>.md`):**
   - Cada agente grava em seus próprios artefatos durante ondas paralelas, eliminando condições de corrida e sobrescritas acidentais.
3. **Consolidação Serializada (`Single-Writer` em `docs/orquestracao/*` e `docs/CLICKUP_BACKLOG.md`):**
   - Apenas o Cérebro Central / Scrum Master (na etapa de consolidação) atualiza os arquivos canônicos versionados.

---

## 2. Protocolo de Mensagens, Encaminhamento e Anti-Loop

- **Cabeçalho Obrigatório:** `[MSG #<id> | DE: <origem> | PARA: <destino> | TIPO: CONSULTA | REVISAO | ENCAMINHAMENTO | DISCORDANCIA | SUGESTAO | URGENTE | HOP: <1..2>/2]`
- **Trava Anti-Loop (`Max 2 Hops`):** Máximo de 2 mensagens laterais diretas por tópico (`HOP 1/2` $\rightarrow$ `HOP 2/2`) antes de retornar ao Cérebro Central para arbitragem.

---

## 3. Histórico Auditável de Comunicações Inter-Agentes e Arbitragens

| ID | Data / Execução | Origem $\rightarrow$ Destino | Tipo / Hop | Resumo da Comunicação / Discordância e Resolução pelo Cérebro Central |
|---|---|---|---|---|
| `COM-001` | `2026-10-22` (`EXEC-01`) | `AgenteScrumMaster` $\leftrightarrow$ `AgentePO` | `SINCRONIZACAO` (`1/2`) | Alinhamento da ordem de priorização do backlog (`CTFL-106` Quick Win documental antes de `CTFL-104` e `CTFL-107`). |
| `COM-002` | `2026-10-22` (`EXEC-01`) | `AgenteQA` $\rightarrow$ `AgentePO` & `AgenteDesenvolvedor` | `ENCAMINHAMENTO` (`1/2`) | `qa` reportou divergência de XP em `CT-10.2` (`+20 XP` vs `+30 XP`), peso do Cap. 4 (`11` vs `12`) e prefixo `lesson:` vs `LESSON:`. Consolidado em `CTFL-106`. |
| `COM-003` | `2026-10-22` (`EXEC-01`) | `AgenteDevOps` $\rightarrow$ `AgenteDesenvolvedor` | `ENCAMINHAMENTO` (`1/2`) | `devops` reportou Step 14 redundante no GitHub Actions (`npm run test:e2e`) e variáveis ausentes em `.env.example`. |
| `COM-004` | `2026-10-22` (`EXEC-02`) | `AgenteQA` $\rightarrow$ `AgenteDesenvolvedor` | `ENCAMINHAMENTO / REVISAO` (`1/2`) | `qa` investigou o motor de simulados (`exam.service.ts` e `api/exams/[id]/answer/route.ts`) e encaminhou 3 achados críticos/altos: (1) vazamento de gabarito por canal lateral (`isCorrect` gravado em `UserAnswer` durante `IN_PROGRESS` e lido em `/dashboard` e `/progresso`); (2) condição de corrida TOCTOU (`P2002`) no `finalizeExamAttemptIdempotent`; (3) leitura de `attempt.configuration` mutável + 84 queries sequenciais na transação. |
| `COM-005` | `2026-10-22` (`EXEC-02`) | `AgenteDesenvolvedor` $\rightarrow$ `AgenteDevOps` | `CONSULTA / DISCORDANCIA` (`1/2`) | `desenvolvedor` propôs fatiar a refatoração das 14 rotas de API (`CTFL-109`) em 3 fatias atômicas (rejeitando PR *big-bang*) e consultou `devops` sobre o risco de `AUTH_SECRET` *fail-fast* no top-level import quebrar o `next build`. |
| `COM-006` | `2026-10-22` (`EXEC-02`) | `AgenteDevOps` $\rightarrow$ `AgenteDesenvolvedor` | `DISCORDANCIA / CONSENSO` (`2/2`) | `devops` confirmou que validar `AUTH_SECRET` no import estático quebraria `next build` (`NEXT_PHASE === 'phase-production-build'`) e propôs *lazy fail-fast* dentro de `getAuthSecret()`, além de Fatia 0 alterando `"test:e2e"` para `"playwright test --project=e2e"` em `package.json:36`. Consenso fechado em 2 hops. |
| `COM-007` | `2026-10-22` (`EXEC-02`) | `AgenteDesenvolvedor` $\rightarrow$ `AgenteQA` | `RESPOSTA / CONSENSO` (`2/2`) | `desenvolvedor` validou os 3 riscos do motor de simulados apontados pelo `qa` e desenhou a blindagem: gravar `isCorrect: false` enquanto `IN_PROGRESS`, usar `tx.examAttempt.updateMany` como trava *Compare-And-Swap*, ler `attempt.configSnapshot` e substituir os 40 `update` sequenciais por 2 `updateMany` em lote. Consenso fechado em 2 hops. |
