export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'OPERADOR';
  sedeId?: string;
  sede?: Sede;
  activo?: boolean;
  ultimoLogin?: string | null;
  createdAt?: string;
  mustChangePassword?: boolean;
}

export interface AuthResponse {
  access_token: string;
  csrf_token: string;
  user: User;
}

export interface RegisterDTO {
  nombre: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'OPERADOR';
  sedeId?: string;
}

export interface VerifyResponse {
  message: string;
  user: User;
  csrf_token: string;
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
  matriculas?: Matricula[];
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

export interface EstudianteActionResponse {
  message: string;
  estudiante: Estudiante;
}

export interface CreateEstudianteDTO {
  nombreCompleto: string;
  email: string;
  telefono: string;
  documento: string;
  programa: string;
  sedeId: string;
  estado?: Estudiante['estado'];
}

export type UpdateEstudianteDTO = Partial<
  Pick<CreateEstudianteDTO, 'nombreCompleto' | 'email' | 'telefono' | 'programa' | 'estado'>
>;

export interface Stats {
  resumen: {
    totalEstudiantes: number;
    totalSedes: number;
    totalUsuarios: number;
    programasActivos: number;
    totalMatriculas: number;
  };
  estudiantesPorSede: Array<{
    sedeId: string;
    sedeName: string;
    ciudad: string;
    cantidad: number;
  }>;
  estudiantesPorEstado: Record<string, number>;
  matriculasPorEstado: Record<string, number>;
  actividadReciente: AuditLog[];
  sedeConMasEstudiantesActivos: {
    sedeId: string;
    sedeName: string;
    ciudad: string;
    estudiantesActivos: number;
  } | null;
}

export interface AuditLog {
  id: string;
  accion: string;
  entidad: string;
  entidadId: string;
  detalle?: Record<string, unknown>;
  createdAt: string;
  user: { nombre: string; email?: string };
}

export interface AuditResponse { data: AuditLog[]; pagination: Pagination; }

export interface Programa {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  duracionMeses: number;
  modalidad: 'PRESENCIAL' | 'HIBRIDA' | 'VIRTUAL';
  estado: 'ACTIVO' | 'INACTIVO';
  _count?: { matriculas: number };
}

export interface Matricula {
  id: string;
  estudianteId: string;
  programaId: string;
  sedeId: string;
  periodo: string;
  estado: 'ACTIVA' | 'FINALIZADA' | 'CANCELADA';
  fechaMatricula: string;
  estudiante: Estudiante;
  programa: Programa;
  sede: Sede;
}

export type UpdateProgramaDTO = Partial<Pick<Programa, 'nombre' | 'descripcion' | 'duracionMeses' | 'modalidad' | 'estado'>>;
export type UpdateSedeDTO = Partial<Pick<Sede, 'nombre' | 'ciudad' | 'direccion' | 'estado'>>;
