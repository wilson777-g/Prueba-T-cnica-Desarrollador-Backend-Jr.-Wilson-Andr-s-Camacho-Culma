import React, { useEffect, useMemo, useRef, useState } from 'react';
import apiService from '../services/api';
import { CreateEstudianteDTO, Estudiante, Pagination, Sede, User } from '../types';
import styles from '../styles/Estudiantes.module.css';

const initialPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

type ApiErrorResponse = {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiErrorResponse).response?.data?.message;

  if (Array.isArray(message)) {
    return message.join('. ');
  }

  return message || fallback;
};

const getSuspendDisabledLabel = (estado: Estudiante['estado']) =>
  estado === 'INACTIVO' ? 'Ya inactivo' : 'Retirado';

type EstudianteFormData = CreateEstudianteDTO & {
  estado: Estudiante['estado'];
};

type StudentActionsProps = {
  estudiante: Estudiante;
  profileLoading: boolean;
  onView: () => void;
  onEdit: () => void;
  onSuspend: () => void;
  onDelete: () => void;
};

const StudentActions: React.FC<StudentActionsProps> = ({
  estudiante,
  profileLoading,
  onView,
  onEdit,
  onSuspend,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = `student-actions-${estudiante.id}`;

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const runAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div className={styles.actionMenu} ref={menuRef}>
      <button
        type="button"
        className={styles.actionMenuTrigger}
        aria-label={`Acciones para ${estudiante.nombreCompleto}`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(current => !current)}
      >
        <span aria-hidden="true">⚙</span>
      </button>
      {open && (
        <div id={menuId} className={styles.actionMenuPanel} role="menu">
          <button type="button" role="menuitem" onClick={() => runAction(onView)} disabled={profileLoading}>Ver ficha</button>
          <button type="button" role="menuitem" onClick={() => runAction(onEdit)}>Editar</button>
          {estudiante.estado === 'ACTIVO' ? (
            <button type="button" role="menuitem" className={styles.menuWarning} onClick={() => runAction(onSuspend)}>Suspender</button>
          ) : (
            <span className={styles.menuDisabled}>{getSuspendDisabledLabel(estudiante.estado)}</span>
          )}
          <button type="button" role="menuitem" className={styles.menuDanger} onClick={() => runAction(onDelete)}>Eliminar</button>
        </div>
      )}
    </div>
  );
};

export const EstudiantesPage: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEstudianteId, setEditingEstudianteId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Estudiante | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Estudiante | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [profile, setProfile] = useState<Estudiante | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedSede, setSelectedSede] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formData, setFormData] = useState<EstudianteFormData>({
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
  }, [user, page, selectedSede, filterEstado, searchTerm, refreshKey]);

  const sedesDisponibles = useMemo(() => {
    if (user?.rol !== 'OPERADOR') {
      return sedes;
    }

    return sedes.filter(sede => sede.id === user.sedeId);
  }, [sedes, user]);

  const isAdmin = user?.rol === 'ADMIN';

  const resetForm = () => {
    setFormData({
      nombreCompleto: '',
      email: '',
      telefono: '',
      documento: '',
      programa: '',
      sedeId: user?.rol === 'OPERADOR' ? user.sedeId || '' : '',
      estado: 'ACTIVO',
    });
    setEditingEstudianteId(null);
  };

  const handleToggleForm = () => {
    if (showForm) {
      resetForm();
      setShowForm(false);
      return;
    }

    setShowForm(true);
  };

  const handleEditEstudiante = (estudiante: Estudiante) => {
    if (!isAdmin) {
      return;
    }

    setFormData({
      nombreCompleto: estudiante.nombreCompleto,
      email: estudiante.email,
      telefono: estudiante.telefono,
      documento: estudiante.documento,
      programa: estudiante.programa,
      sedeId: estudiante.sedeId,
      estado: estudiante.estado,
    });
    setEditingEstudianteId(estudiante.id);
    setShowForm(true);
    setError('');
  };

  const handleDeleteEstudiante = async (estudiante: Estudiante) => {
    if (!isAdmin) {
      return;
    }

    setDeleteTarget(estudiante);
    setError('');
  };

  const handleSuspendEstudiante = (estudiante: Estudiante) => {
    if (!isAdmin || estudiante.estado !== 'ACTIVO') {
      return;
    }

    setSuspendTarget(estudiante);
    setError('');
  };

  const openProfile = async (estudiante: Estudiante) => {
    setProfileLoading(true); setError('');
    try { setProfile(await apiService.getEstudianteById(estudiante.id)); }
    catch (err) { setError(getErrorMessage(err, 'No fue posible cargar la ficha académica')); }
    finally { setProfileLoading(false); }
  };

  const handleConfirmDelete = async () => {
    if (!isAdmin || !deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      await apiService.deleteEstudiante(deleteTarget.id);
      setError('');
      setNotice(`${deleteTarget.nombreCompleto} fue retirado del registro activo.`);
      setPage(current => (current > 1 && estudiantes.length === 1 ? current - 1 : current));
      setRefreshKey(current => current + 1);
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al eliminar estudiante'));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!isAdmin || !suspendTarget) {
      return;
    }

    try {
      setSuspending(true);
      await apiService.suspenderEstudiante(suspendTarget.id);
      setError('');
      setNotice(`${suspendTarget.nombreCompleto} quedó en estado inactivo.`);
      setRefreshKey(current => current + 1);
      setSuspendTarget(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al suspender estudiante'));
      setSuspendTarget(null);
    } finally {
      setSuspending(false);
    }
  };

  const handleSubmitEstudiante = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const sedeId = user?.rol === 'OPERADOR' ? user.sedeId : formData.sedeId;
    if (!sedeId) {
      setError('Selecciona una sede para el estudiante');
      return;
    }

    try {
      const estudianteData = {
        ...formData,
        sedeId,
      };

      if (editingEstudianteId) {
        if (!isAdmin) {
          setError('No tienes permisos para editar estudiantes');
          return;
        }

        await apiService.updateEstudiante(editingEstudianteId, {
          nombreCompleto: formData.nombreCompleto,
          email: formData.email,
          telefono: formData.telefono,
          programa: formData.programa,
          estado: formData.estado,
        });
      } else {
        await apiService.createEstudiante(estudianteData);
      }

      setNotice(editingEstudianteId ? 'Los datos del estudiante fueron actualizados.' : 'El estudiante fue registrado correctamente.');

      resetForm();
      setShowForm(false);
      setPage(1);
      setRefreshKey(current => current + 1);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al guardar estudiante'));
    }
  };

  if (loading && estudiantes.length === 0) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <h2>Gestión de estudiantes</h2>

      {error && <div className={styles.error}>{error}</div>}
      {notice && <div className={styles.success}>{notice}</div>}

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

        <button type="button" onClick={handleToggleForm} className={styles.btnPrimary}>
          {showForm ? 'Cancelar' : '+ Nuevo Estudiante'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmitEstudiante} className={styles.formContainer}>
          <h3>{editingEstudianteId ? 'Editar Estudiante' : 'Crear Nuevo Estudiante'}</h3>

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
            {editingEstudianteId ? 'Guardar Cambios' : 'Crear Estudiante'}
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
              {isAdmin && <th>Acciones</th>}
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
                  {isAdmin && (
                    <td>
                      <StudentActions
                        estudiante={estudiante}
                        profileLoading={profileLoading}
                        onView={() => void openProfile(estudiante)}
                        onEdit={() => handleEditEstudiante(estudiante)}
                        onSuspend={() => handleSuspendEstudiante(estudiante)}
                        onDelete={() => handleDeleteEstudiante(estudiante)}
                      />
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className={styles.empty}>
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

      {suspendTarget && (
        <div className={styles.modalOverlay} role="presentation">
          <div
            className={styles.confirmModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="suspend-title"
          >
            <div className={`${styles.modalIcon} ${styles.modalIconWarning}`} aria-hidden="true">
              !
            </div>
            <div className={styles.modalContent}>
              <span className={styles.modalEyebrow}>Confirmar suspension</span>
              <h3 id="suspend-title">Suspender estudiante</h3>
              <p>
                Esta accion cambiara el estado de <strong>{suspendTarget.nombreCompleto}</strong> a INACTIVO. El
                registro seguira visible para auditoria.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setSuspendTarget(null)}
                className={styles.btnModalSecondary}
                disabled={suspending}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                className={styles.btnModalWarning}
                disabled={suspending}
              >
                {suspending ? 'Suspendiendo...' : 'Suspender'}
              </button>
            </div>
          </div>
        </div>
      )}

      {profile && (
        <div className={styles.modalOverlay} role="presentation"><div className={styles.confirmModal} role="dialog" aria-modal="true"><div className={styles.modalContent}><span className={styles.modalEyebrow}>Ficha académica</span><h3>{profile.nombreCompleto}</h3><p>{profile.documento} · {profile.email} · {profile.telefono}</p><p><strong>Sede:</strong> {profile.sede?.nombre} &nbsp; <strong>Estado:</strong> {profile.estado}</p><h4>Historial de matrículas</h4>{profile.matriculas?.length?profile.matriculas.map(item=><p key={item.id}><strong>{item.programa.nombre}</strong> · {item.periodo} · {item.estado} · {new Date(item.fechaMatricula).toLocaleDateString('es-CO')}</p>):<p>Sin matrículas registradas.</p>}</div><div className={styles.modalActions}><button type="button" onClick={()=>setProfile(null)} className={styles.btnModalSecondary}>Cerrar</button></div></div></div>
      )}

      {deleteTarget && (
        <div className={styles.modalOverlay} role="presentation">
          <div
            className={styles.confirmModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <div className={styles.modalIcon} aria-hidden="true">
              !
            </div>
            <div className={styles.modalContent}>
              <span className={styles.modalEyebrow}>Confirmar eliminacion</span>
              <h3 id="delete-title">Eliminar estudiante</h3>
              <p>
                Esta acción retirará a <strong>{deleteTarget.nombreCompleto}</strong> de los listados operativos. Su historial se conservará para auditoría.
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className={styles.btnModalSecondary}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className={styles.btnModalDanger}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
