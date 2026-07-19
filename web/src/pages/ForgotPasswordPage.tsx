import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import styles from '../styles/Auth.module.css';
import recovery from '../styles/Recovery.module.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setMessage('');
    try { setMessage((await api.forgotPassword(email)).message); }
    catch { setMessage('No fue posible procesar la solicitud. Intenta nuevamente más tarde.'); }
    finally { setLoading(false); }
  };
  return <div className={styles.container}><section className={`${styles.loginBox} ${recovery.singlePanel}`}>
    <div className={styles.brandHeader}><div className={styles.brandMark}>DNA</div><div><h1 className={styles.title}>Recuperar acceso</h1><p>DNA Music · Seguridad institucional</p></div></div>
    <h2>Restablecimiento de contraseña</h2><p className={recovery.helpText}>Escribe el correo asociado a tu cuenta. Por seguridad, la respuesta será la misma exista o no el usuario.</p>
    {message && <div className={recovery.notice} role="status">{message}</div>}
    <form onSubmit={submit}><div className={styles.formGroup}><label htmlFor="recovery-email">Correo institucional</label><input id="recovery-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" /></div><button className={styles.submitBtn} disabled={loading}>{loading?'Enviando…':'Enviar instrucciones'}</button><Link className={recovery.recoveryLink} to="/login">Volver al acceso</Link></form>
  </section></div>;
}
