import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import styles from '../styles/Auth.module.css';

type ServerStatus = 'checking' | 'ready' | 'slow' | 'error';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@dnamusic.co');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const apiUrl = apiService.getApiBaseUrl();
  const serverStatusClass = serverStatus === 'error' ? styles.serverError : styles[serverStatus];

  const credentials = [
    {
      role: 'ADMIN',
      email: 'admin@dnamusic.co',
      password: 'Admin123!',
    },
    {
      role: 'OPERADOR',
      email: 'operador.bog@dnamusic.co',
      password: 'Oper123!',
    },
  ];

  const warmUpServer = async () => {
    setServerStatus('checking');

    try {
      await apiService.warmUp();
      setServerStatus('ready');
      return true;
    } catch {
      setServerStatus('error');
      return false;
    }
  };

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (active) {
        setServerStatus('slow');
      }
    }, 3500);

    apiService
      .warmUp()
      .then(() => {
        if (active) {
          setServerStatus('ready');
        }
      })
      .catch(() => {
        if (active) {
          setServerStatus('error');
        }
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (serverStatus !== 'ready') {
        const serverReady = await warmUpServer();
        if (!serverReady) {
          setError('El servidor de demo aun no responde. Espera unos segundos y vuelve a intentar.');
          return;
        }
      }

      await apiService.login(email, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  const copyCredential = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
    } catch {
      setError('No se pudo copiar el dato. Copialo manualmente.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.brandHeader}>
          <div className={styles.brandMark} aria-hidden="true">
            DN
          </div>
          <div>
            <h1 className={styles.title}>DNA Music</h1>
            <p>Gestion de estudiantes por sede</p>
          </div>
        </div>

        <h2>Iniciar Sesion</h2>

        <div className={`${styles.serverStatus} ${serverStatusClass}`}>
          <div>
            <strong>
              {serverStatus === 'ready'
                ? 'Servidor listo'
                : serverStatus === 'slow'
                  ? 'Despertando servidor'
                  : serverStatus === 'error'
                    ? 'Servidor en espera'
                    : 'Preparando servidor'}
            </strong>
            <span>{apiUrl}</span>
          </div>
          <button type="button" onClick={warmUpServer} disabled={serverStatus === 'checking'} className={styles.warmupBtn}>
            {serverStatus === 'checking' ? 'Verificando...' : 'Activar API'}
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Iniciando sesion...' : 'Ingresar'}
          </button>
        </form>

        <div className={styles.testCreds}>
          <div className={styles.credsHeader}>
            <h3>Credenciales de prueba</h3>
            <span>Copiar y pegar</span>
          </div>

          <div className={styles.credsList}>
            {credentials.map(credential => (
              <div key={credential.role} className={styles.credentialCard}>
                <strong>{credential.role}</strong>

                <div className={styles.credentialRow}>
                  <span>Email</span>
                  <code>{credential.email}</code>
                  <button
                    type="button"
                    onClick={() => copyCredential(credential.email, `${credential.role}-email`)}
                    className={styles.copyBtn}
                  >
                    {copiedField === `${credential.role}-email` ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <div className={styles.credentialRow}>
                  <span>Clave</span>
                  <code>{credential.password}</code>
                  <button
                    type="button"
                    onClick={() => copyCredential(credential.password, `${credential.role}-password`)}
                    className={styles.copyBtn}
                  >
                    {copiedField === `${credential.role}-password` ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
