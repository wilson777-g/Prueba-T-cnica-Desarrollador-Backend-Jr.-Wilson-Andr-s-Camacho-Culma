import { expect, test, type Page, type TestInfo } from '@playwright/test';

test.use({
  viewport: { width: 1440, height: 900 },
  video: { mode: 'on', size: { width: 1440, height: 900 } },
});

const capture = async (page: Page, testInfo: TestInfo, name: string) => {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(name, { path, contentType: 'image/png' });
};

test('recorrido documental del producto para portafolio', async ({ page }, testInfo) => {
  await page.goto('/login');
  await capture(page, testInfo, '01-acceso-institucional');

  await page.getByLabel('Email').fill('admin@example.test');
  await page.getByLabel('Contrasena').fill('DemoAdmin123!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Resumen institucional')).toBeVisible();
  await capture(page, testInfo, '02-resumen-institucional');

  const modules = [
    ['Estudiantes', '03-gestion-estudiantes'],
    ['Matrículas', '04-gestion-matriculas'],
    ['Programas', '05-programas-formacion'],
    ['Sedes', '06-gestion-sedes'],
    ['Responsables', '07-control-responsables'],
    ['Auditoría', '08-auditoria'],
    ['Seguridad', '09-seguridad-cuenta'],
  ] as const;

  for (const [label, fileName] of modules) {
    await page.getByRole('link', { name: label }).click();
    await capture(page, testInfo, fileName);
  }

  await page.goto('/recuperar-contrasena');
  await expect(page.getByText('Restablecimiento de contraseña')).toBeVisible();
  await capture(page, testInfo, '10-recuperacion-acceso');
});
