---
description: "Consulta diretamente um ou mais agentes especialistas (PO, Scrum Master, QA, Desenvolvedor ou DevOps) e retorna a análise consolidada pelo Orquestrador."
argument-hint: "<agente(s) e pergunta, ex: qa investigue os riscos do sistema de simulados>"
---

Como **Cérebro Central (Orquestrador)** do CTFL Academy, delegue a consulta técnica/produto ao(s) agente(s) independente(s) especificado(s) pelo usuário:

Solicitação do usuário: `$ARGUMENTS`

Procedimento obrigatório:
1. Identifique o(s) agente(s) alvo (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`).
2. Acione o(s) agente(s) via `task` (ou via `write agent://<id>` caso já esteja ativo/idle na sessão atual em `history://`).
3. Instrua o agente a analisar o problema segundo sua especialidade, registrar achados em `local://outbox-<papel>.md`, encaminhar problemas fora de sua especialidade (`[ENCAMINHAMENTO PARA: <agente>]`) e registrar eventuais iniciativas proativas em `local://propostas-<papel>.md`.
4. Reúna a resposta, verifique se há contradições ou necessidade de complemento, atualize `docs/orquestracao/BACKLOG_PROPOSTAS_AGENTES.md` se houver novas sugestões e apresente o parecer consolidado ao usuário.
