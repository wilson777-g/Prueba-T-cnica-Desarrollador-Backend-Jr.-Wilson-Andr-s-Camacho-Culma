import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../types';
import styles from '../styles/Layout.module.css';
import api from '../services/api';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
  const logout = async () => { try { await api.logout(); } finally { localStorage.removeItem('user'); sessionStorage.removeItem('csrf_token'); window.location.href = '/login'; } };
  const links = [{to:'/',label:'Resumen',mark:'R'},{to:'/estudiantes',label:'Estudiantes',mark:'E'},{to:'/matriculas',label:'Matrículas',mark:'M'},{to:'/programas',label:'Programas',mark:'P'},...(user.rol==='ADMIN'?[{to:'/sedes',label:'Sedes',mark:'S'},{to:'/operadores',label:'Responsables',mark:'O'},{to:'/auditoria',label:'Auditoría',mark:'A'}]:[]),{to:'/seguridad',label:'Seguridad',mark:'C'}];

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  return <div className={styles.shell}>
    {menuOpen && <button type="button" className={styles.backdrop} aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}
    <aside id="primary-navigation" className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}><div className={styles.brand}><span className={styles.brandMark}>DNA</span><div><strong>DNA Music</strong><small>Gestión académica</small></div></div>
      <nav aria-label="Navegación principal">{links.map(link=><NavLink key={link.to} to={link.to} end={link.to==='/'} onClick={() => setMenuOpen(false)} className={({isActive})=>isActive?styles.active:''}><span>{link.mark}</span>{link.label}</NavLink>)}</nav>
      <div className={styles.scope}><small>Ámbito de acceso</small><strong>{user.rol==='ADMIN'?'Todas las sedes':'Sede asignada'}</strong></div>
    </aside>
    <div className={styles.workspace}><header className={styles.topbar}><div className={styles.mobileIdentity}><button type="button" className={styles.menuButton} aria-label={menuOpen ? 'Cerrar menú principal' : 'Abrir menú principal'} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(current => !current)}><span /><span /><span /></button><span className={styles.mobileBrand}>DNA Music</span></div><div className={styles.user}><span className={styles.avatar}>{user.nombre?.charAt(0)||'U'}</span><div><strong>{user.nombre}</strong><small>{user.rol==='ADMIN'?'Administración general':'Coordinación de sede'}</small></div><button onClick={logout}>Cerrar sesión</button></div></header><main>{children}</main></div>
  </div>;
};
