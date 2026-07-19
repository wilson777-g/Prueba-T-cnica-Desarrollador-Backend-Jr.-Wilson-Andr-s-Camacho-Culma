import { ForbiddenException } from '@nestjs/common';
import { enforceSessionSecurity } from './jwt-auth.guard';

describe('seguridad de sesión', () => {
  it('rechaza mutaciones sin CSRF', () => {
    expect(() => enforceSessionSecurity({ csrf: 'valid' }, { method: 'POST', url: '/api/estudiantes', headers: {} })).toThrow(ForbiddenException);
  });

  it('acepta mutaciones con CSRF ligado a la sesión', () => {
    expect(() => enforceSessionSecurity({ csrf: 'valid' }, { method: 'PATCH', url: '/api/matriculas/1/estado', headers: { 'x-csrf-token': 'valid' } })).not.toThrow();
  });

  it('bloquea la operación normal cuando la clave es temporal', () => {
    expect(() => enforceSessionSecurity({ csrf: 'valid', mustChangePassword: true }, { method: 'GET', url: '/api/estudiantes', headers: {} })).toThrow('Debes cambiar');
  });

  it('permite cambiar la contraseña temporal con CSRF válido', () => {
    expect(() => enforceSessionSecurity({ csrf: 'valid', mustChangePassword: true }, { method: 'POST', url: '/api/auth/change-password', headers: { 'x-csrf-token': 'valid' } })).not.toThrow();
  });
});
