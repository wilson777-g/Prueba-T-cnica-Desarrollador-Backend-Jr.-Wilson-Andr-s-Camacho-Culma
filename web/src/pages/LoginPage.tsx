import React, { useState } from 'react';
import apiService from '../services/api';
import styles from '../styles/Auth.module.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@dnamusic.co');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiService.login(email, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>🎵 DNA Music</h1>
        <h2>Iniciar Sesión</h2>

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
            <label htmlFor="password">Contraseña</label>
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
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>

        <div className={styles.testCreds}>
          <h3>Credenciales de prueba:</h3>
          <p><strong>ADMIN:</strong> admin@dnamusic.co / Admin123!</p>
          <p><strong>OPERADOR:</strong> operador.bog@dnamusic.co / Oper123!</p>
        </div>
      </div>
    </div>
  );
};
