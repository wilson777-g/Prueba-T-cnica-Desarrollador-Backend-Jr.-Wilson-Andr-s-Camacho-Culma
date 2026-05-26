import React, { useEffect, useMemo, useState } from 'react';
import apiService from '../services/api';
import { Estudiante, Pagination, Sede, User } from '../types';
import styles from '../styles/Estudiantes.module.css';

const initialPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export const EstudiantesPage: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedSede, setSelectedSede] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    documento: '',
    programa: '',
    sedeId: '',
    estado: 'ACTIVO',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return;
    }

    const parsedUser = JSON.parse(storedUser) as User;
    setUser(parsedUser);

    if (parsedUser.rol === 'OPERADOR' && parsedUser.sedeId) {
      setSelectedSede(parsedUser.sedeId);
      setFormData(current => ({ ...current, sedeId: parsedUser.sedeId || '' }));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const loadSedes = async () => {
      try {
        const sedesData = await apiService.getSedes();
        if (!cancelled) {
          setSedes(sedesData);
        }
      } catch {
        if (!cancelled) {
          setError('Error al cargar las sedes');
        }
      }
    };

    void loadSedes();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const loadEstudiantes = async () => {
      try {
        setLoading(true);
        const response = await apiService.getEstudiantes({
          page,
          limit: 10,
          sedeId: user.rol === 'ADMIN' ? selectedSede || undefined : undefined,
          estado: filterEstado || undefined,
          search: searchTerm.trim() || undefined,
        });

        if (!cancelled) {
          setEstudiantes(response.data);
          setPagination(response.pagination);
          setError('');
        }
      } catch {
        if (!cancelled) {
          setError('Error al cargar los estudiantes');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const debounceId = window.setTimeout(loadEstudiantes, searchTerm ? 300 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(debounceId);
    };
  }, [user, page, selectedSede, filterEstado, searchTerm]);

  const sedesDisponibles = useMemo(() => {
    if (user?.rol !== 'OPERADOR') {
      return sedes;
    }

    return sedes.filter(sede => sede.id === user.sedeId);
  }, [sedes, user]);

  const handleCreateEstudiante = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const sedeId = user?.rol === 'OPERADOR' ? user.sedeId : formData.sedeId;
    if (!sedeId) {
      setError('Selecciona una sede para el estudiante');
      return;
    }

    try {
      await apiService.createEstudiante({
        ...formData,
        sedeId,
      });

      setFormData({
        nombreCompleto: '',
        email: '',
        telefono: '',
        documento: '',
        programa: '',
        sedeId: user?.rol === 'OPERADOR' ? user.sedeId || '' : '',
        estado: 'ACTIVO',
      });
      setShowForm(false);
      setPage(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear estudiante');
    }
  };

  if (loading && estudiantes.length === 0) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Gestion de Estudiantes</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.controlsSection}>
        <div className={styles.filters}>
          {user?.rol === 'ADMIN' && (
            <select
              value={selectedSede}
              onChange={event => {
                setSelectedSede(event.target.value);
                setPage(1);
              }}
              className={styles.select}
            >
              <option value="">Todas las sedes</option>
              {sedes.map(sede => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            value={searchTerm}
            onChange={event => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            className={styles.input}
          />

          <select
            value={filterEstado}
            onChange={event => {
              setFilterEstado(event.target.value);
              setPage(1);
            }}
            className={styles.select}
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="RETIRADO">Retirado</option>
          </select>
        </div>

        <button onClick={() => setShowForm(!showForm)} className={styles.btnPrimary}>
          {showForm ? 'Cancelar' : '+ Nuevo Estudiante'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateEstudiante} className={styles.formContainer}>
          <h3>Crear Nuevo Estudiante</h3>

          <div className={styles.gridForm}>
            <div className={styles.formGroup}>
              <label>Nombre Completo</label>
              <input
                type="text"
                value={formData.nombreCompleto}
                onChange={event => setFormData({ ...formData, nombreCompleto: event.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={event => setFormData({ ...formData, email: event.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Telefono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={event => setFormData({ ...formData, telefono: event.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Documento</label>
              <input
                type="text"
                value={formData.documento}
                onChange={event => setFormData({ ...formData, documento: event.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Programa</label>
              <input
                type="text"
                value={formData.programa}
                onChange={event => setFormData({ ...formData, programa: event.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Sede</label>
              <select
                value={formData.sedeId}
                onChange={event => setFormData({ ...formData, sedeId: event.target.value })}
                required
                disabled={user?.rol === 'OPERADOR'}
              >
                <option value="">Seleccionar sede</option>
                {sedesDisponibles.map(sede => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className={styles.btnPrimary}>
            Crear Estudiante
          </button>
        </form>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Documento</th>
              <th>Programa</th>
              <th>Sede</th>
              <th>Estado</th>
              <th>Fecha Inscripcion</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.length > 0 ? (
              estudiantes.map(estudiante => (
                <tr key={estudiante.id}>
                  <td>{estudiante.nombreCompleto}</td>
                  <td>{estudiante.email}</td>
                  <td>{estudiante.documento}</td>
                  <td>{estudiante.programa}</td>
                  <td>{estudiante.sede?.nombre || 'N/A'}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[estudiante.estado.toLowerCase()]}`}>
                      {estudiante.estado}
                    </span>
                  </td>
                  <td>{new Date(estudiante.fechaInscripcion).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  No hay estudiantes para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span>
          Pagina {pagination.page} de {Math.max(pagination.totalPages, 1)} - {pagination.total} registros
        </span>
        <div className={styles.paginationActions}>
          <button
            type="button"
            onClick={() => setPage(current => Math.max(current - 1, 1))}
            disabled={pagination.page <= 1 || loading}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage(current => Math.min(current + 1, pagination.totalPages))}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};
