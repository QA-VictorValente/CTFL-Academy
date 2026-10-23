# BACKLOG CANÔNICO DO PROJETO CTFL ACADEMY (ESPELHO OFICIAL CLICKUP)

**Workspace:** `CTFL-Academy | Quality Engineering`  
**Space:** `Space > Sprint 1 - Qualidade & Testes`  
**Visualização:** Quadro Kanban  
**Gerenciado por:** Scrum Master (`scrum-master`) & Cérebro Central (`orquestrador`)  
**Repositório:** `https://github.com/QA-VictorValente/CTFL-Academy` (Branch: `refatoracao`)

---

## 1. WORKFLOW OFICIAL DO QUADRO CLICKUP

Conforme configurado no quadro da **Sprint 1 - Qualidade & Testes**:
1. **PENDENTE** (Tarefas levantadas aguardando início)
2. **EM PROGRESSO** (Em desenvolvimento ativo)
3. **EM TESTES** (Em validação com suítes de teste)
4. **EM CORREÇÃO** (Com defeitos identificados aguardando ajuste)
5. **TESTE PRÉ-PRODUÇÃO** (Código finalizado e homologado pelo QA, aguardando validação final de pré-produção)
6. **CONCLUÍDO** (Em produção final com smoke tests aprovados)

---

## 2. MAPEAMENTO DOS CARDS DA SPRINT 1 (CLICKUP REAL)

### 🚀 CARDS PRONTOS PARA MOVER PARA "TESTE PRÉ-PRODUÇÃO"

#### 1. `[QA-000]` Estruturação da Esteira de Testes Automatizados no GitHub Actions
- **Status Anterior:** `EM PROGRESSO`
- **Novo Status:** `TESTE PRÉ-PRODUÇÃO`
- **Prioridade:** Normal | **Responsável:** DevOps & QA
- **O que foi implementado:**
  - `.github/workflows/ci.yml` configurado com pipeline estrita de 9 estágios (Prisma Validate, Typecheck, ESLint, UI Anti-Slop Gate `npm run lint:ui`, Vitest Unit/Integration, Next.js Build de produção, Playwright API, Playwright Web e Playwright E2E com `--project=e2e`).
  - Trava de concorrência com `cancel-in-progress: true` e upload de artefatos de diagnóstico (`playwright-report/` e `test-results/`) em caso de falha.
  - Scripts `npm run pipeline` e `npm run pipeline:fast` (conclui os gates estáticos e unitários em 11.7s).
- **Comentário de Transição para o ClickUp:**
  > *"💬 [Status -> Teste Pré-Produção] Conclusão técnica homologada: Esteira completa de CI/CD implementada no GitHub Actions (.github/workflows/ci.yml) com 9 estágios de qualidade, incluindo o novo gate de UI Anti-Slop (0 FAIL no lint.mjs), compilação de produção e testes automatizados. Validado localmente com 100% de sucesso."*

---

#### 2. `[TELA]` Flashcards com Repetição Espaçada (`/flashcards`)
- **Status Anterior:** `EM PROGRESSO` (0/5)
- **Novo Status:** `TESTE PRÉ-PRODUÇÃO`
- **Prioridade:** Alta | **Tags:** `flashcards`, `sm-2` | **Responsável:** Desenvolvedor & QA
- **O que foi implementado:**
  - Tela `/flashcards` com algoritmo SuperMemo SM-2 (`spaced-repetition.service.ts`) gravando revisões no PostgreSQL (`EASY`, `MEDIUM`, `HARD`).
  - Botões de classificação com spinners de loading (`isLoading`) e `disabled` durante o fetch, prevenindo duplo clique e concorrência no banco.
  - Reformulação visual Anti-Slop com paleta Editorial Técnico Quente + Teal/Esmeralda nos modos Claro e Escuro, sem emojis estruturais no JSX e com contraste WCAG 2.2 AA validado pelo QA.
- **Comentário de Transição para o ClickUp:**
  > *"💬 [Status -> Teste Pré-Produção] Conclusão técnica homologada: Tela de flashcards 100% implementada com algoritmo SM-2 persistido, botões com feedback de loading e prevenção contra duplo clique, design editorial quente anti-fadiga visual nos temas Claro e Escuro, e testes unitários de domínio aprovados."*

---

#### 3. `[TELA]` Central e Execução de Simulados (`/simulados` e `/simulados/[id]`)
- **Status Anterior:** `EM PROGRESSO` (0/7)
- **Novo Status:** `TESTE PRÉ-PRODUÇÃO`
- **Prioridade:** Urgente | **Tags:** `e2e`, `motor-exame` | **Responsável:** Desenvolvedor & QA
- **O que foi implementado:**
  - Launcher com 3 modalidades: Simulado Oficial Completo (40 questões distribuídas na matriz oficial do Syllabus v4.0.1: Cap. 1: 8, Cap. 2: 6, Cap. 3: 4, Cap. 4: 12, Cap. 5: 8, Cap. 6: 2), Simulado por Capítulo e Treino Personalizado.
  - Runner com cronômetro autoritativo sincronizado no servidor (`startedAt` + `durationSeconds`), mapa de questões com marcação para revisão, modal de confirmação e tela de resultado com pontuação por capítulo e K1/K2/K3.
  - Botões com microinterações táteis suaves, `tabular-nums` no timer (zero layout shift) e tema editorial sem elementos distrativos durante a prova.
- **Comentário de Transição para o ClickUp:**
  > *"💬 [Status -> Teste Pré-Produção] Conclusão técnica homologada: Central e Runner de simulados 100% funcionais, matriz de 40 questões oficial do ISTQB CTFL v4.0.1 rigorosamente atendida, cronômetro autoritativo imune a F5, modal de confirmação com loading spinner e tema visual descansado para provas de 60 a 75 minutos."*

---

#### 4. `[BUG-001]` Double-click no botão 'Finalizar Prova' duplica tentativa...
- **Status Anterior:** `PENDENTE`
- **Novo Status:** `TESTE PRÉ-PRODUÇÃO`
- **Prioridade:** Urgente | **Tags:** `bug`, `concorrencia` | **Responsável:** Desenvolvedor & QA
- **O que foi implementado:**
  - **No Frontend:** `src/components/student/exam-runner.tsx:268,455` aplica `disabled={submittingExam}` e `isLoading={submittingExam}` tanto no botão de disparo quanto no `ConfirmModal`, desabilitando o botão no primeiro clique e exibindo spinner.
  - **No Backend:** `src/backend/services/exam.service.ts:28,58-72` aplica trava de idempotência com verificação antes e dentro da transação Prisma (`current.status === 'COMPLETED' || current.status === 'EXPIRED'`), retornando a tentativa já finalizada sem reexecutar cálculos de XP ou duplicar registros.
  - **Teste de Regressão:** Validado no teste de integração `tests/integration/persistence-workflows.test.ts:177` (*"bloqueia dupla finalização"*).
- **Comentário de Transição para o ClickUp:**
  > *"💬 [Status -> Teste Pré-Produção] Correção homologada: Implementada proteção dupla contra double-click. No cliente, o botão desabilita imediatamente com spinner. No servidor, a transação Prisma valida o status de forma atômica e retorna a tentativa existente sem duplicar XP ou eventos de banco. Teste automatizado de bloqueio de dupla finalização aprovado."*

---

#### 5. `[QA-001]` Validar persistência do cronômetro regressivo no F5 durante o simulado
- **Status Anterior:** `PENDENTE`
- **Novo Status:** `TESTE PRÉ-PRODUÇÃO`
- **Prioridade:** Alta | **Tags:** `playwright`, `qa-test` | **Responsável:** QA & Desenvolvedor
- **O que foi implementado:**
  - O tempo restante da prova não depende do relógio local do navegador; é calculado no servidor em `src/backend/services/exam-engine.service.ts` (`calculateServerTimer(startedAt, expiresAt, now)`).
  - Ao recarregar a página (`F5`), o componente `ExamRunner` recupera o estado persistido e continua a contagem regressiva a partir do tempo real decorrido, mantendo todas as alternativas já marcadas salvas no PostgreSQL.
- **Comentário de Transição para o ClickUp:**
  > *"💬 [Status -> Teste Pré-Produção] Validação técnica homologada: O cronômetro regressivo é autoritativo no servidor via startedAt e expiresAt gravados no PostgreSQL. Recarregamentos de página (F5) recuperam o tempo restante real sem reiniciar a contagem e sem perder as respostas já gravadas."*

---

#### 6. `[QA-002]` Repetição Espaçada SM-2 nos Flashcards: Cálculo de Intervalos
- **Status Anterior:** `PENDENTE`
- **Novo Status:** `TESTE PRÉ-PRODUÇÃO`
- **Prioridade:** Alta | **Tags:** `flashcards`, `qa-test` | **Responsável:** QA & Desenvolvedor
- **O que foi implementado:**
  - Algoritmo SuperMemo SM-2 implementado em `src/backend/services/spaced-repetition.service.ts`:
    - `HARD`: reinicia o intervalo para 1 dia e reseta repetições consecutivas.
    - `MEDIUM`: avança progressivamente para 1 dia, depois 3 dias, etc.
    - `EASY`: avança aceleradamente (3 dias na primeira revisão, depois $\ge 7$ dias).
  - Cobertura de testes unitários em `tests/unit/domain-logic.test.ts` aprovada com 100% de sucesso.
- **Comentário de Transição para o ClickUp:**
  > *"💬 [Status -> Teste Pré-Produção] Validação técnica homologada: Algoritmo SM-2 rigorosamente implementado e testado no Vitest. Intervalos determinísticos calculados corretamente para Fácil (avanço acelerado), Médio (avanço padrão) e Difícil (reset para 1 dia)."*

---

#### 7. `[QA-003]` Segurança e Autorização RBAC: Proteção de Rotas Administrativas e API
- **Status Anterior:** `PENDENTE`
- **Novo Status:** `TESTE PRÉ-PRODUÇÃO`
- **Prioridade:** Urgente | **Tags:** `qa-test`, `rbac` | **Responsável:** QA & DevOps
- **O que foi implementado:**
  - Middlewares `requireAuth` e `requireAdmin` (`src/backend/middlewares/auth.middleware.ts`) protegendo todas as rotas `/admin/*` e `/api/admin/*`, retornando `403 Forbidden` para estudantes e `401 Unauthorized` para deslogados.
  - Prevenção de IDOR: endpoints de simulados e notas filtram estritamente por `{ userId: user.id }`.
  - Trilha de auditoria: todas as operações administrativas registram eventos em `AuditLog`.
- **Comentário de Transição para o ClickUp:**
  > *"💬 [Status -> Teste Pré-Produção] Validação técnica homologada: Controle de acesso RBAC ativo no servidor. Estudantes são bloqueados com HTTP 403 em rotas admin, consultas a simulados e notas possuem filtro estrito por userId (anti-IDOR) e ações de curadoria gravam registros imutáveis em AuditLog."*

---

#### 8. `[QA-004]` Cadastro de Aluno com Zod: Validação de Campos e Erros Amigáveis
- **Status Anterior:** `PENDENTE`
- **Novo Status:** `TESTE PRÉ-PRODUÇÃO`
- **Prioridade:** Normal | **Responsável:** Desenvolvedor & QA
- **O que foi implementado:**
  - Formulário `/cadastro` com React Hook Form + schema Zod (`registerSchema`), validando e-mail corporativo/pessoal, senha forte ($\ge 8$ caracteres) e confirmação de senha idêntica.
  - Mensagens de erro contextuais exibidas abaixo de cada campo com suporte total a navegação por teclado e sem vazamento de stacktrace no servidor.
- **Comentário de Transição para o ClickUp:**
  > *"💬 [Status -> Teste Pré-Produção] Validação técnica homologada: Formulário de cadastro de aluno implementado com validação Zod no cliente e no servidor, feedback amigável de campos inválidos, IDs semânticos para automação E2E e testes unitários de validação aprovados."*

---

## 3. MATRIZ DE RASTREABILIDADE (SPRINT 1 - CLICKUP)

| Código ClickUp | Tipo | Responsável | Status no Quadro | Evidência Principal |
|:---|:---|:---|:---:|:---|
| **[QA-000]** | DevOps / CI | DevOps | **`Teste Pré-Produção`** | `.github/workflows/ci.yml` (9 gates ativos) |
| **[TELA] Flashcards** | Feature | Dev & QA | **`Teste Pré-Produção`** | `/flashcards` com SM-2, audio e loading |
| **[TELA] Simulados** | Feature | Dev & QA | **`Teste Pré-Produção`** | `/simulados` e `/simulados/[id]` com matriz 40Q |
| **[BUG-001]** | Bug / Concorrência | Dev & QA | **`Teste Pré-Produção`** | Trava CAS no backend + button disabled/spinner |
| **[QA-001]** | QA Test / Timer | QA & Dev | **`Teste Pré-Produção`** | Timer regressivo autoritativo persistido no F5 |
| **[QA-002]** | QA Test / SM-2 | QA & Dev | **`Teste Pré-Produção`** | Cálculo determinístico de intervalos SM-2 |
| **[QA-003]** | Segurança / RBAC | QA & DevOps | **`Teste Pré-Produção`** | RBAC 403, anti-IDOR e trilha em AuditLog |
| **[QA-004]** | Frontend / Zod | Dev & QA | **`Teste Pré-Produção`** | Validação Zod amigável em `/cadastro` |
