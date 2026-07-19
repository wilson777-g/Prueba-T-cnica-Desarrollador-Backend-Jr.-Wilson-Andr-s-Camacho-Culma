import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import styles from '../styles/Auth.module.css';
import recovery from '../styles/Recovery.module.css';

export function ResetPasswordPage() {
  const [params] = useSearchParams(); const token = params.get('token') || '';
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState(''); const [success, setSuccess] = useState(false); const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setMessage(''); if(password!==confirm){setMessage('Las contraseñas no coinciden.');return;} setLoading(true); try{setMessage((await api.resetPassword(token,password)).message);setSuccess(true);}catch(error: unknown){const response=(error as {response?:{data?:{message?:string}}}).response;setMessage(response?.data?.message || 'El enlace no es válido o ya expiró.');}finally{setLoading(false);} };
  return <div className={styles.container}><section className={`${styles.loginBox} ${recovery.singlePanel}`}>
    <div className={styles.brandHeader}><div className={styles.brandMark}>DNA</div><div><h1 className={styles.title}>Nueva contraseña</h1><p>Enlace protegido de un solo uso</p></div></div>
    {!token?<div className={styles.error}>El enlace de recuperación está incompleto.</div>:<><p className={recovery.helpText}>Usa mínimo 12 caracteres e incluye mayúscula, minúscula, número y carácter especial.</p>{message&&<div className={success?recovery.notice:styles.error} role="status">{message}</div>}{!success&&<form onSubmit={submit}><div className={styles.formGroup}><label htmlFor="new-password">Nueva contraseña</label><input id="new-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={12} required autoComplete="new-password" /></div><div className={styles.formGroup}><label htmlFor="confirm-password">Confirmar contraseña</label><input id="confirm-password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={12} required autoComplete="new-password" /></div><button className={styles.submitBtn} disabled={loading}>{loading?'Actualizando…':'Actualizar contraseña'}</button></form>}</>}
    <Link className={recovery.recoveryLink} to="/login">Ir al acceso institucional</Link>
  </section></div>;
}
