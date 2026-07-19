import axios, { AxiosInstance } from 'axios';
import {
  AuthResponse,
  Sede,
  Estudiante,
  EstudianteActionResponse,
  CreateEstudianteDTO,
  RegisterDTO,
  EstudiantesResponse,
  Stats,
  UpdateEstudianteDTO,
  VerifyResponse,
  Programa,
  Matricula,
} from '../types';

// La demo publica tiene un unico backend canonico. No usamos VITE_API_URL aqui
// porque una variable antigua en Vercel apuntaba a un servicio retirado y
// bloqueaba el inicio de sesion aun cuando Render estaba saludable.
const API_BASE_URL = 'https://academic-management-api-35mu.onrender.com';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 65000,
    });

    // Interceptor para agregar token a todas las requests
    this.api.interceptors.request.use(config => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    // Interceptor para manejo de errores
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      },
    );
  }

  // ============================================
  // AUTH
  // ============================================
  getApiBaseUrl(): string {
    return API_BASE_URL;
  }

  async warmUp(): Promise<void> {
    await this.api.get('/api/health', {
      timeout: 60000,
      validateStatus: status => status < 500,
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  }

  async verify(): Promise<VerifyResponse> {
    const response = await this.api.post<VerifyResponse>('/api/auth/verify', {});
    return response.data;
  }

  // ============================================
  // SEDES
  // ============================================
  async getSedes(): Promise<Sede[]> {
    const response = await this.api.get<Sede[]>('/api/sedes');
    return response.data;
  }

  async getSedeById(id: string): Promise<Sede> {
    const response = await this.api.get<Sede>(`/api/sedes/${id}`);
    return response.data;
  }

  // ============================================
  // ESTUDIANTES
  // ============================================
  async getEstudiantes(params?: Record<string, string | number | undefined>): Promise<EstudiantesResponse> {
    const response = await this.api.get<EstudiantesResponse>('/api/estudiantes', { params });
    return response.data;
  }

  async getEstudianteById(id: string): Promise<Estudiante> {
    const response = await this.api.get<Estudiante>(`/api/estudiantes/${id}`);
    return response.data;
  }

  async createEstudiante(data: CreateEstudianteDTO): Promise<Estudiante> {
    const response = await this.api.post<Estudiante>('/api/estudiantes', data);
    return response.data;
  }

  async updateEstudiante(id: string, data: UpdateEstudianteDTO): Promise<Estudiante> {
    const response = await this.api.put<Estudiante>(`/api/estudiantes/${id}`, data);
    return response.data;
  }

  async suspenderEstudiante(id: string): Promise<EstudianteActionResponse> {
    const response = await this.api.patch<EstudianteActionResponse>(`/api/estudiantes/${id}/suspender`);
    return response.data;
  }

  async deleteEstudiante(id: string): Promise<EstudianteActionResponse> {
    const response = await this.api.delete<EstudianteActionResponse>(`/api/estudiantes/${id}`);
    return response.data;
  }

  // ============================================
  // STATS
  // ============================================
  async getStats(): Promise<Stats> {
    const response = await this.api.get<Stats>('/api/stats');
    return response.data;
  }

  async getProgramas(): Promise<Programa[]> {
    const response = await this.api.get<Programa[]>('/api/programas');
    return response.data;
  }

  async createPrograma(data: Pick<Programa, 'codigo' | 'nombre' | 'duracionMeses' | 'modalidad'> & { descripcion?: string }): Promise<Programa> {
    const response = await this.api.post<Programa>('/api/programas', data);
    return response.data;
  }

  async getMatriculas(params?: Record<string, string | undefined>): Promise<Matricula[]> {
    const response = await this.api.get<Matricula[]>('/api/matriculas', { params });
    return response.data;
  }

  async createMatricula(data: Pick<Matricula, 'estudianteId' | 'programaId' | 'sedeId' | 'periodo'>): Promise<Matricula> {
    const response = await this.api.post<Matricula>('/api/matriculas', data);
    return response.data;
  }
}

export default new ApiService();
