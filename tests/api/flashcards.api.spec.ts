import { test, expect } from '@playwright/test';

test.describe('API Suite — Flashcards & Repetição Espaçada (/api/flashcards)', () => {
  const student = {
    fullName: 'Aluno Flashcards API',
    email: `student.flashcards.${Date.now()}@ctfl.local`,
    password: 'SenhaFlashcards123!',
  };

  test.beforeAll(async ({ request }) => {
    await request.post('/api/auth/register', { data: student });
  });

  test('POST /api/flashcards/review — Rejeita requisição não autenticada com HTTP 401', async ({ request }) => {
    const unauthContext = await request.post('/api/flashcards/review', {
      headers: { cookie: '' },
      data: { flashcardId: 'card-1', rating: 'EASY' },
    });
    expect(unauthContext.status()).toBe(401);
  });

  test('POST /api/flashcards/review — Rejeita dados de rating inválidos com HTTP 400', async ({ request }) => {
    await request.post('/api/auth/login', {
      data: { email: student.email, password: student.password },
    });

    const res = await request.post('/api/flashcards/review', {
      data: { flashcardId: 'card-1', rating: 'SUPER_FACIL' },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Dados de revisão');
  });

  test('POST /api/flashcards/reset — Rejeita ausência de flashcardId com HTTP 400', async ({ request }) => {
    await request.post('/api/auth/login', {
      data: { email: student.email, password: student.password },
    });

    const res = await request.post('/api/flashcards/reset', {
      data: {},
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('flashcardId é obrigatório.');
  });
});
