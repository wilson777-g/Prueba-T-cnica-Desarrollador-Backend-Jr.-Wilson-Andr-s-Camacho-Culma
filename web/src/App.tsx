import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { EstudiantesPage } from './pages/EstudiantesPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProgramasPage } from './pages/ProgramasPage';
import { MatriculasPage } from './pages/MatriculasPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>;
  }

  const loginRoute = isAuthenticated ? <Navigate to="/" /> : <LoginPage />;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={loginRoute} />
        <Route path="/login.html" element={loginRoute} />
        <Route path="/" element={isAuthenticated ? <Layout><DashboardPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/estudiantes" element={isAuthenticated ? <Layout><EstudiantesPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/programas" element={isAuthenticated ? <Layout><ProgramasPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/matriculas" element={isAuthenticated ? <Layout><MatriculasPage /></Layout> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
