import { useEffect, useState } from 'react';
import api from '../services/api';
import { Matricula, Stats, User } from '../types';
import styles from '../styles/Workspace.module.css';

export function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
  const [stats, setStats] = useState<Stats | null>(null);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const requests: Promise<unknown>[] = [api.getMatriculas().then(setMatriculas)];
    if (user.rol === 'ADMIN') requests.push(api.getStats().then(setStats));
    Promise.all(requests).catch(() => setError('No fue posible cargar el resumen operativo.'));
  }, [user.rol]);

  const active = matriculas.filter(item => item.estado === 'ACTIVA').length;
  const period = `${new Date().getFullYear()}-${new Date().getMonth() < 6 ? '1' : '2'}`;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div><span className={styles.eyebrow}>OPERACIÓN ACADÉMICA</span><h2>Resumen institucional</h2><p>Seguimiento de estudiantes, matrículas y sedes en el periodo {period}.</p></div>
        <span className={styles.period}>Periodo {period}</span>
      </header>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.metrics}>
        <article><span>Estudiantes registrados</span><strong>{stats?.resumen.totalEstudiantes ?? '—'}</strong><small>Registros vigentes</small></article>
        <article><span>Matrículas activas</span><strong>{active}</strong><small>En la sede autorizada</small></article>
        <article><span>Sedes activas</span><strong>{stats?.resumen.totalSedes ?? '—'}</strong><small>Operación multisede</small></article>
        <article><span>Programas con matrícula</span><strong>{new Set(matriculas.map(item => item.programaId)).size}</strong><small>Oferta utilizada</small></article>
      </div>
      <div className={styles.panelGrid}>
        <article className={styles.panel}><div className={styles.panelTitle}><div><h3>Actividad reciente</h3><p>Últimas matrículas registradas</p></div></div>
          <div className={styles.activity}>{matriculas.slice(0, 6).map(item => <div key={item.id}><span className={styles.initial}>{item.estudiante.nombreCompleto.charAt(0)}</span><div><strong>{item.estudiante.nombreCompleto}</strong><small>{item.programa.nombre} · {item.sede.nombre}</small></div><time>{new Date(item.fechaMatricula).toLocaleDateString('es-CO')}</time></div>)}{!matriculas.length && <p className={styles.empty}>Aún no hay matrículas registradas.</p>}</div>
        </article>
        <article className={styles.panel}><div className={styles.panelTitle}><div><h3>Estado académico</h3><p>Distribución de estudiantes</p></div></div>
          <div className={styles.statusList}>{Object.entries(stats?.estudiantesPorEstado || {}).map(([label, value]) => <div key={label}><span>{label.toLowerCase()}</span><strong>{value}</strong></div>)}{!stats && <p className={styles.empty}>Disponible para administración general.</p>}</div>
        </article>
      </div>
    </section>
  );
}
