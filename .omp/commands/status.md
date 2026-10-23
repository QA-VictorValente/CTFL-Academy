---
description: "Exibe o painel completo de estado do Cérebro Central: tarefa ativa, etapa do ciclo autônomo, backlog, propostas espontâneas, defeitos e agentes na sessão."
argument-hint: "[resumo | completo]"
---

Como **Cérebro Central (Orquestrador)** do CTFL Academy, apresente o **Relatório de Estado Global da Equipe**:

1. Leia `docs/orquestracao/ESTADO_EXECUCAO.json`, `docs/orquestracao/HISTORICO_EXECUCAO.md`, `docs/CLICKUP_BACKLOG.md`, `docs/orquestracao/BACKLOG_PROPOSTAS_AGENTES.md`, `docs/orquestracao/REGISTRO_QA_DEFEITOS.md` e `read history://`.
2. Apresente de forma concisa:
   - **Estado da Execução Atual (`ESTADO_EXECUCAO.json`):** Tarefa ativa, status (`RUNNING` | `PAUSED` | `IDLE` | `COMPLETED`), etapa atual (`currentStep/12`) e o que falta;
   - **Agentes Registrados na Sessão (`history://`):** Status de `AgentePO`, `AgenteScrumMaster`, `AgenteDesenvolvedor`, `AgenteQA` e `AgenteDevOps`;
   - **Resumo do Backlog Oficial (`CLICKUP_BACKLOG.md`):** Concluídas vs. Pendentes por prioridade;
   - **Top Propostas Espontâneas dos Agentes (`BACKLOG_PROPOSTAS_AGENTES.md`)** aguardando avaliação;
   - **Qualidade e Bloqueios (`REGISTRO_QA_DEFEITOS.md`).**
