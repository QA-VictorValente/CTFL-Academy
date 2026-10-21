import { test, expect } from '@playwright/test';

test.describe('API Suite — Caderno de Anotações & Mapas Mentais (/api/notes)', () => {
  const student = {
    fullName: 'Aluno Anotacoes API',
    email: `student.notes.${Date.now()}@ctfl.local`,
    password: 'SenhaNotas123!',
  };

  test.beforeAll(async ({ request }) => {
    await request.post('/api/auth/register', { data: student });
  });

  test('GET /api/notes — Requer autenticação (HTTP 401)', async ({ request }) => {
    const unauth = await request.get('/api/notes', { headers: { cookie: '' } });
    expect(unauth.status()).toBe(401);
  });

  test('POST /api/notes — Rejeita anotação sem título com HTTP 400', async ({ request }) => {
    await request.post('/api/auth/login', {
      data: { email: student.email, password: student.password },
    });

    const res = await request.post('/api/notes', {
      data: { content: 'Texto sem título' },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('título da anotação');
  });

  test('POST /api/notes — Cria nova anotação com sucesso (HTTP 201)', async ({ request }) => {
    await request.post('/api/auth/login', {
      data: { email: student.email, password: student.password },
    });

    const res = await request.post('/api/notes', {
      data: {
        title: 'Princípio dos Defeitos Agrupados (Pareto 80/20)',
        content: 'Cerca de 80% dos defeitos estão concentrados em 20% dos módulos do sistema.',
        type: 'NOTE',
        tags: ['Capítulo 1', 'Pareto', 'ISTQB'],
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.note).toBeDefined();
    expect(body.note.title).toBe('Princípio dos Defeitos Agrupados (Pareto 80/20)');
  });

  test('POST /api/notes/to-flashcard — Converte anotação em Flashcard com HTTP 201', async ({ request }) => {
    await request.post('/api/auth/login', {
      data: { email: student.email, password: student.password },
    });

    const res = await request.post('/api/notes/to-flashcard', {
      data: {
        front: 'O que diz o princípio do Agrupamento de Defeitos no CTFL?',
        back: 'Um pequeno número de módulos geralmente contém a maioria dos defeitos descobertos.',
        tags: ['Princípios de Teste', 'Flashcard'],
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.flashcard).toBeDefined();
    expect(body.flashcard.front).toContain('Agrupamento de Defeitos');
  });
});
