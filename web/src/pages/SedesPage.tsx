import { FormEvent, useEffect, useState } from 'react';
import api from '../services/api';
import { Sede } from '../types';
import styles from '../styles/Workspace.module.css';
import ops from '../styles/Operations.module.css';

const emptyForm = { nombre: '', ciudad: '', direccion: '' };

export function SedesPage() {
  const [items, setItems] = useState<Sede[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Sede | null>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = () => api.getSedes().then(setItems).catch(() => setError('No fue posible cargar las sedes.'));
  useEffect(() => { void load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShow(true); setError(''); };
  const openEdit = (item: Sede) => { setEditing(item); setForm({ nombre: item.nombre, ciudad: item.ciudad, direccion: item.direccion }); setShow(true); setError(''); };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    try {
      if (editing) await api.updateSede(editing.id, form); else await api.createSede(form);
      setNotice(editing ? 'La sede fue actualizada.' : 'La sede fue creada.'); setShow(false); await load();
    } catch { setError('No fue posible guardar la sede. Verifica que el nombre sea único.'); }
  };
  const toggle = async (item: Sede) => {
    setError(''); setNotice('');
    try { await api.updateSede(item.id, { estado: item.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA' }); setNotice('El estado operativo fue actualizado.'); await load(); }
    catch { setError('No fue posible cambiar el estado de la sede.'); }
  };

  return <section className={styles.page}>
    <header className={styles.pageHeader}><div><span className={styles.eyebrow}>CONFIGURACIÓN INSTITUCIONAL</span><h2>Sedes</h2><p>Administración de cobertura, responsables y población académica.</p></div><button className={styles.primary} onClick={openCreate}>Nueva sede</button></header>
    {error && <div className={styles.error}>{error}</div>}{notice && <div className={ops.notice}>{notice}</div>}
    {show && <form className={styles.formPanel} onSubmit={submit}><label>Nombre<input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required /></label><label>Ciudad<input value={form.ciudad} onChange={e=>setForm({...form,ciudad:e.target.value})} required /></label><label className={styles.wide}>Dirección<input value={form.direccion} onChange={e=>setForm({...form,direccion:e.target.value})} required /></label><div className={ops.formActions}><button type="button" className={ops.secondary} onClick={()=>setShow(false)}>Cancelar</button><button className={styles.primary}>Guardar</button></div></form>}
    <div className={styles.catalog}>{items.map(item=><article key={item.id}><div><span className={styles.code}>{item.ciudad.toUpperCase()}</span><span className={`${styles.state} ${item.estado==='ACTIVA'?styles.ok:''}`}>{item.estado}</span></div><h3>{item.nombre}</h3><p>{item.direccion}</p><footer><span>{item._count?.estudiantes || 0} estudiantes</span><span>{item._count?.usuarios || 0} responsables</span></footer><div className={ops.cardActions}><button className={ops.secondary} onClick={()=>openEdit(item)}>Editar</button><button className={ops.textButton} onClick={()=>void toggle(item)}>{item.estado==='ACTIVA'?'Desactivar':'Activar'}</button></div></article>)}</div>
  </section>;
}
