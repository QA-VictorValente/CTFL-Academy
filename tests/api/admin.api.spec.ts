import { test, expect } from '@playwright/test';

test.describe.serial('API Suite — Segurança & RBAC Administrativo (/api/admin)', () => {
  const student = {
    fullName: 'Aluno RBAC Teste',
    email: `student.rbac.${Date.now()}@ctfl.local`,
    password: 'SenhaEstudante123!',
  };

  test.beforeAll(async ({ request }) => {
    await request.post('/api/auth/register', { data: student });
  });

  test('GET /api/admin/questions — Rejeita acesso anônimo com HTTP 401', async ({ request }) => {
    const res = await request.get('/api/admin/questions', { headers: { cookie: '' } });
    expect(res.status()).toBe(401);
  });

  test('GET /api/admin/questions — Bloqueia perfil STUDENT com HTTP 403 (Forbidden)', async ({ request }) => {
    await request.post('/api/auth/login', {
      data: { email: student.email, password: student.password },
    });

    const res = await request.get('/api/admin/questions');
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/Acesso negado|Permissão/i);
  });

  test('GET /api/admin/questions — Concede acesso 200 para usuário com role ADMIN', async ({ request }) => {
    // Autentica como administrador padrão
    const loginAdmin = await request.post('/api/auth/login', {
      data: {
        email: 'admin@ctfl.local',
        password: 'AdminCTFL2026!',
      },
    });
    expect(loginAdmin.status()).toBe(200);

    const res = await request.get('/api/admin/questions');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
  });

  test('POST /api/admin/flashcards — Bloqueia estudante com 403 e valida RBAC', async ({ request }) => {
    // 1. Testa como estudante autenticado (deve receber 403)
    await request.post('/api/auth/login', {
      data: { email: student.email, password: student.password },
    });
    const studentRes = await request.post('/api/admin/flashcards', {
      data: {
        front: 'O que é teste?',
        back: 'Processo de validação e verificação.',
      },
    });
    expect(studentRes.status()).toBe(403);

    // 2. Testa como admin (obtem um chapterId e topicId existentes)
    await request.post('/api/auth/login', {
      data: { email: 'admin@ctfl.local', password: 'AdminCTFL2026!' },
    });
    const listRes = await request.get('/api/admin/questions');
    const listBody = await listRes.json();
    const sampleItem = listBody.items?.[0];

    const adminRes = await request.post('/api/admin/flashcards', {
      data: {
        chapterId: sampleItem?.chapterId,
        topicId: sampleItem?.topicId,
        front: 'O que é teste de regressão no Syllabus?',
        back: 'Teste realizado para garantir que alterações não introduziram novos defeitos.',
        tags: ['Regressão', 'CTFL'],
        difficulty: 'MEDIUM',
        isPublished: true,
      },
    });
    expect(adminRes.status()).toBe(201);
  });
});
