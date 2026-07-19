import { useEffect, useState } from 'react';
import api from '../services/api';
import { AuditLog, Pagination } from '../types';
import styles from '../styles/Workspace.module.css';
import ops from '../styles/Operations.module.css';

const actionLabel = (value: string) => value.replace(/_/g, ' ').toLowerCase();
const initialPagination: Pagination = { page: 1, limit: 20, total: 0, totalPages: 1 };

export function AuditoriaPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [entidad, setEntidad] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(initialPagination);
  const [error, setError] = useState('');

  const load = async (targetPage = page) => {
    try {
      const response = await api.getAudit({ entidad: entidad || undefined, page: targetPage, limit: 20 });
      setItems(response.data); setPagination(response.pagination); setError('');
    } catch { setError('No fue posible cargar la trazabilidad.'); }
  };
  useEffect(() => { void load(); }, [page]);

  return <section className={styles.page}>
    <header className={styles.pageHeader}><div><span className={styles.eyebrow}>SEGURIDAD Y CUMPLIMIENTO</span><h2>Auditoría</h2><p>Registro verificable de operaciones sensibles realizadas en el sistema.</p></div></header>
    {error && <div className={styles.error}>{error}</div>}
    <div className={ops.filters}><label>Entidad<select value={entidad} onChange={event => setEntidad(event.target.value)}><option value="">Todas</option><option>Estudiante</option><option>Matricula</option><option>User</option></select></label><button className={ops.secondary} onClick={() => { setPage(1); void load(1); }}>Aplicar</button></div>
    <div className={styles.dataTable}><table><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Referencia</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td>{new Date(item.createdAt).toLocaleString('es-CO')}</td><td><strong>{item.user.nombre}</strong><small>{item.user.email}</small></td><td>{actionLabel(item.accion)}</td><td>{item.entidad}</td><td><code>{item.entidadId.slice(0, 12)}</code></td></tr>)}</tbody></table>{!items.length && <p className={styles.empty}>No hay eventos para este filtro.</p>}</div>
    <div className={ops.cardActions}><span>Página {pagination.page} de {Math.max(pagination.totalPages, 1)} · {pagination.total} eventos</span><button className={ops.secondary} disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Anterior</button><button className={ops.secondary} disabled={page >= pagination.totalPages} onClick={() => setPage(value => value + 1)}>Siguiente</button></div>
  </section>;
}
