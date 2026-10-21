# BACKLOG CANÔNICO DO PROJETO CTFL ACADEMY (PADRÃO CLICKUP)
**Versão:** 1.0.0 | **Gerenciado por:** Scrum Master & Orquestrador da Equipe Multiagente  
**Repositório:** `https://github.com/QA-VictorValente/CTFL-Academy`  
**Referência Metodológica:** Seção 3 do Script Mestre da Equipe Multiagente

---

## 1. ESTRUTURA DO WORKFLOW NO CLICKUP

Os status padrão adotados para o fluxo de valor do CTFL Academy são:

1. **Backlog:** Tarefas levantadas aguardando refinamento.
2. **A analisar:** Sob análise inicial do PO ou arquiteto.
3. **Refinamento:** Definição detalhada de regras e critérios de aceite.
4. **Pronto para desenvolvimento:** Requisitos fechados e dependências liberadas.
5. **Em desenvolvimento:** Implementação pelo Desenvolvedor.
6. **Em revisão de código:** Revisão estática e análise de diff.
7. **Em QA:** Validação funcional independente pelo QA Engineer.
8. **Correção necessária:** Defeito identificado com evidências anexas.
9. **Reteste:** Verificação da correção da causa raiz.
10. **Aguardando aprovação:** Validação executiva do PO/Orquestrador.
11. **Pronto para implantação:** Build e testes do CI 100% verdes.
12. **Em implantação:** Execução de migração ou deploy.
13. **Concluído:** Em produção/homologação com smoke tests aprovados.
14. **Bloqueado:** Impedimento técnico ou dependência externa documentada.

---

## 2. SPRINT 1 — GOVERNANÇA, EXPANSÃO DE QUALIDADE & BANCO DE QUESTÕES

### [CTFL-101] Governança de Versionamento, Estratégia de Branches e PR Template
- **Tipo:** Tarefa / DevOps
- **Status:** Em desenvolvimento
- **Prioridade:** Alta
- **Responsável:** DevOps Engineer
- **Contexto e Justificativa:** O projeto necessita de rastreabilidade formal e proteção contra commits diretos desavisados na branch principal, além de padronizar a submissão de Pull Requests com checklist de qualidade.
- **Comportamento Atual:** Commits eram realizados diretamente na `main`, sem template padronizado de PR e sem rastreabilidade por branch de feature.
- **Comportamento Esperado:** Fluxo padronizado baseado em branches `feature/*`, `fix/*` e `chore/*`, com template de PR exigindo evidências de testes do Quality Gate.
- **Critérios de Aceitação:**
  1. Criação do template de Pull Request em `.github/pull_request_template.md`.
  2. Documentação da estratégia de branches e convenção de commits convencionais (`feat:`, `fix:`, `test:`, `ci:`).
  3. Todas as modificações anteriores do pipeline integradas e versionadas com mensagens semânticas.
- **Evidências:** Arquivo de template no repositório e branch `feature/ciclo-1-governanca-qualidade` ativa.
- **Testes Relacionados:** Verificação de status do Git e execução de `npm run pipeline`.
- **Dependências / Bloqueios:** Nenhum bloqueio.

---

### [CTFL-102] Expansão do Banco de Questões Oficiais CTFL v4.0.1 (K1, K2 e K3)
- **Tipo:** Feature / Conteúdo Educacional
- **Status:** Pronto para desenvolvimento
- **Prioridade:** Alta
- **Responsável:** Product Owner & Desenvolvedor de Software
- **Contexto e Justificativa:** O banco continha 55 questões publicadas. Para um exame padrão de 40 questões, realizar 2 simulados consecutivos gerava sobreposição excessiva de questões para o estudante.
- **Comportamento Atual:** 55 questões persistidas, limitando a variabilidade dos simulados.
- **Comportamento Esperado:** Inclusão de 25 novas questões originais de alta fidelidade técnica cobrindo todos os capítulos (Capítulos 1 ao 6) e objetivos de aprendizagem (K1, K2, K3), elevando o total do banco para 80 questões.
- **Critérios de Aceitação:**
  1. Cada questão deve possuir código único (`Q-CTFL-xxx`), objetivo de aprendizagem (`FL-x.x.x`), nível cognitivo (`K1`, `K2`, `K3`) e dificuldade.
  2. 4 alternativas (A, B, C, D) com exatamente 1 alternativa correta.
  3. Cada uma das 4 opções deve conter justificativa didática individual explicando por que está certa ou errada.
  4. Explicação geral consolidada com referência direta à seção do Syllabus CTFL v4.0.1.
  5. Carga via seed idempotente sem duplicações (`npm run db:seed`).
- **Evidências:** Logs do comando `npm run db:seed` reportando 80 questões e testes de persistência passando.
- **Testes Relacionados:** `tests/integration/persistence-workflows.test.ts` e `tests/api/exercises.api.spec.ts`.
- **Dependências / Bloqueios:** Depende da validação conceitual do PO baseada no Syllabus v4.0.1.

---

### [CTFL-103] Consolidação do Quality Gate de 7 Estágios na Pipeline de CI
- **Tipo:** Tarefa / QA & DevOps
- **Status:** Pronto para desenvolvimento
- **Prioridade:** Alta
- **Responsável:** QA Engineer & DevOps Engineer
- **Contexto e Justificativa:** Garantir que nenhuma alteração possa ser mesclada na aplicação caso algum teste unitário, de API, de interface (E2E) ou de desempenho (k6) falhe.
- **Comportamento Atual:** O script `scripts/run-pipeline.ts` foi criado localmente mas ainda não estava formalmente integrado e versionado na branch de ciclo.
- **Comportamento Esperado:** Pipeline executável via `npm run pipeline` cobrindo estritamente: ESLint, TypeScript Typecheck, Vitest Unit, Vitest Integration, Playwright API, Playwright Web E2E e k6 Smoke Test.
- **Critérios de Aceitação:**
  1. Script `scripts/run-pipeline.ts` executável com sucesso em ambiente Windows e CI.
  2. Falha em qualquer etapa deve abortar o processo com código de saída != 0.
  3. Sucesso completo em todas as etapas exibe relatório consolidado com resumo de métricas.
- **Evidências:** Log de execução terminal do comando `npm run pipeline` com resultado 100% verde.
- **Testes Relacionados:** Todos os testes das suítes de `tests/`.
- **Dependências / Bloqueios:** Requer que o dev server e banco de dados estejam em execução durante as etapas de API e E2E.

---

### [CTFL-104] Suíte de Testes de Carga e Estresse para Submissão Concorrente
- **Tipo:** Tarefa / QA
- **Status:** Backlog
- **Prioridade:** Normal
- **Responsável:** QA Engineer
- **Contexto e Justificativa:** Validar a resiliência do backend quando múltiplos alunos submetem respostas de simulado e anotações simultaneamente.
- **Comportamento Esperado:** Scripts k6 de carga (`tests/performance/load.k6.js`) executando 20 a 50 usuários virtuais concorrentes mantendo p95 < 200ms e 0% de erros HTTP 500.
- **Critérios de Aceitação:** Script criado e thresholds de latência atendidos.

---

### [CTFL-105] Aprimoramento da Síntese de Áudio com Fallback de Vozes
- **Tipo:** Feature / UX
- **Status:** Backlog
- **Prioridade:** Normal
- **Responsável:** Desenvolvedor de Software
- **Contexto e Justificativa:** A leitura em áudio depende da Web Speech API do navegador. Em navegadores sem vozes em pt-BR de qualidade, a experiência fica prejudicada.
- **Comportamento Esperado:** Interface com seletor de vozes disponíveis no navegador do usuário, com pré-visualização e fallback amigável.
- **Critérios de Aceitação:** Modal ou seletor de voz testado em Chrome, Firefox e Edge.

---

## 3. MATRIZ DE RASTREABILIDADE (SPRINT 1)

| ID Tarefa | Tipo | Responsável | Status | Branch | PR Associado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CTFL-101** | Governança | DevOps | Em desenvolvimento | `feature/ciclo-1-governanca-qualidade` | - |
| **CTFL-102** | Conteúdo/Dev | PO / Dev | Pronto para dev | `feature/ciclo-1-governanca-qualidade` | - |
| **CTFL-103** | QA/CI | QA / DevOps | Pronto para dev | `feature/ciclo-1-governanca-qualidade` | - |
| **CTFL-104** | Performance | QA | Backlog | - | - |
| **CTFL-105** | UX/Frontend | Dev | Backlog | - | - |
