import { test, expect } from '@playwright/test';

test.describe('Web E2E — Fluxo de Simulado e Avaliação CTFL', () => {
  const student = {
    name: 'Aluno Simulado Web',
    email: `simulado.student.${Date.now()}@ctfl.local`,
    password: 'SenhaSimuladoWeb123!',
  };

  test('Geração de Simulado, Respostas, Retomada, Correção e Histórico', async ({ page }) => {
    // 1. Cadastro
    await page.goto('/cadastro');
    await page.fill('#fullName', student.name);
    await page.fill('#email', student.email);
    await page.fill('#password', student.password);
    await page.getByRole('button', { name: /Cadastrar e Começar Estudos/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Gerar Simulado Personalizado de 5 questões
    await page.goto('/simulados');
    await page.selectOption('#custom-count', '5');
    await page.getByRole('button', { name: /Gerar Treino Personalizado/i }).click();

    await expect(page).toHaveURL(/\/simulados\/[a-z0-9]+/i);
    const examUrl = page.url();

    // 3. Responder Q1 e Q2
    await page.locator('button:has(> span:text-is("A"))').first().click();
    await expect(page.getByText(/Salvo/i)).toBeVisible();
    await page.getByRole('button', { name: /Próxima Questão/i }).click();
    await page.locator('button:has(> span:text-is("B"))').first().click();
    await expect(page.getByText(/Salvo/i)).toBeVisible();

    // 4. Retomar simulado em andamento
    await page.goto('/simulados');
    await expect(page.getByText(/Tentativa em Andamento Detectada/i)).toBeVisible();
    await page.getByRole('button', { name: /Retomar Prova Agora/i }).click();
    await expect(page).toHaveURL(examUrl);
    await expect(page.getByText(/Respondidas:\s*2/i)).toBeVisible();

    // 5. Finalizar prova
    await page.getByRole('button', { name: /Finalizar Prova/i }).first().click();
    await page.getByRole('button', { name: /Confirmar e Corrigir Prova/i }).click();

    // 6. Validar resultado e histórico
    await expect(page).toHaveURL(/\/simulados\/[a-z0-9]+\/resultado/i);
    await expect(page.getByText(/Aprovado|Reprovado/i).first()).toBeVisible();

    // 7. Histórico
    await page.goto('/historico');
    await expect(page.getByText(/Simulado Personalizado/i).first()).toBeVisible();
  });
});
