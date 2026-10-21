import { test, expect } from '@playwright/test';

test.describe('Web E2E — Jornada do Estudante CTFL', () => {
  test('Jornada Completa: Landing Page -> Cadastro -> Login -> Estudo de Aula -> Exercícios -> Flashcards', async ({ page }) => {
    const student = {
      name: 'Estudante Web CTFL',
      email: `web.student.${Date.now()}.${Math.floor(Math.random() * 100000)}@ctfl.local`,
      password: 'SenhaSeguraWeb123!',
    };

    // 1. Landing Page
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /ISTQB CTFL/i }).first()).toBeVisible();

    // 2. Cadastro
    await page.goto('/cadastro');
    await page.fill('#fullName', student.name);
    await page.fill('#email', student.email);
    await page.fill('#password', student.password);
    await page.getByRole('button', { name: /Cadastrar e Começar Estudos/i }).click();

    // Redirecionamento para Dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(new RegExp(student.name, 'i')).first()).toBeVisible();

    // 3. Logout e Login explícito
    await page.request.post('/api/auth/logout');
    await page.goto('/login');
    await page.fill('#email', student.email);
    await page.fill('#password', student.password);
    await page.getByRole('button', { name: /Entrar na Plataforma/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 4. Navegar pelos Capítulos
    await page.goto('/capitulos');
    await expect(page.getByText(/Fundamentos de Teste/i).first()).toBeVisible();
    await page.goto('/capitulos/fundamentos-de-teste');
    await expect(page.getByRole('heading', { name: /Fundamentos de Teste/i }).first()).toBeVisible();

    // 5. Estudo de Tópico / Aula
    await page.goto('/capitulos/fundamentos-de-teste/topicos/1-1-o-que-e-teste');
    await expect(page.getByText(/Explicação Didática/i)).toBeVisible();
    
    // Alterna para Leitura Contínua garantindo hidratação do componente
    const switchContinuousBtn = page.getByRole('button', { name: /Leitura Contínua/i });
    await switchContinuousBtn.click();
    await expect(page.getByText(/Finalizou a leitura desta aula\?/i)).toBeVisible();

    const completeBtn = page.getByRole('button', { name: /Concluir Aula \(\+30 XP\)/i });
    await completeBtn.click();
    await expect(
      page.getByText(/Aula Concluída|Concluída/i).first()
    ).toBeVisible();

    // 6. Exercícios de fixação
    await page.goto('/exercicios');
    await expect(page.getByText(/questões de fixação/i).first()).toBeVisible();
    await page.locator('button:has(> span:text-is("A"))').first().click();
    await page.getByRole('button', { name: /Confirmar Resposta/i }).first().click();
    await expect(page.getByText(/Gabarito/i).first()).toBeVisible();

    // 7. Flashcards
    await page.goto('/flashcards');
    await expect(page.getByText(/Cartão 1 de/i)).toBeVisible();
    await page.getByRole('button', { name: /Virar Cartão/i }).click();
    await page.getByRole('button', { name: /Fácil \(Dominado\)/i }).click();
  });
});
