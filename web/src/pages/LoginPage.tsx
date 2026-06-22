import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import styles from '../styles/Auth.module.css';

type ServerStatus = 'checking' | 'ready' | 'slow' | 'error';

export const LoginPage: React.FC = () => {
  const demoPasswordMask = '********';
  const [email, setEmail] = useState('admin@dnamusic.co');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const serverStatusClass = serverStatus === 'error' ? styles.serverError : styles[serverStatus];

  const credentials = [
    {
      role: 'ADMIN',
      roleLabel: 'Rol administrador',
      email: 'admin@dnamusic.co',
      password: 'Admin123!',
    },
    {
      role: 'OPERADOR',
      roleLabel: 'Rol operador',
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
          setError('No se pudo verificar el estado del servidor, pero intentaremos iniciar sesion directamente.');
        }
      }

      await apiService.login(email, password);
      window.location.href = '/';
    } catch (err: any) {
      const statusCode = err.response?.status;

      if (!statusCode || statusCode >= 500) {
        setError('El servicio esta iniciando. Intenta nuevamente en unos segundos.');
      } else {
        setError('No fue posible iniciar sesion. Revisa las credenciales e intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyCredential = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
    } catch {
      setError('No se pudo copiar automaticamente. Intenta nuevamente.');
    }
  };

  const serverStatusTitle = {
    ready: 'Servicio conectado',
    slow: 'Servicio iniciando',
    error: 'Servicio en espera',
    checking: 'Verificando servicio',
  }[serverStatus];

  const serverStatusDetail = {
    ready: 'API disponible para iniciar sesion',
    slow: 'La demo puede tardar unos segundos en responder',
    error: 'Intenta nuevamente en unos segundos',
    checking: 'Validando disponibilidad de la demo',
  }[serverStatus];

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
            <strong>{serverStatusTitle}</strong>
            <span>{serverStatusDetail}</span>
          </div>
          <button type="button" onClick={warmUpServer} disabled={serverStatus === 'checking'} className={styles.warmupBtn}>
            {serverStatus === 'checking' ? 'Verificando...' : 'Verificar servicio'}
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
            <div>
              <h3>Acceso demo para evaluacion tecnica</h3>
              <p>Credenciales disponibles para prueba controlada</p>
            </div>
            <span>Copiar y pegar</span>
          </div>

          <div className={styles.credsList}>
            {credentials.map(credential => (
              <div key={credential.role} className={styles.credentialCard}>
                <strong>{credential.roleLabel}</strong>

                <div className={styles.credentialRow}>
                  <span>Usuario</span>
                  <div className={styles.credentialValue}>
                    <code>{credential.email}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCredential(credential.email, `${credential.role}-email`)}
                    className={styles.copyBtn}
                  >
                    {copiedField === `${credential.role}-email` ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <div className={styles.credentialRow}>
                  <span>Contrasena</span>
                  <div className={styles.credentialValue}>
                    <code aria-label="Contrasena demo oculta">{demoPasswordMask}</code>
                    <small>Oculta por seguridad</small>
                  </div>
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
