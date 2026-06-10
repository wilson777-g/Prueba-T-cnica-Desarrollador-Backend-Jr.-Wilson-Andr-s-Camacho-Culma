import axios, { AxiosInstance } from 'axios';
import {
  AuthResponse,
  Sede,
  Estudiante,
  CreateEstudianteDTO,
  EstudiantesResponse,
  Stats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
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
      timeout: 30000,
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

  async register(data: any): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  }

  async verify(): Promise<any> {
    const response = await this.api.post('/api/auth/verify', {});
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

  async updateEstudiante(id: string, data: any): Promise<Estudiante> {
    const response = await this.api.put<Estudiante>(`/api/estudiantes/${id}`, data);
    return response.data;
  }

  async deleteEstudiante(id: string): Promise<any> {
    const response = await this.api.delete(`/api/estudiantes/${id}`);
    return response.data;
  }

  // ============================================
  // STATS
  // ============================================
  async getStats(): Promise<Stats> {
    const response = await this.api.get<Stats>('/api/stats');
    return response.data;
  }
}

export default new ApiService();
