---
description: "Executa o Protocolo de Retomada de trabalho interrompido da equipe multiagente do CTFL Academy."
argument-hint: "[id-da-tarefa opcional]"
---

Execute o **Protocolo de Retomada de Trabalho Interrompido** definido em `docs/orquestracao/PROTOCOLO_RETOMADA.md`.

Alvo informado pelo usuário: `$ARGUMENTS`

1. Inspecione `docs/orquestracao/HISTORICO_EXECUCAO.md` (`ESTADO_ATUAL`), `docs/CLICKUP_BACKLOG.md`, `docs/orquestracao/REGISTRO_QA_DEFEITOS.md`, `git status -sb` e `read history://`.
2. Identifique se há trabalho interrompido ou pendente e em qual etapa do fluxo (1 a 13) ele se encontra.
3. Caso exista uma execução autorizada interrompida, retome exatamente da etapa pendente acionando os agentes correspondentes (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`). Caso não haja tarefa interrompida, apresente o estado atual e peça ao `po` e `scrum-master` para sugerirem o próximo passo.
