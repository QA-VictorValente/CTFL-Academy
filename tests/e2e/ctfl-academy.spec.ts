import { test, expect } from '@playwright/test';

const studentEmail = `e2e.aluno.${Date.now()}@ctfl.local`;
const studentPassword = 'SenhaSeguraE2E123!';
const studentName = 'Estudante E2E CTFL';

test.describe.serial('CTFL Academy — Fluxos Completos E2E (18 Cenários)', () => {
  test('1 a 8. Landing Page, Cadastro, Login, Dashboard, Capítulo, Aula, Exercícios e Flashcards', async ({
    page,
  }) => {
    // 1. Abrir a landing page
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: /ISTQB CTFL/i }).first()
    ).toBeVisible();

    // 2. Cadastrar usuário
    await page.goto('/cadastro');
    await page.fill('#fullName', studentName);
    await page.fill('#email', studentEmail);
    await page.fill('#password', studentPassword);
    await page.getByRole('button', { name: /Cadastrar e Começar Estudos/i }).click();

    // 3 & 4. Acessar dashboard autenticado (e validar logout + novo login)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(new RegExp(studentName, 'i')).first()).toBeVisible();

    // Faz logout e login explícito para testar cenário 3
    await page.request.post('/api/auth/logout');
    await page.goto('/login');
    await page.fill('#email', studentEmail);
    await page.fill('#password', studentPassword);
    await page.getByRole('button', { name: /Entrar na Plataforma/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 5. Abrir capítulo
    await page.goto('/capitulos');
    await expect(page.getByText(/Fundamentos de Teste/i).first()).toBeVisible();
    await page.goto('/capitulos/fundamentos-de-teste');
    await expect(
      page.getByRole('heading', { name: /Fundamentos de Teste/i }).first()
    ).toBeVisible();

    // 6. Abrir aula e concluir estudo
    await page.goto('/capitulos/fundamentos-de-teste/topicos/1-1-o-que-e-teste');
    await expect(page.getByText(/Explicação Didática/i)).toBeVisible();
    const completeBtn = page.getByRole('button', {
      name: /Concluir Aula \(\+30 XP\)/i,
    });
    await completeBtn.click();
    await expect(
      page.getByRole('button', { name: /Aula Concluída/i })
    ).toBeVisible();

    // 7. Resolver exercícios de fixação
    await page.goto('/exercicios');
    await expect(
      page.getByText(/questões de fixação/i).first()
    ).toBeVisible();
    // Seleciona a primeira opção A da primeira questão e confirma
    await page.locator('button:has(> span:text-is("A"))').first().click();
    await page.getByRole('button', { name: /Confirmar Resposta/i }).first().click();
    await expect(page.getByText(/Gabarito/i).first()).toBeVisible();

    // 8. Estudar flashcards
    await page.goto('/flashcards');
    await expect(page.getByText(/Cartão 1 de/i)).toBeVisible();
    await page.getByRole('button', { name: /Virar Cartão/i }).click();
    await page.getByRole('button', { name: /Fácil \(Dominado\)/i }).click();
  });

  test('9 a 16 e 18. Iniciar Simulado, Responder, Retomar em Andamento, Finalizar, Resultado, Histórico, Revisão de Erros, Progresso e Bloqueio Admin (403)', async ({
    page,
  }) => {
    // Login com a conta criada
    await page.goto('/login');
    await page.fill('#email', studentEmail);
    await page.fill('#password', studentPassword);
    await page.getByRole('button', { name: /Entrar na Plataforma/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 9. Iniciar simulado (Personalizado 5 questões para rapidez ou Capítulo)
    await page.goto('/simulados');
    await page.selectOption('#custom-count', '5');
    await page.getByRole('button', { name: /Gerar Treino Personalizado/i }).click();

    await expect(page).toHaveURL(/\/simulados\/[a-z0-9]+/i);
    const examUrl = page.url();

    // 10. Responder questões (responde Q1 e Q2)
    await page.locator('button:has(> span:text-is("A"))').first().click();
    await expect(page.getByText(/Salvo/i)).toBeVisible();
    await page.getByRole('button', { name: /Próxima Questão/i }).click();
    await page.locator('button:has(> span:text-is("B"))').first().click();
    await expect(page.getByText(/Salvo/i)).toBeVisible();

    // 18. Retomar simulado em andamento: volta para /simulados e clica em "Retomar Prova Agora"
    await page.goto('/simulados');
    await expect(
      page.getByText(/Tentativa em Andamento Detectada/i)
    ).toBeVisible();
    await page.getByRole('button', { name: /Retomar Prova Agora/i }).click();
    await expect(page).toHaveURL(examUrl);
    await expect(page.getByText(/Respondidas:\s*2/i)).toBeVisible();

    // 11. Finalizar simulado
    await page.getByRole('button', { name: /Finalizar Prova/i }).first().click();
    await page.getByRole('button', { name: /Confirmar e Corrigir Prova/i }).click();

    // 12. Consultar resultado
    await expect(page).toHaveURL(/\/simulados\/[a-z0-9]+\/resultado/i);
    await expect(
      page.getByText(/Aprovado|Reprovado/i).first()
    ).toBeVisible();

    // 13. Verificar histórico
    await page.goto('/historico');
    await expect(
      page.getByText(/Simulado Personalizado/i).first()
    ).toBeVisible();

    // 14. Revisar questões erradas
    await page.goto('/revisao-erros');
    await expect(
      page.getByRole('heading', { name: /Caderno de Revisão de Erros/i })
    ).toBeVisible();

    // 15. Verificar progresso e conquistas
    await page.goto('/progresso');
    await expect(
      page.getByRole('heading', { name: /Progresso Detalhado por Capítulo/i })
    ).toBeVisible();
    await page.goto('/conquistas');
    await expect(
      page.getByRole('heading', { name: /Conquistas, Medalhas/i })
    ).toBeVisible();

    // 16. Tentar acessar área administrativa sem permissão (Estudante recebe bloqueio 403)
    await page.goto('/admin');
    await expect(
      page.getByText(/Acesso Restrito — Permissão Insuficiente \(403\)/i)
    ).toBeVisible();

    // API administrativa também deve retornar HTTP 403 para estudante
    const apiRes = await page.request.get('/api/admin/questions');
    expect(apiRes.status()).toBe(403);
  });

  test('17. Acessar área administrativa como Admin e gerenciar questões e revisão editorial', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@ctfl.local');
    await page.fill('#password', 'AdminCTFL2026!');
    await page.getByRole('button', { name: /Entrar na Plataforma/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Navegar para Dashboard Admin
    await page.goto('/admin');
    await expect(
      page.getByRole('heading', {
        name: /Central de Governança e Conteúdo CTFL Academy/i,
      })
    ).toBeVisible();

    // Acessar Banco de Questões e filtrar
    await page.goto('/admin/questoes');
    await expect(
      page.getByRole('heading', {
        name: /Banco de Questões — Cadastro, Edição e Versionamento/i,
      })
    ).toBeVisible();
    await expect(page.getByText(/Q-CTFL-/i).first()).toBeVisible();

    // Abrir modal de nova questão autoral
    await page.getByRole('button', { name: /Nova Questão Autoral/i }).click();
    await expect(
      page.getByText(/Cadastrar Nova Questão Autoral/i)
    ).toBeVisible();

    // Acessar Fila de Revisão Editorial
    await page.goto('/admin/revisao');
    await expect(
      page.getByRole('heading', {
        name: /Fila de Revisão e Tela de Aprovação Editorial/i,
      })
    ).toBeVisible();
  });
});
