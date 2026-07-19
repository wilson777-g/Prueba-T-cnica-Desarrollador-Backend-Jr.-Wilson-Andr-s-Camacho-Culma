import { expect, test } from '@playwright/test';

test('administrador inicia sesión con cookie HttpOnly y ve módulos de gobierno', async ({ page, context }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.test');
  await page.getByLabel('Contrasena').fill('DemoAdmin123!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('link', { name: 'Responsables' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Auditoría' })).toBeVisible();
  const cookie = (await context.cookies()).find(item => item.name === 'dna_session');
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe('Lax');
  const tokenInStorage = await page.evaluate(() => localStorage.getItem('token'));
  expect(tokenInStorage).toBeNull();
});

test('operador no recibe navegación ni acceso administrativo', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('operador.bogota@example.test');
  await page.getByLabel('Contrasena').fill('DemoOper123!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('link', { name: 'Responsables' })).toHaveCount(0);
  // Ejecutar desde la página garantiza que se envíe la cookie HttpOnly de la
  // sesión del operador; un APIRequestContext separado puede no compartirla.
  const status = await page.evaluate(async () => {
    const response = await fetch('/api/administracion/operadores', { credentials: 'include' });
    return response.status;
  });
  expect(status).toBe(403);
});
