import { expect, test } from '@playwright/test';

test('CSRF protege mutaciones y el ciclo de estudiante es persistente', async ({ request }) => {
  const login = await request.post('/api/auth/login', { data: { email: 'admin@example.test', password: 'DemoAdmin123!' } });
  expect(login.status()).toBe(201);
  const session = await login.json();
  const sedes = await (await request.get('/api/sedes')).json();
  const suffix = Date.now().toString().slice(-8);
  const payload = { nombreCompleto: 'Validación Automatizada', email: `qa.${suffix}@example.test`, telefono: '3001234567', documento: `99${suffix}`, programa: 'Validación', sedeId: sedes[0].id };
  const rejected = await request.post('/api/estudiantes', { data: payload });
  expect(rejected.status()).toBe(403);
  const created = await request.post('/api/estudiantes', { data: payload, headers: { 'X-CSRF-Token': session.csrf_token } });
  expect(created.status()).toBe(201);
  const student = await created.json();
  const detail = await request.get(`/api/estudiantes/${student.id}`);
  expect(detail.status()).toBe(200);
  const removed = await request.delete(`/api/estudiantes/${student.id}`, { headers: { 'X-CSRF-Token': session.csrf_token } });
  expect(removed.status()).toBe(200);
  const missing = await request.get(`/api/estudiantes/${student.id}`);
  expect(missing.status()).toBe(404);
});
