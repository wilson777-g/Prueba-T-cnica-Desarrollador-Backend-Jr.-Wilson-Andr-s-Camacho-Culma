import { FormEvent, useEffect, useState } from 'react';
import api from '../services/api';
import { Programa, User } from '../types';
import styles from '../styles/Workspace.module.css';
import ops from '../styles/Operations.module.css';

const blank = { codigo: '', nombre: '', descripcion: '', duracionMeses: 6, modalidad: 'PRESENCIAL' as Programa['modalidad'] };

export function ProgramasPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
  const [items, setItems] = useState<Programa[]>([]); const [show,setShow]=useState(false); const [editing,setEditing]=useState<Programa|null>(null);
  const [error,setError]=useState(''); const [notice,setNotice]=useState(''); const [form,setForm]=useState(blank);
  const load=()=>api.getProgramas().then(setItems).catch(()=>setError('No fue posible cargar los programas.'));
  useEffect(()=>{void load();},[]);
  const openCreate=()=>{setEditing(null);setForm(blank);setShow(true);};
  const openEdit=(item:Programa)=>{setEditing(item);setForm({codigo:item.codigo,nombre:item.nombre,descripcion:item.descripcion||'',duracionMeses:item.duracionMeses,modalidad:item.modalidad});setShow(true);};
  const submit=async(e:FormEvent)=>{e.preventDefault();setError('');setNotice('');try{if(editing)await api.updatePrograma(editing.id,{nombre:form.nombre,descripcion:form.descripcion,duracionMeses:form.duracionMeses,modalidad:form.modalidad});else await api.createPrograma(form);setNotice(editing?'Programa actualizado.':'Programa creado.');setShow(false);await load();}catch{setError('No fue posible guardar el programa. Verifica código y nombre.');}};
  const toggle=async(item:Programa)=>{setError('');try{await api.updatePrograma(item.id,{estado:item.estado==='ACTIVO'?'INACTIVO':'ACTIVO'});setNotice('Disponibilidad del programa actualizada.');await load();}catch{setError('No fue posible modificar el programa.');}};
  return <section className={styles.page}><header className={styles.pageHeader}><div><span className={styles.eyebrow}>CATÁLOGO ACADÉMICO</span><h2>Programas de formación</h2><p>Oferta institucional, modalidades y trazabilidad de matrículas.</p></div>{user.rol==='ADMIN'&&<button className={styles.primary} onClick={openCreate}>Nuevo programa</button>}</header>
    {error&&<div className={styles.error}>{error}</div>}{notice&&<div className={ops.notice}>{notice}</div>}
    {show&&<form className={styles.formPanel} onSubmit={submit}><label>Código<input value={form.codigo} disabled={!!editing} onChange={e=>setForm({...form,codigo:e.target.value.toUpperCase()})} required /></label><label>Nombre<input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required /></label><label>Duración (meses)<input type="number" min="1" max="60" value={form.duracionMeses} onChange={e=>setForm({...form,duracionMeses:Number(e.target.value)})} required /></label><label>Modalidad<select value={form.modalidad} onChange={e=>setForm({...form,modalidad:e.target.value as Programa['modalidad']})}><option>PRESENCIAL</option><option>HIBRIDA</option><option>VIRTUAL</option></select></label><label className={styles.wide}>Descripción<input value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} /></label><div className={ops.formActions}><button type="button" className={ops.secondary} onClick={()=>setShow(false)}>Cancelar</button><button className={styles.primary}>Guardar</button></div></form>}
    <div className={styles.catalog}>{items.map(item=><article key={item.id}><div><span className={styles.code}>{item.codigo}</span><span className={`${styles.state} ${item.estado==='ACTIVO'?styles.ok:''}`}>{item.estado}</span></div><h3>{item.nombre}</h3><p>{item.descripcion||'Programa institucional de formación musical.'}</p><footer><span>{item.modalidad.toLowerCase()}</span><span>{item.duracionMeses} meses</span><span>{item._count?.matriculas||0} matrículas</span></footer>{user.rol==='ADMIN'&&<div className={ops.cardActions}><button className={ops.secondary} onClick={()=>openEdit(item)}>Editar</button><button className={ops.textButton} onClick={()=>void toggle(item)}>{item.estado==='ACTIVO'?'Archivar':'Activar'}</button></div>}</article>)}</div>
  </section>;
}
