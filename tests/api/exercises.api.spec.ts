import { test, expect } from '@playwright/test';

test.describe('API Suite — Exercícios de Fixação (/api/exercises)', () => {
  const studentCredentials = {
    fullName: 'Aluno Exercicios API',
    email: `student.exercises.${Date.now()}@ctfl.local`,
    password: 'SenhaExercicios123!',
  };

  test.beforeAll(async ({ request }) => {
    // Registra e autentica o aluno
    const regRes = await request.post('/api/auth/register', {
      data: studentCredentials,
    });
    expect([201, 409]).toContain(regRes.status());
  });

  test('POST /api/exercises/answer — Bloqueia acesso anônimo com HTTP 401', async ({ request }) => {
    const unauthContext = await request.post('/api/exercises/answer', {
      headers: { cookie: '' },
      data: { questionId: 'q-random-123', selectedLabel: 'A' },
    });

    expect(unauthContext.status()).toBe(401);
  });

  test('POST /api/exercises/answer — Rejeita alternativa inválida com HTTP 400', async ({ request }) => {
    // Faz login
    await request.post('/api/auth/login', {
      data: {
        email: studentCredentials.email,
        password: studentCredentials.password,
      },
    });

    const res = await request.post('/api/exercises/answer', {
      data: { questionId: 'q-1', selectedLabel: 'INVALIDA' },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Dados de resposta inválidos.');
  });

  test('POST /api/exercises/answer — Retorna HTTP 404 para questão inexistente', async ({ request }) => {
    await request.post('/api/auth/login', {
      data: {
        email: studentCredentials.email,
        password: studentCredentials.password,
      },
    });

    const res = await request.post('/api/exercises/answer', {
      data: { questionId: 'id-inexistente-999', selectedLabel: 'A' },
    });

    expect(res.status()).toBe(404);
  });
});
