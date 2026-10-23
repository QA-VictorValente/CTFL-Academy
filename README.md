# CTFL Academy — Plataforma Completa de Preparação ISTQB CTFL v4.0.1

Plataforma web full-stack, gratuita, 100% open source e livre de dependências de IA, projetada para a preparação completa de engenheiros de qualidade (QA) e estudantes para o exame oficial **ISTQB® Certified Tester Foundation Level (CTFL) v4.0.1**.

---

## 1. Visão Geral do Projeto

O **CTFL Academy** integra em uma única aplicação:
- **Currículo Oficial Completo (Syllabus 4.0.1)**: Os 6 capítulos oficiais, 22 tópicos numerados (`1.1` a `6.2`), objetivos de aprendizagem (`FL-1.1.1` a `FL-6.2.1`), níveis cognitivos (`K1`, `K2`, `K3`), glossário técnico, exemplos aplicados a sistemas web/APIs/bancos de dados e aplicação na rotina real de QA.
- **Exercícios de Fixação**: Resolução interativa com feedback imediato, justificativa por alternativa e referência direta à seção do Syllabus.
- **Flashcards com Repetição Espaçada**: Algoritmo determinístico inspirado no SM-2 (`EASY`, `MEDIUM`, `HARD`) persistido no PostgreSQL, com agendamento da próxima revisão.
- **Central de Simulados**:
  1. **Simulado Completo CTFL v4.0**: 40 questões distribuídas conforme matriz oficial (`Cap. 1: 8`, `Cap. 2: 6`, `Cap. 3: 4`, `Cap. 4: 12`, `Cap. 5: 8`, `Cap. 6: 2`), 60 minutos (ou 75 min com bônus oficial de +25% para idioma não-nativo) e aprovação com **26 pontos (65%)**.
  2. **Simulado por Capítulo**: Treino focado em um capítulo específico com cronômetro proporcional.
  3. **Simulado Personalizado**: Seleção customizada por tópico, dificuldade e quantidade de questões.
- **Gamificação Auditável**: Sistema idempotente de XP, ofensiva diária (*streak*) calculada por data calendário real e desbloqueio automático de conquistas/medalhas.
- **Governança e Painel Administrativo**: Controle editorial completo do banco de questões (`DRAFT` → `IN_REVIEW` → `APPROVED` → `PUBLISHED` / `REJECTED` / `ARCHIVED`), versionamento com snapshot imutável, duplicação autoral, edição de aulas, configuração de provas e trilha de auditoria (`AuditLog`).

---

## 2. Arquitetura e Stack Tecnológica

- **Frontend & Backend**: Next.js 14 (App Router), React 18, TypeScript (`strict: true`).
- **Estilização & UI**: Tailwind CSS, componentes acessíveis estilo `shadcn/ui`, Lucide React, suporte a Tema Escuro (padrão) e Tema Claro.
- **Banco de Dados & ORM**: PostgreSQL + Prisma ORM (22 modelos relacionais com integridade referencial e índices de performance).
- **Autenticação & Autorização**: Arquitetura híbrida compatível com `@supabase/ssr` (quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão configurados) e sessão criptográfica local (`scrypt` + cookie `httpOnly` assinado via `HMAC-SHA256`) para execução local autônoma sem serviços externos.
- **Validação**: Zod + React Hook Form.
- **Qualidade & Testes Automatizados**: Vitest (Testes Unitários e de Integração com PostgreSQL), Playwright (Testes E2E), ESLint, Prettier e GitHub Actions CI.

Documentação complementar detalhada disponível na pasta [`docs/`](./docs):
- [`docs/ARQUITETURA.md`](./docs/ARQUITETURA.md)
- [`docs/REGRAS_SIMULADOS.md`](./docs/REGRAS_SIMULADOS.md)
- [`docs/CRITERIOS_XP.md`](./docs/CRITERIOS_XP.md)
- [`docs/SEGURANCA.md`](./docs/SEGURANCA.md)
- [`docs/DIREITOS_E_FONTES.md`](./docs/DIREITOS_E_FONTES.md)

---

## 3. Estrutura de Pastas

```text
├── .github/workflows/ci.yml      # Pipeline de Integração Contínua (GitHub Actions)
├── docs/                         # Documentação técnica, regras de negócio e segurança
├── prisma/
│   ├── schema.prisma             # Modelagem relacional completa (22 tabelas)
│   ├── migrations/               # Histórico de migrações SQL
│   ├── seed.ts                   # Script de seed idempotente
│   └── fixtures/                 # Conteúdo didático PT-BR, 80 questões, 20 flashcards
├── scripts/
│   ├── create-admin.ts           # Provisionamento seguro do primeiro administrador
│   └── local-postgres.ts         # Servidor PostgreSQL local para ambientes sem Docker
├── src/
│   ├── app/
│   │   ├── (student)/            # 15 rotas autenticadas da Área do Estudante
│   │   ├── admin/                # 9 rotas protegidas da Área Administrativa
│   │   ├── api/                  # Route Handlers RESTful (Auth, Simulados, Admin, Perfil)
│   │   └── ...                   # Páginas públicas (Landing, Sobre, Login, Cadastro, Termos, Privacidade, 404)
│   ├── components/
│   │   ├── admin/                # Gerenciadores administrativos interativos
│   │   ├── layout/               # AppShell, Sidebar, Header, Footer, ThemeToggle
│   │   ├── providers/            # ThemeProvider e ToastProvider
│   │   ├── student/              # ExamRunner, ExamLauncher, LessonViewer, FlashcardsStudy
│   │   └── ui/                   # Design System reutilizável
│   └── lib/                      # Regras de domínio, motor de provas, gamificação, auth e validação
└── tests/
    ├── unit/                     # Testes unitários (Vitest)
    ├── integration/              # Testes de integração com PostgreSQL (Vitest)
    └── e2e/                      # Testes ponta a ponta (Playwright)
```

---

## 4. Requisitos de Ambiente e Variáveis (`.env`)

- **Node.js**: `v20.x` (recomendado) ou superior.
- **PostgreSQL**: `v15+` (via `docker compose up -d` ou via script local `npm run db:local`).

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Variáveis de ambiente suportadas:
| Variável | Descrição |
| :--- | :--- |
| `DATABASE_URL` | String de conexão PostgreSQL (`postgresql://ctfl_user:ctfl_password@localhost:5432/ctfl_academy?schema=public`) |
| `DIRECT_URL` | String de conexão direta para migrações Prisma |
| `AUTH_SECRET` | Chave secreta (mín. 32 caracteres) para assinatura HMAC-SHA256 do cookie `httpOnly` |
| `NEXT_PUBLIC_APP_URL` | URL local da aplicação (`http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | *(Opcional)* URL do projeto Supabase para integração `@supabase/ssr` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Opcional)* Chave anônima do projeto Supabase |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciais usadas exclusivamente pelo script local `npm run admin:create` |

---

## 5. Passo a Passo para Execução Local

### 5.1. Instalar dependências
```bash
npm install
```

### 5.2. Iniciar o Banco de Dados PostgreSQL
**Opção A — Com Docker Compose (recomendado quando Docker estiver instalado):**
```bash
docker compose up -d
```

**Opção B — Sem Docker (PostgreSQL local embarcado na porta 5432):**
```bash
npm run db:local
```

### 5.3. Executar Migrations e Seed Idempotente
```bash
npx prisma migrate deploy
npm run db:seed
```
> O seed pode ser executado múltiplas vezes sem duplicar capítulos, tópicos, aulas, questões, flashcards ou conquistas.

### 5.4. Criar o Primeiro Administrador
Nunca promovemos usuários automaticamente pelo navegador. Execute o script administrativo explícito:
```bash
npm run admin:create
```
- **E-mail padrão**: `admin@ctfl.local`
- **Senha padrão**: `AdminCTFL2026!`

### 5.5. Iniciar a Aplicação
```bash
npm run dev
```
Acesse `http://localhost:3000`.

---

## 6. Execução dos Testes Automatizados e Qualidade

```bash
# Verificação estrita de tipos TypeScript
npm run typecheck

# Padronização de código ESLint
npm run lint

# Testes Unitários e de Integração (Vitest + PostgreSQL)
npm run test

# Build de produção Next.js
npm run build

# Testes End-to-End (Playwright)
npm run test:e2e
```
