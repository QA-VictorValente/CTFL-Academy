import { test, expect } from '@playwright/test';

test.describe.serial('API Suite — Autenticação & Sessão (/api/auth)', () => {
  const testStudent = {
    fullName: 'Aluno API Teste',
    email: `api.student.${Date.now()}@ctfl.local`,
    password: 'SenhaSeguraAPI123!',
  };

  test('POST /api/auth/register — Rejeita dados inválidos com HTTP 400', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      data: {
        fullName: 'A',
        email: 'email-invalido',
        password: '123',
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test('POST /api/auth/register — Cadastra novo aluno com sucesso e status HTTP 201', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      data: testStudent,
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(testStudent.email.toLowerCase());
    expect(body.user.role).toBe('STUDENT');
  });

  test('POST /api/auth/register — Bloqueia e-mail duplicado com HTTP 409', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      data: testStudent,
    });

    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.error).toContain('já está cadastrado');
  });

  test('POST /api/auth/login — Rejeita credenciais inválidas com HTTP 401', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: {
        email: testStudent.email,
        password: 'SenhaErrada123!',
      },
    });

    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Senha incorreta');
  });

  test('POST /api/auth/login e GET /api/auth/me — Autentica e retorna perfil com cookie de sessão', async ({ request }) => {
    const loginRes = await request.post('/api/auth/login', {
      data: {
        email: testStudent.email,
        password: testStudent.password,
      },
    });

    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    expect(loginBody.user).toBeDefined();
    expect(loginBody.user.email).toBe(testStudent.email.toLowerCase());

    // Consulta perfil autenticado com a sessão mantida
    const meRes = await request.get('/api/auth/me');
    expect(meRes.status()).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.user.email).toBe(testStudent.email.toLowerCase());
    expect(meBody.user.fullName).toBe(testStudent.fullName);
  });

  test('POST /api/auth/logout — Encerra a sessão e revoga acesso ao GET /api/auth/me', async ({ request }) => {
    // 1. Faz login
    await request.post('/api/auth/login', {
      data: {
        email: testStudent.email,
        password: testStudent.password,
      },
    });

    // 2. Faz logout
    const logoutRes = await request.post('/api/auth/logout');
    expect(logoutRes.status()).toBe(200);

    // 3. Verifica que a sessão não existe mais
    const meRes = await request.get('/api/auth/me');
    expect(meRes.status()).toBe(401);
  });
});
