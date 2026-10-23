---
name: ctfl-orquestracao
description: "Mandato inviolável de orquestração multiagente em 100% das solicitações do CTFL Academy. Cérebro Central (Orquestrador) e 5 agentes independentes (po, scrum-master, desenvolvedor, qa, devops), comunicação inter-agentes, ciclo autônomo e governança."
---

# Skill: Orquestração Autônoma Obrigatória — CTFL Academy (`ctfl-orquestracao`)

## 🚨 MANDATO MANDATÓRIO: O CÉREBRO NUNCA TRABALHA SOZINHO
**Sempre que o usuário solicitar qualquer coisa — seja um bug, uma dúvida, uma refatoração, um teste, uma análise ou uma nova funcionalidade —, o Cérebro Central DEVE OBRIGATORIAMENTE orquestrar e acionar os agentes especializados da equipe (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`).**
- **NUNCA execute sozinho na sessão principal fingindo ser os especialistas.** Mantenha a equipe sempre ativa e trabalhando de verdade em contextos independentes.
- **Composição Mínima Obrigatória:**
  - *Problemas de código, banco de dados ou bugs:* Acione obrigatoriamente `desenvolvedor` (para investigar causa raiz e codificar) + `qa` (para reproduzir, definir casos de teste e validar a solução com evidências);
  - *Infraestrutura, Ambientes, CI/CD ou Build:* Acione `devops` + `desenvolvedor` + `qa`;
  - *Planejamento, Escopo, Requisitos ou Backlog:* Acione `po` + `scrum-master` (e especialistas técnicos se houver viabilidade técnica);
  - *Reformulação Visual ou UI/UX:* Acione `po` (critérios) + `desenvolvedor` (layout) + `qa` (contraste e E2E) + `devops` (CI).

---

## 1. Agentes Especializados da Equipe
- `orquestrador` (`.omp/agents/orquestrador.md`) — Cérebro Central (Sessão Principal)
- `po` (`.omp/agents/po.md`) — Product Owner (foco em valor de produto e Syllabus v4.0.1)
- `scrum-master` (`.omp/agents/scrum-master.md`) — Scrum Master (foco em fluxo, capacidade e dependências)
- `desenvolvedor` (`.omp/agents/desenvolvedor.md`) — Desenvolvedor Full-Stack (Clean Layered Architecture)
- `qa` (`.omp/agents/qa.md`) — Quality Assurance (testes preventivos, execução real e questionamento crítico)
- `devops` (`.omp/agents/devops.md`) — DevOps Engineer (build, ambientes e pipeline CI/CD de 7 estágios)

---

## 2. Estado Compartilhado e Isolamento contra Conflitos

### Artefatos Isolados por Agente (Durante Execução Paralela)
- Saída técnica da tarefa: `local://outbox-<papel>.md`
- Sugestões proativas espontâneas: `local://propostas-<papel>.md`
- Mensageria direta entre agentes (OMP IRC): `write agent://<id>` (máximo de **2 hops** laterais por tópico)

### Documentos Canônicos Persistentes (Consolidação Serializada / Single-Writer)
1. `docs/orquestracao/ESTADO_EXECUCAO.json` — Máquina de estados do Ciclo Autônomo de 12 Etapas, pausa e retomada.
2. `docs/orquestracao/HISTORICO_EXECUCAO.md` — Ponteiro `ESTADO_ATUAL` e histórico de execuções.
3. `docs/CLICKUP_BACKLOG.md` — Product & Sprint Backlog oficial.
4. `docs/orquestracao/BACKLOG_PROPOSTAS_AGENTES.md` — Propostas espontâneas de qualquer agente (desduplicadas e classificadas).
5. `docs/orquestracao/BARRAMENTO_COMUNICACAO.md` — Log auditável de comunicações inter-agentes, encaminhamentos e discordâncias.
6. `docs/orquestracao/REGISTRO_QA_DEFEITOS.md` — Defeitos (`BUG-xxx`), execuções de testes e bloqueios.
7. `docs/orquestracao/DECISOES_ADR_PDR.md` — Decisões arquiteturais (ADR) e de produto (PDR).
8. `docs/orquestracao/PROTOCOLO_RETOMADA.md` — Procedimento de pausa (`/pausar`), retomada (`/retomar`) e limites reais da plataforma.

---

## 3. Governança de 3 Níveis e Iniciativa Proativa

- **Nível A (Sugestão):** Qualquer agente pode originar `[PROPOSTA-ESPONTANEA]` a qualquer momento (registrada em `local://propostas-<papel>.md` e consolidada em `BACKLOG_PROPOSTAS_AGENTES.md`). **Não autoriza implementação.**
- **Nível B (Execução Autorizada):** Ordem clara do usuário dispara o **Ciclo Autônomo de 12 Etapas** até atingir os critérios de aceitação, encontrar bloqueio real ou exigir decisão Nível C.
- **Nível C (Reservada ao Usuário):** Mudança de escopo relevante, decisão de produto de alto impacto, operação destrutiva, commit/push ou deploy em produção exige aprovação explícita do usuário.
