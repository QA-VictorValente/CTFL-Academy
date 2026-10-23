# Protocolo de Persistência, Pausa, Retomada e Limites da Plataforma — CTFL Academy

**Mantido por:** Cérebro Central (`orquestrador`) & Scrum Master (`scrum-master`)  
**Objetivo:** Garantir continuidade real do trabalho entre sessões, suportar comandos explícitos de **Pausa** e **Retomada** em qualquer etapa do Ciclo Autônomo de 12 Etapas e documentar com total transparência o comportamento real dos processos no OMP.

---

## 1. Transparência Técnica: O Que Acontece Quando a Sessão do OMP é Encerrada?

De acordo com a arquitetura interna verificada do OMP (`omp://tools/task.md`, `omp://agent-hub.md`, `omp://session.md`):

1. **Enquanto a Sessão Central do OMP está aberta (`omp` em execução):**
   - Os 5 agentes (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`) rodam em sessões filhas independentes (`SpawnRun` / `AgentSession`) em paralelo (até `task.maxConcurrency = 32`).
   - Ao concluir um turno, cada agente fica em estado `idle` (e após 7 minutos passa a `parked`), mantendo sua transcrição `.jsonl` e artefatos `.md` vinculados à sessão.
   - Enviar `write agent://<id>` ou selecionar o agente no `Alt+A` (*Agent Hub*) reativa o agente instantaneamente com toda a sua memória da sessão.
2. **Quando o processo do OMP é fechado / encerrado pelo usuário (Limitação Real da Plataforma):**
   - Os *timers* do `AgentLifecycleManager` possuem `unref()` e os subprocessos de agentes pertencem ao processo host do OMP. Portanto, **nenhum processo fantasma de LLM continua consumindo API em segundo plano após o fechamento do terminal OMP**.
   - **Como a continuidade real funciona após fechar o OMP:**
     - **Alternativa A (Reabertura da mesma sessão com `omp --continue` ou `/resume`):** O OMP reconstrói automaticamente a árvore de artefatos da sessão e lista todos os subagentes anteriores como `parked` em `history://` e no `Alt+A` (*Agent Hub*), permitindo reativá-los diretamente via `write agent://<id>`.
     - **Alternativa B (Nova sessão limpa do OMP):** O Cérebro Central lê automaticamente o checkpoint estruturado em **`docs/orquestracao/ESTADO_EXECUCAO.json`**, **`docs/orquestracao/HISTORICO_EXECUCAO.md`**, **`docs/CLICKUP_BACKLOG.md`** e **`docs/orquestracao/BACKLOG_PROPOSTAS_AGENTES.md`** (além de poder consultar a transcrição bruta de sessões passadas via `agent: "seance"` com `sourceSession`), retomando exatamente da etapa (`currentStep` de 1 a 12) onde o trabalho parou!

---

## 2. Procedimento de Pausa Explícita (`/pausar` ou *"Pause a execução, preserve o estado atual e me mostre o que falta"*)

Quando o usuário ordenar a pausa de uma execução em andamento (ou quando um bloqueio Nível C exigir decisão do usuário):

1. **Interrupção Segura (se houver job assíncrono em voo):**
   - No TUI interativo, `/pause` congela os agentes na próxima fronteira segura; programaticamente, `write proc://<jobId>/kill` interrompe o turno em voo mantendo o agente em estado `idle` e preservando tudo o que já foi produzido.
2. **Gravação Atômica do Checkpoint (`Single-Writer`):**
   - O Cérebro Central atualiza `docs/orquestracao/ESTADO_EXECUCAO.json`:
     - `"status": "PAUSED"`
     - `"currentStep": <N>` (etapa exata de 1 a 12 onde parou)
     - `"completedSteps": [...]` (o que já foi concluído e verificado)
     - `"pendingSteps": [...]` (lista exata do que falta executar)
     - `"pausedState": { "reason": "...", "modifiedFiles": [...], "nextAgentsToInvoke": [...] }`
   - Atualiza a tabela `ESTADO_ATUAL` em `docs/orquestracao/HISTORICO_EXECUCAO.md`.
3. **Relatório de Pausa ao Usuário:**
   - Exibe o que já foi feito, os arquivos preservados, o checkpoint gravado e a lista exata das etapas restantes para conclusão.

---

## 3. Procedimento de Retomada (`/retomar` ou *"Retome a tarefa interrompida de onde parou"*)

Quando o usuário ordenar a retomada:

1. **Leitura do Checkpoint:**
   - O Cérebro Central lê `docs/orquestracao/ESTADO_EXECUCAO.json` e `docs/orquestracao/HISTORICO_EXECUCAO.md`, além de verificar `git status -sb` e `read history://`.
2. **Reativação ou Re-Hidratação dos Agentes:**
   - **Se os agentes da tarefa estiverem em `history://` (`idle` ou `parked`):** O Cérebro Central envia `write agent://<id>` retomando a partir de `currentStep` sem repetir as etapas já concluídas em `completedSteps`.
   - **Se for uma nova sessão limpa:** O Cérebro Central aciona via `task` apenas os agentes necessários para as `pendingSteps`, injetando no `context` o resumo das `completedSteps` salvo no checkpoint.
3. **Conclusão do Ciclo Autônomo:**
   - Executa as etapas restantes até a Etapa 12 e atualiza `ESTADO_EXECUCAO.json` para `"status": "COMPLETED"`.
