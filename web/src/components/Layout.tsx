import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from '../types';
import styles from '../styles/Layout.module.css';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; };
  const links = [{to:'/',label:'Resumen',mark:'R'},{to:'/estudiantes',label:'Estudiantes',mark:'E'},{to:'/matriculas',label:'Matrículas',mark:'M'},{to:'/programas',label:'Programas',mark:'P'},...(user.rol==='ADMIN'?[{to:'/sedes',label:'Sedes',mark:'S'}]:[])];
  return <div className={styles.shell}>
    <aside className={styles.sidebar}><div className={styles.brand}><span className={styles.brandMark}>DNA</span><div><strong>DNA Music</strong><small>Gestión académica</small></div></div>
      <nav aria-label="Navegación principal">{links.map(link=><NavLink key={link.to} to={link.to} end={link.to==='/'} className={({isActive})=>isActive?styles.active:''}><span>{link.mark}</span>{link.label}</NavLink>)}</nav>
      <div className={styles.scope}><small>Ámbito de acceso</small><strong>{user.rol==='ADMIN'?'Todas las sedes':'Sede asignada'}</strong></div>
    </aside>
    <div className={styles.workspace}><header className={styles.topbar}><div><span className={styles.mobileBrand}>DNA Music</span></div><div className={styles.user}><span className={styles.avatar}>{user.nombre?.charAt(0)||'U'}</span><div><strong>{user.nombre}</strong><small>{user.rol==='ADMIN'?'Administración general':'Coordinación de sede'}</small></div><button onClick={logout}>Cerrar sesión</button></div></header><main>{children}</main></div>
  </div>;
};
