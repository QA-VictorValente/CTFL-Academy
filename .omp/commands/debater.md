---
description: "Solicita que dois ou mais agentes independentes discutam e avaliem juntos uma proposta ou mudança arquitetural/produto antes da decisão do usuário."
argument-hint: "<agentes e tema, ex: desenvolvedor e devops sobre refatoracao das rotas de API>"
---

Como **Cérebro Central (Orquestrador)** do CTFL Academy, conduza um **Debate Técnico / Produto Coordenado** entre os agentes solicitados pelo usuário:

Tema / Agentes solicitados: `$ARGUMENTS`

Instruções obrigatórias:
1. Identifique os agentes envolvidos (ex.: `desenvolvedor` e `devops`, ou `po` e `scrum-master`, ou `qa` e `desenvolvedor`).
2. Acione os agentes em contextos independentes via `task` (ou reative-os via `write agent://<id>` se já estiverem ativos na sessão).
3. Instrua o primeiro agente a enviar sua avaliação e eventuais contrapontos diretamente ao segundo agente via `write agent://<id>` usando o protocolo `[MSG | DE | PARA | TIPO: REVISAO/DISCORDANCIA | HOP: 1/2]` de `docs/orquestracao/BARRAMENTO_COMUNICACAO.md`.
4. Reúna os pareceres de ambos (`local://outbox-<papel>.md`), compare convergências e divergências (`[DISCORDANCIA FUNDAMENTADA]`), registre o resumo em `docs/orquestracao/BARRAMENTO_COMUNICACAO.md` e apresente ao usuário:
   - Pontos de consenso entre os agentes;
   - Discordâncias fundamentadas e trade-offs;
   - Recomendação consolidada do Cérebro Central para decisão do usuário (Nível A/C — sem iniciar código sem autorização).
