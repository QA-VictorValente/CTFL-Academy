import { test, expect } from '@playwright/test';

test.describe('Web E2E — Segurança RBAC e Central Administrativa', () => {
  const student = {
    name: 'Estudante Sem Admin',
    email: `aluno.noadmin.${Date.now()}@ctfl.local`,
    password: 'SenhaEstudante123!',
  };

  test('Aluno recebe tela de Acesso Restrito (403) ao tentar acessar /admin', async ({ page }) => {
    // 1. Cadastra como aluno comum
    await page.goto('/cadastro');
    await page.fill('#fullName', student.name);
    await page.fill('#email', student.email);
    await page.fill('#password', student.password);
    await page.getByRole('button', { name: /Cadastrar e Começar Estudos/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Tenta entrar em /admin
    await page.goto('/admin');
    await expect(
      page.getByText(/Acesso Restrito — Permissão Insuficiente \(403\)/i)
    ).toBeVisible();
  });

  test('Administrador acessa Painel de Governança, Banco de Questões e Fila Editorial', async ({ page }) => {
    // 1. Login com perfil Admin
    await page.goto('/login');
    await page.fill('#email', 'admin@ctfl.local');
    await page.fill('#password', 'AdminCTFL2026!');
    await page.getByRole('button', { name: /Entrar na Plataforma/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navegação para Central de Governança
    await page.goto('/admin');
    await expect(
      page.getByRole('heading', {
        name: /Central de Governança e Conteúdo CTFL Academy/i,
      })
    ).toBeVisible();

    // 3. Banco de Questões
    await page.goto('/admin/questoes');
    await expect(
      page.getByRole('heading', {
        name: /Banco de Questões — Cadastro, Edição e Versionamento/i,
      })
    ).toBeVisible();
    await expect(page.getByText(/Q-CTFL-/i).first()).toBeVisible();

    // 4. Modal de Nova Questão Autoral
    await page.getByRole('button', { name: /Nova Questão Autoral/i }).click();
    await expect(page.getByText(/Cadastrar Nova Questão Autoral/i)).toBeVisible();

    // 5. Fila de Revisão Editorial
    await page.goto('/admin/revisao');
    await expect(
      page.getByRole('heading', {
        name: /Fila de Revisão e Tela de Aprovação Editorial/i,
      })
    ).toBeVisible();
  });
});
