import { FormEvent, useEffect, useState } from 'react';
import api from '../services/api';
import { Programa, User } from '../types';
import styles from '../styles/Workspace.module.css';

export function ProgramasPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
  const [items, setItems] = useState<Programa[]>([]);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ codigo: '', nombre: '', descripcion: '', duracionMeses: 6, modalidad: 'PRESENCIAL' as Programa['modalidad'] });
  const load = () => api.getProgramas().then(setItems).catch(() => setError('No fue posible cargar los programas.'));
  useEffect(() => { void load(); }, []);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); try { await api.createPrograma(form); setShow(false); setForm({ codigo: '', nombre: '', descripcion: '', duracionMeses: 6, modalidad: 'PRESENCIAL' }); load(); } catch { setError('No fue posible crear el programa. Verifica código y nombre.'); } };
  return <section className={styles.page}><header className={styles.pageHeader}><div><span className={styles.eyebrow}>CATÁLOGO ACADÉMICO</span><h2>Programas de formación</h2><p>Oferta institucional disponible para matrículas y seguimiento.</p></div>{user.rol === 'ADMIN' && <button className={styles.primary} onClick={() => setShow(!show)}>{show ? 'Cancelar' : 'Nuevo programa'}</button>}</header>
    {error && <div className={styles.error}>{error}</div>}
    {show && <form className={styles.formPanel} onSubmit={submit}><label>Código<input value={form.codigo} onChange={e => setForm({...form,codigo:e.target.value.toUpperCase()})} required /></label><label>Nombre<input value={form.nombre} onChange={e => setForm({...form,nombre:e.target.value})} required /></label><label>Duración (meses)<input type="number" min="1" max="60" value={form.duracionMeses} onChange={e => setForm({...form,duracionMeses:Number(e.target.value)})} required /></label><label>Modalidad<select value={form.modalidad} onChange={e => setForm({...form,modalidad:e.target.value as Programa['modalidad']})}><option>PRESENCIAL</option><option>HIBRIDA</option><option>VIRTUAL</option></select></label><label className={styles.wide}>Descripción<input value={form.descripcion} onChange={e => setForm({...form,descripcion:e.target.value})} /></label><button className={styles.primary}>Guardar programa</button></form>}
    <div className={styles.catalog}>{items.map(item => <article key={item.id}><div><span className={styles.code}>{item.codigo}</span><span className={`${styles.state} ${item.estado === 'ACTIVO' ? styles.ok : ''}`}>{item.estado}</span></div><h3>{item.nombre}</h3><p>{item.descripcion || 'Programa de formación musical.'}</p><footer><span>{item.modalidad.toLowerCase()}</span><span>{item.duracionMeses} meses</span><span>{item._count?.matriculas || 0} matrículas</span></footer></article>)}</div>
  </section>;
}
