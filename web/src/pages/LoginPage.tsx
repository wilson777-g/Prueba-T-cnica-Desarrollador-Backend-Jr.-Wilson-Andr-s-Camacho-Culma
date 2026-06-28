import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import styles from '../styles/Auth.module.css';

const warmUpServer = async () => {
  try {
    await apiService.warmUp();
  } catch {
    // El backend puede tardar unos segundos en responder; el login mostrara el error si persiste.
  }
};

export const LoginPage: React.FC = () => {
  const demoPasswordMask = '********';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  const credentials = [
    {
      role: 'ADMIN',
      roleLabel: 'Rol administrador',
      email: 'admin@example.test',
      password: 'DemoAdmin123!',
    },
    {
      role: 'OPERADOR',
      roleLabel: 'Rol operador',
      email: 'operador.bogota@example.test',
      password: 'DemoOper123!',
    },
  ];

  useEffect(() => {
    void warmUpServer();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await warmUpServer();
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

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.brandHeader}>
          <div className={styles.brandMark} aria-hidden="true">
            SG
          </div>
          <div>
            <h1 className={styles.title}>Sistema de Gestion Academica</h1>
            <p>Gestion de estudiantes por sede</p>
          </div>
        </div>

        <h2>Iniciar Sesion</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
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
