---
description: "Aciona o Modo Execução da equipe CTFL Academy (fluxo completo de 13 etapas com PO, Scrum Master, Desenvolvedor, QA e DevOps)."
argument-hint: "<id-da-tarefa ou descrição da ordem autorizada>"
---

Ative o **MODO EXECUÇÃO** da orquestração multiagente do **CTFL Academy** conforme `docs/orquestracao/MANUAL_ORQUESTRACAO.md`.

Ordem de execução autorizada pelo usuário: `$ARGUMENTS`

Instruções obrigatórias:
1. Siga o fluxo coordenado de 13 etapas da equipe dedicada (`po`, `scrum-master`, `qa`, `desenvolvedor`, `devops`):
   - **Etapas 1–4:** `po` valida valor, requisitos e critérios de aceitação; `scrum-master` organiza etapas, dependências e DoR. Se houver ambiguidade crítica ou risco irreversível, pare e pergunte ao usuário; caso contrário, prossiga autonomamente.
   - **Etapas 5–7:** `qa` planeja os cenários de teste preventivos (positivos, negativos, limites, segurança/acessibilidade) enquanto o `desenvolvedor` implementa a solução seguindo a Clean Layered Architecture (`docs/ARQUITETURA.md`) e cria/atualiza os testes automatizados.
   - **Etapas 8–9:** `qa` executa os testes reais compatíveis com o ambiente e coleta evidências. Se houver defeito, registre em `docs/orquestracao/REGISTRO_QA_DEFEITOS.md`, acione o `desenvolvedor` para corrigir e revalide no `qa`.
   - **Etapa 10:** `devops` verifica build, `typecheck`, `lint` e impacto na pipeline de CI.
   - **Etapas 11–12:** `scrum-master` atualiza `docs/CLICKUP_BACKLOG.md` e `docs/orquestracao/HISTORICO_EXECUCAO.md`; `po` realiza o aceite final contra os critérios de aceitação.
2. **Etapa 13:** Entregue o **Relatório Final Obrigatório** com todas as 9 seções exigidas.
