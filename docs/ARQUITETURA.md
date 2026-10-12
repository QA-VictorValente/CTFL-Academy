# Arquitetura do Sistema — CTFL Academy

## 1. Visão Arquitetural em Camadas

O **CTFL Academy** adota uma arquitetura modular monolítica sobre o **Next.js 14 App Router**, garantindo tipagem de ponta a ponta com **TypeScript Strict** e persistência transacional no **PostgreSQL** via **Prisma ORM**:

1. **Camada de Apresentação (`src/app/`, `src/components/`)**:
   - Server Components buscam dados diretamente do banco PostgreSQL com verificação de sessão e autorização no servidor.
   - Client Components gerenciam interações ricas (cronômetro regressivo sincronizado com o servidor, mapa de questões, virada de flashcards, formulários validados com React Hook Form + Zod).
2. **Camada de API / Controle (`src/app/api/`)**:
   - Route Handlers RESTful protegidos por `requireAuth()` e `requireAdmin()`.
   - Rate limiting em memória por IP/rota nas rotas sensíveis de autenticação e submissão.
3. **Camada de Domínio (`src/lib/`)**:
   - `exam-engine.ts`: Seleção determinística/aleatória de questões, balanceamento de tópicos, proteção de grupos de equivalência, embaralhamento seguro de alternativas e cálculo de nota.
   - `exam-service.ts`: Finalização transacional e idempotente de tentativas de prova.
   - `question-workflow.ts`: Máquina de estados editorial (`DRAFT` → `IN_REVIEW` → `APPROVED` → `PUBLISHED` / `REJECTED` / `ARCHIVED`).
   - `gamification.ts`: Motor transacional de XP, ofensiva diária (*streak*) e desbloqueio automático de conquistas.
   - `spaced-repetition.ts`: Algoritmo de repetição espaçada para flashcards.
4. **Camada de Persistência (`prisma/schema.prisma`)**:
   - 22 tabelas relacionais normalizadas com chaves estrangeiras, índices compostos e snapshots históricos JSON (`ExamQuestion`, `QuestionRevision`) para preservar imutabilidade de provas realizadas.
