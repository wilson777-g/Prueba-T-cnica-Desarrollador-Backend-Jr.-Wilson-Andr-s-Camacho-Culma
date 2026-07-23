import { expect, test, type Page } from '@playwright/test';

const admin = {
  id: 'admin-1',
  email: 'admin@example.test',
  nombre: 'Administrador del Sistema',
  rol: 'ADMIN',
  mustChangePassword: false,
};

const sede = {
  id: 'sede-1',
  nombre: 'Cali',
  ciudad: 'Cali',
  direccion: 'Sede principal',
  estado: 'ACTIVA',
};

const estudiante = {
  id: 'student-1',
  nombreCompleto: 'Luciana Vargas Pineda',
  email: 'luciana.vargas.cali@example.com',
  telefono: '3000000000',
  documento: '2203003006',
  programa: 'Producción Musical',
  sedeId: sede.id,
  sede,
  estado: 'ACTIVO',
  fechaInscripcion: '2026-06-29T00:00:00.000Z',
};

const mockAcademicApi = async (page: Page) => {
  await page.route('**/api/**', async route => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === '/api/auth/verify') {
      return route.fulfill({ json: { message: 'Sesión válida', user: admin, csrf_token: 'test-token' } });
    }
    if (pathname === '/api/sedes') return route.fulfill({ json: [sede] });
    if (pathname === '/api/estudiantes') {
      return route.fulfill({
        json: { data: [estudiante], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
      });
    }
    return route.fulfill({ status: 200, json: {} });
  });
};

test('desktop student actions use a compact gear menu', async ({ page }) => {
  await mockAcademicApi(page);
  await page.goto('/estudiantes');

  const trigger = page.getByRole('button', { name: 'Acciones para Luciana Vargas Pineda' });
  await expect(trigger).toBeVisible();
  await expect(page.getByRole('button', { name: 'Editar' })).toHaveCount(0);

  await trigger.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Ver ficha' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Editar' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Suspender' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Eliminar' })).toBeVisible();
});

test('mobile navigation is hidden until the hamburger opens it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAcademicApi(page);
  await page.goto('/estudiantes');

  const menuButton = page.locator('button[aria-controls="primary-navigation"]');
  const navigation = page.locator('#primary-navigation');

  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toHaveClass(/sidebarOpen/);
  await expect(page.getByRole('link', { name: 'Estudiantes' })).toBeVisible();
});
