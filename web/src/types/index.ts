export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'OPERADOR';
  sedeId?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Sede {
  id: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  estado: 'ACTIVA' | 'INACTIVA';
  _count?: {
    estudiantes: number;
    usuarios: number;
  };
}

export interface Estudiante {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  documento: string;
  programa: string;
  sedeId: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO';
  fechaInscripcion: string;
  sede?: Sede;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EstudiantesResponse {
  data: Estudiante[];
  pagination: Pagination;
}

export interface CreateEstudianteDTO {
  nombreCompleto: string;
  email: string;
  telefono: string;
  documento: string;
  programa: string;
  sedeId: string;
  estado?: string;
}

export interface Stats {
  resumen: {
    totalEstudiantes: number;
    totalSedes: number;
    totalUsuarios: number;
  };
  estudiantesPorSede: Array<{
    sedeId: string;
    sedeName: string;
    ciudad: string;
    cantidad: number;
  }>;
  estudiantesPorEstado: Record<string, number>;
  sedeConMasEstudiantesActivos: {
    sedeId: string;
    sedeName: string;
    ciudad: string;
    estudiantesActivos: number;
  } | null;
}
