import { useEffect, useState } from 'react';
import api from '../services/api';
import { AuditLog } from '../types';
import styles from '../styles/Workspace.module.css';
import ops from '../styles/Operations.module.css';

const actionLabel=(value:string)=>value.replace(/_/g,' ').toLowerCase();
export function AuditoriaPage(){
  const [items,setItems]=useState<AuditLog[]>([]); const [entidad,setEntidad]=useState(''); const [error,setError]=useState('');
  const load=()=>api.getAudit({entidad:entidad||undefined,limit:50}).then(r=>setItems(r.data)).catch(()=>setError('No fue posible cargar la trazabilidad.'));
  useEffect(()=>{void load();},[]);
  return <section className={styles.page}><header className={styles.pageHeader}><div><span className={styles.eyebrow}>SEGURIDAD Y CUMPLIMIENTO</span><h2>Auditoría</h2><p>Registro verificable de operaciones sensibles realizadas en el sistema.</p></div></header>{error&&<div className={styles.error}>{error}</div>}
    <div className={ops.filters}><label>Entidad<select value={entidad} onChange={e=>setEntidad(e.target.value)}><option value="">Todas</option><option>Estudiante</option><option>Matricula</option></select></label><button className={ops.secondary} onClick={()=>void load()}>Aplicar</button></div>
    <div className={styles.dataTable}><table><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Referencia</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td>{new Date(item.createdAt).toLocaleString('es-CO')}</td><td><strong>{item.user.nombre}</strong><small>{item.user.email}</small></td><td>{actionLabel(item.accion)}</td><td>{item.entidad}</td><td><code>{item.entidadId.slice(0,12)}</code></td></tr>)}</tbody></table>{!items.length&&<p className={styles.empty}>No hay eventos para este filtro.</p>}</div>
  </section>;
}
