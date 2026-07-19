import { FormEvent, useEffect, useState } from 'react';
import api from '../services/api';
import { Sede, User } from '../types';
import styles from '../styles/Workspace.module.css';
import ops from '../styles/Operations.module.css';

export function OperadoresPage() {
  const [items,setItems]=useState<User[]>([]); const [sedes,setSedes]=useState<Sede[]>([]); const [show,setShow]=useState(false); const [error,setError]=useState(''); const [notice,setNotice]=useState('');
  const [form,setForm]=useState({nombre:'',email:'',sedeId:'',password:''});
  const [temporary,setTemporary]=useState<{name:string;password:string}|null>(null);
  const load=()=>Promise.all([api.getOperadores().then(setItems),api.getSedes().then(setSedes)]).catch(()=>setError('No fue posible cargar los responsables de sede.'));
  useEffect(()=>{void load();},[]);
  const submit=async(e:FormEvent)=>{e.preventDefault();setError('');try{await api.createOperador(form);setNotice('Responsable creado correctamente.');setShow(false);setForm({nombre:'',email:'',sedeId:'',password:''});await load();}catch{setError('No fue posible crear el responsable. Revisa el correo, sede y contraseña.');}};
  const toggle=async(item:User)=>{setError('');try{await api.updateOperador(item.id,{activo:!item.activo});setNotice(`Acceso ${item.activo?'desactivado':'activado'}.`);await load();}catch{setError('No fue posible modificar el acceso.');}};
  const resetPassword=async(item:User)=>{if(!window.confirm(`¿Emitir una credencial temporal para ${item.nombre}? Sus sesiones actuales serán revocadas.`))return;setError('');try{const result=await api.resetOperadorPassword(item.id);setTemporary({name:item.nombre,password:result.temporaryPassword});await load();}catch{setError('No fue posible emitir la credencial temporal.');}};
  return <section className={styles.page}><header className={styles.pageHeader}><div><span className={styles.eyebrow}>CONTROL DE ACCESO</span><h2>Responsables de sede</h2><p>Usuarios autorizados, asignación territorial y último ingreso.</p></div><button className={styles.primary} onClick={()=>setShow(!show)}>{show?'Cancelar':'Nuevo responsable'}</button></header>
    {error&&<div className={styles.error}>{error}</div>}{notice&&<div className={ops.notice}>{notice}</div>}{temporary&&<div className={ops.notice}><strong>Credencial temporal para {temporary.name}</strong><p><code>{temporary.password}</code></p><p>Cópiala ahora: no volverá a mostrarse y deberá cambiarse en el primer ingreso.</p><button className={ops.secondary} onClick={()=>setTemporary(null)}>Ya la guardé</button></div>}
    {show&&<form className={styles.formPanel} onSubmit={submit}><label>Nombre<input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required/></label><label>Correo<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label><label>Sede<select value={form.sedeId} onChange={e=>setForm({...form,sedeId:e.target.value})} required><option value="">Seleccionar</option>{sedes.filter(s=>s.estado==='ACTIVA').map(s=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select></label><label>Contraseña inicial<input type="password" minLength={8} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></label><button className={styles.primary}>Crear acceso</button></form>}
    <div className={styles.dataTable}><table><thead><tr><th>Responsable</th><th>Sede</th><th>Último ingreso</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong>{item.nombre}</strong><small>{item.email}</small></td><td>{item.sede?.nombre||'Sin asignar'}</td><td>{item.ultimoLogin?new Date(item.ultimoLogin).toLocaleString('es-CO'):'Sin ingresos'}</td><td><span className={`${styles.state} ${item.activo?styles.ok:''}`}>{item.activo?'ACTIVO':'INACTIVO'}</span></td><td><button className={ops.textButton} onClick={()=>void resetPassword(item)}>Restablecer clave</button><button className={ops.textButton} onClick={()=>void toggle(item)}>{item.activo?'Desactivar':'Activar'}</button></td></tr>)}</tbody></table></div>
  </section>;
}
