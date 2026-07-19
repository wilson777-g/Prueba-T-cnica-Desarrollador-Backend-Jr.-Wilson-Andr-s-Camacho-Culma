import { FormEvent, useEffect, useState } from 'react';
import api from '../services/api';
import { Estudiante, Matricula, Programa, Sede, User } from '../types';
import styles from '../styles/Workspace.module.css';

export function MatriculasPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
  const [items, setItems] = useState<Matricula[]>([]);
  const [students, setStudents] = useState<Estudiante[]>([]);
  const [programs, setPrograms] = useState<Programa[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const currentPeriod = `${new Date().getFullYear()}-${new Date().getMonth() < 6 ? '1' : '2'}`;
  const [form, setForm] = useState({ estudianteId: '', programaId: '', sedeId: user.sedeId || '', periodo: currentPeriod });
  const load = () => Promise.all([api.getMatriculas().then(setItems), api.getEstudiantes({limit:100}).then(r => setStudents(r.data)), api.getProgramas().then(setPrograms), api.getSedes().then(setSedes)]).catch(() => setError('No fue posible cargar la información de matrículas.'));
  useEffect(() => { void load(); }, []);
  const submit = async (e: FormEvent) => { e.preventDefault(); setError(''); try { await api.createMatricula(form); setShow(false); setForm({...form,estudianteId:'',programaId:''}); load(); } catch (err) { setError('No fue posible registrar la matrícula. Verifica sede, estado y duplicidad.'); } };
  return <section className={styles.page}><header className={styles.pageHeader}><div><span className={styles.eyebrow}>ADMISIONES Y REGISTRO</span><h2>Matrículas</h2><p>Vinculación formal de estudiantes con programa, sede y periodo académico.</p></div><button className={styles.primary} onClick={() => setShow(!show)}>{show ? 'Cancelar' : 'Registrar matrícula'}</button></header>
    {error && <div className={styles.error}>{error}</div>}
    {show && <form className={styles.formPanel} onSubmit={submit}><label>Estudiante<select value={form.estudianteId} onChange={e=>setForm({...form,estudianteId:e.target.value,sedeId:students.find(s=>s.id===e.target.value)?.sedeId||form.sedeId})} required><option value="">Seleccionar</option>{students.filter(s=>s.estado==='ACTIVO').map(s=><option key={s.id} value={s.id}>{s.nombreCompleto} · {s.documento}</option>)}</select></label><label>Programa<select value={form.programaId} onChange={e=>setForm({...form,programaId:e.target.value})} required><option value="">Seleccionar</option>{programs.filter(p=>p.estado==='ACTIVO').map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label><label>Sede<select value={form.sedeId} disabled={user.rol==='OPERADOR'} onChange={e=>setForm({...form,sedeId:e.target.value})} required><option value="">Seleccionar</option>{sedes.map(s=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select></label><label>Periodo<input value={form.periodo} pattern="20[0-9]{2}-[12]" onChange={e=>setForm({...form,periodo:e.target.value})} required /></label><button className={styles.primary}>Confirmar matrícula</button></form>}
    <div className={styles.dataTable}><table><thead><tr><th>Estudiante</th><th>Programa</th><th>Sede</th><th>Periodo</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong>{item.estudiante.nombreCompleto}</strong><small>{item.estudiante.documento}</small></td><td>{item.programa.nombre}</td><td>{item.sede.nombre}</td><td>{item.periodo}</td><td>{new Date(item.fechaMatricula).toLocaleDateString('es-CO')}</td><td><span className={`${styles.state} ${item.estado==='ACTIVA'?styles.ok:''}`}>{item.estado}</span></td></tr>)}</tbody></table>{!items.length && <p className={styles.empty}>No hay matrículas registradas.</p>}</div>
  </section>;
}
