---
description: "Reúne, consolida, classifica ou delibera (aceitar/rejeitar) sobre as sugestões espontâneas de todos os 5 agentes do CTFL Academy."
argument-hint: "[acao opcional: top5 | consolidar | aceitar PROP-xxx | rejeitar PROP-xxx]"
---

Como **Cérebro Central (Orquestrador)** do CTFL Academy, gerencie o **Backlog de Propostas Espontâneas dos Agentes** (`docs/orquestracao/BACKLOG_PROPOSTAS_AGENTES.md`).

Instrução / filtro do usuário: `$ARGUMENTS`

Procedimento obrigatório:
1. Leia `docs/orquestracao/BACKLOG_PROPOSTAS_AGENTES.md`, `docs/CLICKUP_BACKLOG.md` e eventuais caixas de propostas da sessão (`local://propostas-*.md`).
2. Se o usuário pedir para reunir novas sugestões de todos os agentes, consulte os agentes (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`), desduplique propostas semelhantes e classifique-as por relevância (`Crítica`, `Alta`, `Média`, `Baixa`).
3. Se o usuário aprovar/aceitar uma proposta (`PROP-xxx`), promova-a para `docs/CLICKUP_BACKLOG.md` (ou inicie o Ciclo Autônomo de 12 Etapas se houver ordem explícita de execução). Se rejeitar, atualize o status para `REJEITADA` em `BACKLOG_PROPOSTAS_AGENTES.md`.
4. Apresente de forma clara as **5 propostas mais importantes** com Agente Proponente, Problema/Oportunidade, Benefício Esperado, Esforço, Riscos e Recomendação do Orquestrador.
