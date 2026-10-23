---
description: "Aciona o Modo Planejamento da equipe CTFL Academy (PO + Scrum Master) para analisar o projeto e propor de 3 a 5 ações prioritárias."
argument-hint: "[foco opcional: ex. simulados, flashcards, performance, backlog geral]"
---

Ative o **MODO PLANEJAMENTO** da orquestração multiagente do **CTFL Academy** conforme `docs/orquestracao/MANUAL_ORQUESTRACAO.md`.

Foco / contexto adicional informado pelo usuário: `$ARGUMENTS`

Instruções obrigatórias:
1. Leia `docs/orquestracao/CONTEXTO_PROJETO.md`, `docs/CLICKUP_BACKLOG.md`, `docs/orquestracao/HISTORICO_EXECUCAO.md` e `docs/orquestracao/REGISTRO_QA_DEFEITOS.md`.
2. Acione via ferramenta `task` os agentes dedicados `po` e `scrum-master` (e consulte `qa`, `desenvolvedor` ou `devops` se o foco exigir insumo técnico específico).
3. Consolide a resposta apresentando:
   - Diagnóstico executivo do estado atual do CTFL Academy;
   - **De 3 a 5 ações prioritárias** (com ID, descrição, benefício pedagógico/técnico, esforço relativo P/M/G, dependências e riscos);
   - **Recomendação explícita da próxima tarefa** com justificativa conjunta do PO e do Scrum Master;
   - **Perguntas objetivas** para o usuário definir prioridades e autorizar a próxima execução (sem repetir perguntas já respondidas em `docs/orquestracao/DECISOES_ADR_PDR.md`).
4. **Trava de segurança:** NÃO inicie implementações nem modifique código de produção neste modo; aguarde a aprovação do usuário.
