export type AuthenticatedUser = {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'OPERADOR';
  sedeId: string | null;
};
