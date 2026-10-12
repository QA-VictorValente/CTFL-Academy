# Práticas de Segurança Implementadas

## 1. Autenticação e Sessão Segura

- Senhas armazenadas exclusivamente com hash criptográfico `scrypt` e *salt* aleatório de 16 bytes (`src/lib/auth.ts`), com comparação em tempo constante (`crypto.timingSafeEqual`).
- Sessão mantida em cookie `httpOnly`, `sameSite: lax` e `secure` (em produção), assinado via `HMAC-SHA256` com `AUTH_SECRET`, prevenindo adulteração no cliente.
- Compatibilidade nativa com `@supabase/ssr` quando configurado com projeto Supabase.

## 2. Controle de Acesso Baseado em Papéis (RBAC) e Prevenção de IDOR

- Dois perfis estritos no servidor: `STUDENT` e `ADMIN`.
- Nenhum campo de formulário ou requisição pública permite definir `role: 'ADMIN'`. O primeiro administrador só pode ser provisionado localmente via `npm run admin:create`.
- Todas as rotas `/admin/*` e `/api/admin/*` verificam `requireAdmin()` no servidor e registram eventos em `AuditLog`.
- Todas as consultas e submissões de simulados (`/api/exams/[id]`, `/api/exams/[id]/answer`, `/api/exams/[id]/submit`) filtram obrigatoriamente por `{ id: attemptId, userId: user.id }`, impedindo *Insecure Direct Object Reference* (IDOR).

## 3. Integridade das Provas e Proteção contra Automação Abusiva

- **Cronômetro Autoritativo no Servidor**: O tempo restante é calculado a partir de `startedAt` e `expiresAt` gravados no PostgreSQL (`calculateServerTimer`), ignorando manipulação do relógio local do navegador.
- **Ocultação Estrita de Gabarito**: O endpoint `/api/exams/[id]` omite `correctDisplayLabel`, `isCorrect` e `explanationSnapshot` enquanto o simulado estiver `IN_PROGRESS`.
- **Rate Limiting**: Aplicado nas rotas de autenticação (`/api/auth/login`, `/api/auth/register`, `/api/auth/recover`).
- **Headers HTTP de Segurança**: Configurados em `next.config.mjs` (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).
