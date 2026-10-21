import { test, expect } from '@playwright/test';

test.describe('Web E2E — Caderno Flutuante & Mapas Mentais', () => {
  const student = {
    name: 'Aluno Caderno Web',
    email: `caderno.student.${Date.now()}@ctfl.local`,
    password: 'SenhaCaderno123!',
  };

  test('Abertura, Alternância de Abas e Interação com Caderno Flutuante', async ({ page }) => {
    // 1. Cadastra o aluno e acessa a aula
    await page.goto('/cadastro');
    await page.fill('#fullName', student.name);
    await page.fill('#email', student.email);
    await page.fill('#password', student.password);
    await page.getByRole('button', { name: /Cadastrar e Começar Estudos/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navega para aula didática
    await page.goto('/capitulos/fundamentos-de-teste/topicos/1-1-o-que-e-teste');
    await expect(page.getByText(/Explicação Didática/i)).toBeVisible();

    // 3. Localiza e aciona o botão flutuante 'Caderno & Mapas'
    const notebookBtn = page.locator('#floating-notebook-btn');
    await expect(notebookBtn).toBeVisible();
    await notebookBtn.click();

    // 4. Modal / Janela aberta: verifica presença de abas Mapa Mental e Anotações
    await expect(page.getByRole('button', { name: /Anotações/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Mapa Mental/i })).toBeVisible();

    // 5. Alterna para aba de Anotações
    await page.getByRole('button', { name: /Anotações/i }).click();

    // 6. Fecha o caderno
    await page.locator('button[title*="Fechar"]').click();
    await expect(notebookBtn).toBeVisible();
  });
});
