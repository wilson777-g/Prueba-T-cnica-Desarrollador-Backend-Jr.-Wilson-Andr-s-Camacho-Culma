import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import styles from '../styles/Auth.module.css';
import recovery from '../styles/Recovery.module.css';
import { Link } from 'react-router-dom';

const warmUpServer = () => apiService.warmUp();

type ApiStatusError = {
  response?: {
    status?: number;
  };
};

const getStatusCode = (error: unknown) => (error as ApiStatusError).response?.status;

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'ready' | 'delayed'>('checking');

  const credentials = [
    {
      role: 'ADMIN',
      roleLabel: 'Administración general',
      email: 'admin@example.test',
      password: 'DemoAdmin123!',
    },
    {
      role: 'OPERADOR',
      roleLabel: 'Coordinación de sede',
      email: 'operador.bogota@example.test',
      password: 'DemoOper123!',
    },
  ];

  useEffect(() => {
    warmUpServer().then(() => setServiceStatus('ready')).catch(() => setServiceStatus('delayed'));
  }, []);

  const useInstitutionalAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setSelectedProfile(demoEmail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = await apiService.login(email, password);
      window.location.href = session.user.mustChangePassword ? '/seguridad' : '/';
    } catch (err: unknown) {
      const statusCode = getStatusCode(err);

      if (!statusCode || statusCode >= 500) {
        setError('El servicio académico no respondió a tiempo. Intenta nuevamente en unos segundos.');
      } else {
        setError('No fue posible iniciar sesion. Revisa las credenciales e intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.brandHeader}>
          <div className={styles.brandMark} aria-hidden="true">DNA</div>
          <div>
            <h1 className={styles.title}>DNA Music</h1>
            <p>Plataforma de gestión académica multisede</p>
          </div>
        </div>

        <h2>Acceso institucional</h2>
        <div className={`${styles.service} ${styles[serviceStatus]}`}><span />{serviceStatus === 'ready' ? 'Servicio disponible' : serviceStatus === 'checking' ? 'Verificando servicio académico…' : 'El servidor está despertando; puede tardar unos segundos.'}</div>

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
          <Link className={recovery.recoveryLink} to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
        </form>

        <div className={styles.testCreds}>
          <div className={styles.credsHeader}>
            <div>
          <h3>Perfiles de evaluación</h3>
              <p>Acceso controlado para revisar los flujos según nivel de autorización.</p>
            </div>
            <span>Entorno de portafolio</span>
          </div>

          <div className={styles.credsList}>
            {credentials.map(credential => (
              <div key={credential.role} className={styles.credentialCard}>
                <strong>{credential.roleLabel}</strong>

                <p>{credential.role === 'ADMIN' ? 'Configura programas, revisa sedes y consulta indicadores globales.' : 'Gestiona estudiantes y matrículas de la sede asignada.'}</p>
                <button type="button" onClick={() => useInstitutionalAccount(credential.email, credential.password)} className={styles.copyBtn}>{selectedProfile === credential.email ? 'Perfil seleccionado' : 'Seleccionar perfil'}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
