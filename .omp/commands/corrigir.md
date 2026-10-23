---
description: "Aciona o Modo Correção de Bug (QA reproduz -> Desenvolvedor corrige -> QA revalida + regressão -> DevOps verifica -> SM registra)."
argument-hint: "<descrição do defeito, passos ou comportamento inesperado>"
---

Ative o **MODO CORREÇÃO** da orquestração multiagente do **CTFL Academy** conforme `docs/orquestracao/MANUAL_ORQUESTRACAO.md`.

Relato do bug informado pelo usuário: `$ARGUMENTS`

Instruções obrigatórias:
1. **Reprodução e Delimitação (`qa`):** Acione o agente `qa` para reproduzir o problema, delimitar o escopo e registrar o defeito (`BUG-xxx`) em `docs/orquestracao/REGISTRO_QA_DEFEITOS.md` com passos, resultado esperado, resultado obtido e severidade.
2. **Investigação e Correção (`desenvolvedor`):** Acione o agente `desenvolvedor` para investigar a causa raiz via Trail, corrigir o defeito sem efeitos colaterais e adicionar/atualizar teste de regressão.
3. **Reteste e Regressão (`qa`):** Acione novamente o `qa` para validar a correção e executar a suíte de regressão pertinente.
4. **Verificação de Build/Ambiente (`devops`):** Acione o `devops` quando houver impacto em build, tipagem, lint, ambiente ou pipeline.
5. **Registro e Relatório Final (`scrum-master` & `po`):** Atualize `docs/orquestracao/REGISTRO_QA_DEFEITOS.md`, `docs/CLICKUP_BACKLOG.md` e `docs/orquestracao/HISTORICO_EXECUCAO.md` e apresente o **Relatório Final Obrigatório** de 9 itens.
