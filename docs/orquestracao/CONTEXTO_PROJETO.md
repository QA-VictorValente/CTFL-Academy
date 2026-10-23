# Documento Central de Contexto — CTFL Academy (Orquestração Multiagente)

**Última atualização:** 2026-10-22  
**Mantido por:** Equipe Multiagente CTFL Academy (`po`, `scrum-master`, `desenvolvedor`, `qa`, `devops`)  
**Objetivo:** Servir como fonte única de contexto compartilhado e persistente entre sessões do OMP para todos os agentes dedicados ao projeto.

---

## 1. Visão do Produto e Propósito

O **CTFL Academy** é uma plataforma web full-stack, gratuita, open source e auto-hospedável para preparação completa de engenheiros de qualidade (QA) e estudantes para o exame oficial **ISTQB® Certified Tester Foundation Level (CTFL) v4.0.1**.

### Público-Alvo e Perfis (`Role`)
1. **Estudante (`STUDENT`):**
   - Estuda os 6 capítulos e 22 tópicos oficiais do Syllabus v4.0.1 (`1.1` a `6.2`, objetivos `FL-1.1.1` a `FL-6.2.1`, níveis cognitivos `K1`, `K2`, `K3`).
   - Faz anotações em caderno flutuante, mapas mentais e ouve aulas em áudio com priorização de vozes neurais HD.
   - Pratica com exercícios de fixação comentados alternativa por alternativa (`A`, `B`, `C`, `D`).
   - Revisa conceitos com Flashcards baseados no algoritmo de repetição espaçada SuperMemo SM-2 (`EASY`, `MEDIUM`, `HARD`).
   - Realiza Simulados Oficiais (40 questões, 60 min ou 75 min com +25% idioma não-nativo, aprovação $\ge 65\%$), Simulados por Capítulo e Treinos Personalizados.
   - Acompanha evolução no Dashboard, Histórico de Tentativas, Caderno de Erros (`/revisao-erros`) e sistema de Gamificação (XP idempotente, *streak* diário e conquistas).
2. **Administrador & Curador (`ADMIN`):**
   - Gerencia o ciclo de vida editorial das questões (`DRAFT` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `PUBLISHED` / `REJECTED` / `ARCHIVED`) com versionamento imutável.
   - Edita aulas, configura parâmetros de exames, gerencia usuários e audita operações via `AuditLog` (`/admin/auditoria`).

---

## 2. Arquitetura Técnica e Stack (`docs/ARQUITETURA.md`)

O sistema segue uma **Clean Layered Architecture** em 3 camadas principais + camada compartilhada sobre **Next.js 14.2.15 (App Router)**, **React 18.3.1**, **TypeScript 5.6.3 (`strict: true`)**, **Tailwind CSS 3.4.14** e **Prisma 5.22.0 + PostgreSQL**:

| Camada | Diretório / Alias | Responsabilidade e Regra Arquitetural |
|---|---|---|
| **Compartilhada** | `src/shared/` (`@shared/*`) | DTOs (`types`), Schemas Zod (`validations`), Constantes do Syllabus/XP (`constants`) e utilitários (`utils`). |
| **Frontend** | `src/frontend/` (`@frontend/*`) e `src/components/` | Clientes HTTP tipados (`@frontend/api-clients/*`) e componentes React (`student/`, `admin/`, `layout/`, `ui/`). **Nunca acessa Prisma/DB diretamente.** |
| **Rotas HTTP** | `src/app/api/**/route.ts` | *Thin Route Handlers*: apenas repassam a requisição para `@backend/controllers/*`. |
| **Backend** | `src/backend/` (`@backend/*`) | Controllers (validação Zod + status HTTP), Middlewares (`requireAuth`, `requireAdmin`, `checkRateLimit`), Domain Services puros (`@backend/services/*`) e Prisma/Caches (`@backend/db/*`). |
| **Persistência** | `prisma/schema.prisma` | 22 modelos relacionais no PostgreSQL, migrações versionadas e seed idempotente (`prisma/seed.ts` — 80 questões, 20 flashcards, 6 capítulos, 22 tópicos). |

---

## 3. Invariantes Críticas de Domínio e Segurança

1. **Matriz Oficial do Simulado CTFL v4.0.1 (`docs/REGRAS_SIMULADOS.md`):**
   - 40 questões por prova oficial: **Cap. 1 (8)**, **Cap. 2 (6)**, **Cap. 3 (4)**, **Cap. 4 (12)**, **Cap. 5 (8)**, **Cap. 6 (2)**.
   - Nota de corte: **26 acertos (65%)**. Duração: **60 min** (ou **75 min** com extensão de +25%).
   - Elegibilidade: apenas questões `PUBLISHED` com `deletedAt: null` e sem repetir mesmo `equivalenceGroupId` na mesma prova.
2. **Sigilo de Gabarito e Timer Autoritativo (`docs/SEGURANCA.md`):**
   - Enquanto `ExamAttempt.status === 'IN_PROGRESS'`, nenhum endpoint retorna `correctDisplayLabel`, `isCorrect` ou `explanationSnapshot`.
   - O tempo restante é calculado no servidor via `startedAt` e `expiresAt`.
3. **Prevenção de IDOR e RBAC:**
   - Operações de estudante filtram obrigatoriamente por `{ userId: user.id }`.
   - Rotas `/admin/*` e `/api/admin/*` exigem `requireAdmin()` no servidor e gravam `AuditLog`.
4. **Idempotência de XP (`docs/CRITERIOS_XP.md`):**
   - Toda concessão de XP usa `XPEvent.idempotencyKey` em transação Prisma (`LESSON_COMPLETED`: +30, `EXERCISE_CORRECT`: +15, `FLASHCARD_REVIEWED`: +5/dia UTC, `EXAM_COMPLETED`: +80, `EXAM_PASSED`: +150).
5. **Diretrizes de UI, Design e Acessibilidade (`AGENTS.md`):**
   - Respeitar tokens de `tailwind.config.ts` e `src/app/globals.css`.
   - Lente **Emil Kowalski** para telas de estudo/simulado (velocidade e contenção; zero animações distrativas durante provas cronometradas) e **Jakub Krehel** para polimento sutil em modais/toasts.
   - Obrigatório respeitar `@media (prefers-reduced-motion: reduce)` (`motion-safe:` / `motion-reduce:`) e animar apenas `transform` e `opacity`.

---

## 4. Mapa de Documentos Persistentes da Equipe

| Documento | Caminho | Papel na Orquestração | Responsável Principal |
|---|---|---|---|
| **Contexto Central** | `docs/orquestracao/CONTEXTO_PROJETO.md` | Visão geral, stack, invariantes e índice de governança | Todos os agentes |
| **Manual de Orquestração** | `docs/orquestracao/MANUAL_ORQUESTRACAO.md` | Fluxo de 13 etapas, modos de operação, comandos e regras de autonomia | `scrum-master` |
| **Backlog Canônico** | `docs/CLICKUP_BACKLOG.md` | Product & Sprint Backlog com prioridades, status, critérios e rastreabilidade | `po` & `scrum-master` |
| **Decisões (ADR / PDR)** | `docs/orquestracao/DECISOES_ADR_PDR.md` | Registro histórico de decisões arquiteturais (ADR) e de produto (PDR) | `po`, `desenvolvedor`, `devops` |
| **Registro de QA e Defeitos** | `docs/orquestracao/REGISTRO_QA_DEFEITOS.md` | Casos de teste, execuções de Quality Gate, bugs (`BUG-xxx`) e bloqueios | `qa` |
| **Histórico de Execução** | `docs/orquestracao/HISTORICO_EXECUCAO.md` | Log cronológico das sessões multiagente, entregas e estado atual | `scrum-master` |
| **Protocolo de Retomada** | `docs/orquestracao/PROTOCOLO_RETOMADA.md` | Passo a passo para retomar tarefas interrompidas entre sessões | `scrum-master` |
| **Arquitetura Técnica** | `docs/ARQUITETURA.md` | Guia detalhado das camadas `@shared`, `@backend`, `@frontend` e API | `desenvolvedor` |
| **Roteiro de Testes QA** | `docs/ROTEIRO_DE_TESTES_QA.md` | Checklist ponta a ponta de testes (CT-01.1 a CT-30.1) | `qa` |

---

## 5. Os Cinco Agentes Dedicados (`.omp/agents/`)

| Slug (`agent`) | Arquivo de Instruções | Papel Central | Pode Editar Código (`src/`, `prisma/`)? |
|---|---|---|---|
| `po` | `.omp/agents/po.md` | Product Owner: valor, backlog, histórias, critérios de aceitação e aceite final | **Não** (apenas docs de produto/backlog) |
| `scrum-master` | `.omp/agents/scrum-master.md` | Scrum Master: fluxo, etapas, dependências, DoR/DoD, histórico e consolidação | **Não** (apenas docs de gestão/backlog) |
| `desenvolvedor` | `.omp/agents/desenvolvedor.md` | Desenvolvedor Full-Stack: arquitetura, código, testes automatizados e correções | **Sim** (mediante autorização de execução) |
| `qa` | `.omp/agents/qa.md` | Quality Assurance: análise preventiva, planos/execução de testes, bugs e reteste | **Apenas `tests/`** (quando autorizado) e `REGISTRO_QA_DEFEITOS.md` |
| `devops` | `.omp/agents/devops.md` | DevOps: build, typecheck, lint, Prisma, ambientes e pipeline CI/CD | **Apenas infra/CI/scripts** (quando autorizado) |

> **Nota sobre segurança:** Nenhum documento de orquestração deve jamais armazenar senhas reais, tokens de API, `AUTH_SECRET` de produção ou dados sensíveis.
