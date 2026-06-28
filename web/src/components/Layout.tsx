import React, { useState, useEffect } from 'react';
import { User } from '../types';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const roleLabel = user?.rol === 'ADMIN' ? 'Administrador' : 'Operador';
  const roleDetail = user?.rol === 'ADMIN' ? 'Control general de sedes' : 'Gestion de sede asignada';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <div className={styles.brandMark} aria-hidden="true">
              SG
            </div>
            <div>
              <h1 className={styles.logo}>Sistema de Gestion Academica</h1>
              <span className={styles.logoCaption}>Sistema de Gestion Academica</span>
            </div>
          </div>
          {user && (
            <div className={styles.userInfo}>
              <div className={styles.identity}>
                <span className={styles.userName}>{user.nombre}</span>
                <span className={styles.roleDetail}>{roleDetail}</span>
              </div>
              <span
                className={`${styles.badge} ${
                  user.rol === 'ADMIN' ? styles.adminBadge : styles.operatorBadge
                }`}
              >
                {roleLabel}
              </span>
              <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
                Cerrar sesion
              </button>
            </div>
          )}
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
};
