---
name: ctfl-orquestracao
description: "Arquitetura de Cérebro Central (Orquestrador) e 5 agentes independentes do CTFL Academy (po, scrum-master, desenvolvedor, qa, devops), comunicação inter-agentes, sugestões espontâneas, governança A/B/C, ciclo autônomo de 12 etapas, pausa e retomada."
---

# Skill: Orquestração Autônoma com Cérebro Central — CTFL Academy (`ctfl-orquestracao`)

Esta skill define o protocolo operacional do **Cérebro Central (`orquestrador`)** e dos **5 agentes independentes** do CTFL Academy:
- `orquestrador` (`.omp/agents/orquestrador.md`) — Cérebro Central
- `po` (`.omp/agents/po.md`) — Product Owner (foco em valor de produto e Syllabus v4.0.1)
- `scrum-master` (`.omp/agents/scrum-master.md`) — Scrum Master (foco em fluxo, capacidade e dependências)
- `desenvolvedor` (`.omp/agents/desenvolvedor.md`) — Desenvolvedor Full-Stack (Clean Layered Architecture)
- `qa` (`.omp/agents/qa.md`) — Quality Assurance (testes preventivos, execução real e questionamento crítico)
- `devops` (`.omp/agents/devops.md`) — DevOps Engineer (build, ambientes e pipeline CI/CD de 7 estágios)

---

## 1. Estado Compartilhado e Isolamento contra Conflitos

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

## 2. Governança de 3 Níveis e Iniciativa Proativa

- **Nível A (Sugestão):** Qualquer agente pode originar `[PROPOSTA-ESPONTANEA]` a qualquer momento (registrada em `local://propostas-<papel>.md` e consolidada em `BACKLOG_PROPOSTAS_AGENTES.md`). **Não autoriza implementação.**
- **Nível B (Execução Autorizada):** Ordem clara do usuário dispara o **Ciclo Autônomo de 12 Etapas** até atingir os critérios de aceitação, encontrar bloqueio real ou exigir decisão Nível C.
- **Nível C (Reservada ao Usuário):** Mudança de escopo relevante, decisão de produto de alto impacto, operação destrutiva, commit/push ou deploy em produção exige aprovação explícita do usuário.
