# BACKLOG CANÔNICO DO PROJETO CTFL ACADEMY (PADRÃO CLICKUP)
**Versão:** 1.0.1 | **Gerenciado por:** Scrum Master & Orquestrador da Equipe Multiagente  
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
- **Status:** Concluído
- **Prioridade:** Alta
- **Responsável:** DevOps Engineer
- **Contexto e Justificativa:** O projeto necessita de rastreabilidade formal e proteção contra commits diretos desavisados na branch principal, além de padronizar a submissão de Pull Requests com checklist de qualidade.
- **Comportamento Atual:** Fluxo padronizado estabelecido na branch `feature/ciclo-1-governanca-qualidade`, com template de PR e rastreabilidade por commits semânticos.
- **Comportamento Esperado:** Fluxo padronizado baseado em branches `feature/*`, `fix/*` e `chore/*`, com template de PR exigindo evidências de testes do Quality Gate.
- **Critérios de Aceitação:**
  1. Criação do template de Pull Request em `.github/pull_request_template.md`. (Atendido)
  2. Documentação da estratégia de branches e convenção de commits convencionais (`feat:`, `fix:`, `test:`, `ci:`). (Atendido)
  3. Todas as modificações anteriores do pipeline integradas e versionadas com mensagens semânticas. (Atendido)
- **Evidências:** Commit `e9d17ae` e template em `.github/pull_request_template.md`.
- **Testes Relacionados:** Verificação de status do Git e execução de `npm run pipeline`.
- **Dependências / Bloqueios:** Nenhum bloqueio.

---

### [CTFL-102] Expansão do Banco de Questões Oficiais CTFL v4.0.1 (K1, K2 e K3)
- **Tipo:** Feature / Conteúdo Educacional
- **Status:** Concluído
- **Prioridade:** Alta
- **Responsável:** Product Owner & Desenvolvedor de Software
- **Contexto e Justificativa:** O banco continha 55 questões publicadas. Para um exame padrão de 40 questões, realizar 2 simulados consecutivos gerava sobreposição excessiva de questões para o estudante.
- **Comportamento Atual:** 80 questões persistidas (78 publicadas e 2 em moderação), garantindo ampla variabilidade para exames consecutivos de 40 questões.
- **Comportamento Esperado:** Inclusão de 25 novas questões originais de alta fidelidade técnica cobrindo todos os capítulos (Capítulos 1 ao 6) e objetivos de aprendizagem (K1, K2, K3), elevando o total do banco para 80 questões.
- **Critérios de Aceitação:**
  1. Cada questão deve possuir código único (`Q-CTFL-xxx`), objetivo de aprendizagem (`FL-x.x.x`), nível cognitivo (`K1`, `K2`, `K3`) e dificuldade. (Atendido)
  2. 4 alternativas (A, B, C, D) com exatamente 1 alternativa correta. (Atendido)
  3. Cada uma das 4 opções deve conter justificativa didática individual explicando por que está certa ou errada. (Atendido)
  4. Explicação geral consolidada com referência direta à seção do Syllabus CTFL v4.0.1. (Atendido)
  5. Carga via seed idempotente sem duplicações (`npm run db:seed`). (Atendido - 80 questões ativas)
- **Evidências:** Commit `e19b257`, fixture `prisma/fixtures/questions-ch-expansion.ts` e log do seed.
- **Testes Relacionados:** `tests/integration/persistence-workflows.test.ts` e `tests/api/exercises.api.spec.ts`.
- **Dependências / Bloqueios:** Nenhum bloqueio.

---

### [CTFL-103] Consolidação do Quality Gate de 7 Estágios na Pipeline de CI
- **Tipo:** Tarefa / QA & DevOps
- **Status:** Concluído
- **Prioridade:** Alta
- **Responsável:** QA Engineer & DevOps Engineer
- **Contexto e Justificativa:** Garantir que nenhuma alteração possa ser mesclada na aplicação caso algum teste unitário, de API, de interface (E2E) ou de desempenho (k6) falhe.
- **Comportamento Atual:** Pipeline estrita executável via `npm run pipeline` validada com 100% de sucesso nas 7 etapas (98.7s).
- **Comportamento Esperado:** Pipeline executável via `npm run pipeline` cobrindo estritamente: ESLint, TypeScript Typecheck, Vitest Unit, Vitest Integration, Playwright API, Playwright Web E2E e k6 Smoke Test.
- **Critérios de Aceitação:**
  1. Script `scripts/run-pipeline.ts` executável com sucesso em ambiente Windows e CI. (Atendido)
  2. Falha em qualquer etapa deve abortar o processo com código de saída != 0. (Atendido)
  3. Sucesso completo em todas as etapas exibe relatório consolidado com resumo de métricas. (Atendido)
- **Evidências:** Commit `ee2ff48` e log terminal da execução do Quality Gate.
- **Testes Relacionados:** Todos os testes das suítes de `tests/`.
- **Dependências / Bloqueios:** Nenhum bloqueio.

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

### [CTFL-105] Aprimoramento da Síntese de Áudio com Fallback de Vozes e Orientação de Vozes Neurais
- **Tipo:** Feature / UX
- **Status:** Concluído
- **Prioridade:** Alta
- **Responsável:** Desenvolvedor de Software & QA
- **Contexto e Justificativa:** A leitura em áudio depende da Web Speech API do navegador. Em navegadores padrão no Windows, vozes robóticas antigas eram frequentemente selecionadas por engano, gerando uma experiência desconfortável para o aluno.
- **Comportamento Atual:** Seletor com ordenação inteligente priorizando vozes neurais de estúdio (Edge Natural e Google Português) no topo, vozes robóticas isoladas no fim com rótulo `[Desktop]`, modal educativo `💡 Vozes HD Grátis` integrado e persistência em `localStorage`.
- **Comportamento Esperado:**
  1. Ordenação inteligente colocando vozes naturais (Edge Natural, Google português, Windows Natural) no topo e vozes antigas no fim com rótulo descritivo. (Atendido)
  2. Botão/modal integrado de ajuda pedagógica ("💡 Dicas de Vozes Humanas Gratuitas") com instruções práticas para Edge, Chrome e Windows. (Atendido)
  3. Persistência da preferência no `localStorage`. (Atendido)
- **Critérios de Aceitação:**
  1. O seletor de vozes exibe badges visuais claras (✨ Natural HD, 🌸 Feminina Calma, 🌐 Google Online, 🖥️ Desktop). (Atendido)
  2. Modal informativo abre e fecha sem quebrar a leitura nem interferir no layout fixo. (Atendido)
  3. Preferência de voz persiste entre trocas de página. (Atendido)
  4. Suíte de testes unitários e de interface valida a ausência de regressões. (Atendido)
- **Evidências:** Commit rastreável e validação com 100% de aprovação no Vitest, Playwright e k6.
- **Testes Relacionados:** `tests/web/student-journey.web.spec.ts`, `npm run typecheck` e `npm run lint`.
- **Dependências / Bloqueios:** Nenhum bloqueio.

---

## 3. MATRIZ DE RASTREABILIDADE

| ID Tarefa | Tipo | Responsável | Status | Branch | PR Associado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CTFL-101** | Governança | DevOps | Concluído | `feature/ciclo-1-governanca-qualidade` | Mergeado na main |
| **CTFL-102** | Conteúdo/Dev | PO / Dev | Concluído | `feature/ciclo-1-governanca-qualidade` | Mergeado na main |
| **CTFL-103** | QA/CI | QA / DevOps | Concluído | `feature/ciclo-1-governanca-qualidade` | Mergeado na main |
| **CTFL-104** | Performance | QA | Backlog | - | - |
| **CTFL-105** | UX/Frontend | Dev | Concluído | `feature/ctfl-105-audio-voices` | Mergeado na main |
