---
description: "Pausa a execução atual da equipe, preserva o checkpoint atômico em ESTADO_EXECUCAO.json e HISTORICO_EXECUCAO.md e exibe o que falta concluir."
argument-hint: "[motivo opcional da pausa]"
---

Como **Cérebro Central (Orquestrador)** do CTFL Academy, execute imediatamente o **Procedimento de Pausa e Preservação de Estado** (`docs/orquestracao/PROTOCOLO_RETOMADA.md` Seção 2).

Motivo / observação: `$ARGUMENTS`

Procedimento obrigatório:
1. Se houver subagentes com turno em andamento (`read proc://`), interrompa o turno com segurança mantendo o agente preservado (`idle`).
2. Atualize atomicamente `docs/orquestracao/ESTADO_EXECUCAO.json` definindo:
   - `"status": "PAUSED"`
   - `"currentStep"`: etapa exata onde a execução parou (1 a 12)
   - `"completedSteps"`: lista de etapas já concluídas e validadas
   - `"pendingSteps"`: lista exata das etapas que faltam para concluir a tarefa
   - `"pausedState"`: resumo dos artefatos gerados, arquivos alterados e qual agente deve ser acionado na retomada.
3. Sincronize o ponteiro `ESTADO_ATUAL` em `docs/orquestracao/HISTORICO_EXECUCAO.md`.
4. Apresente ao usuário o resumo do estado preservado e o que falta para concluir quando ele ordenar `/retomar`.
