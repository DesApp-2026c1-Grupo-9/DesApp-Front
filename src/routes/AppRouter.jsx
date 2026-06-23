import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Sesiones from '../pages/Sesiones';
import SocialPage from '../pages/SocialPage';
import AcademicoPage from '../pages/AcademicoPage';
import Feed from '../pages/Feed';
import Conexiones from '../pages/Conexiones';
import { StudentProfilePage } from '../pages/StudentProfilePage';
import { CareerManagementPage } from '../pages/CareerManagementPage';
import { SubjectManagementPage } from '../pages/SubjectManagementPage';
import ConfiguracionPage from '../pages/ConfiguracionPage';
import MiPerfilPage from '../pages/MiPerfilPage';
import { PerfilUsuario } from '../pages/PerfilUsuario';
import { MateriasVisitante } from '../pages/MateriasVisitante';
import { EstudianteMaterias } from '../pages/EstudianteMaterias';
import Materiales from '../pages/Materiales';
import AdminPage from '../pages/AdminPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminAcademicoPage from '../pages/AdminAcademicoPage';
import AdminModeracionPage from '../pages/AdminModeracionPage';
import AppErrorPage from '../pages/AppErrorPage';
import AsistenteAcademico from '../pages/AsistenteAcademico';
import Notificaciones from '../pages/Notificaciones';
import AuthProvider from '../context/AuthContext';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import { fetchStudents } from '../features/auth/slice';
import { LoadingSpinner } from '../components/ui';

const AuthLayout = () => {
  const { user } = useSelector((state) => state.auth);
  if (user) {
    return <Navigate to="/" replace />;
  }
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
      <Outlet />
    </Box>
  );
};

const AppRouter = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner fullScreen message="Cargando módulo..." />}>
          <Routes>
            <Route path="/error" element={<AppErrorPage />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
            </Route>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/sesiones" element={<Sesiones />} />
              <Route path="/materiales" element={<Materiales />} />
              <Route path="/social" element={<SocialPage />}>
                <Route index element={<Navigate to="/social/feed" replace />} />
                <Route path="feed" element={<Feed />} />
                <Route path="conexiones" element={<Conexiones />} />
              </Route>
              <Route path="/configuracion" element={<ConfiguracionPage />} />
              <Route path="/mi-perfil" element={<MiPerfilPage />} />
              <Route path="/privacidad" element={<Navigate to="/configuracion" replace />} />
              <Route path="/perfil/:id" element={<PerfilUsuario />} />
              <Route path="/perfil/:id/materias" element={<MateriasVisitante />} />
              <Route path="/academico" element={<AcademicoPage />}>
                <Route index element={<Navigate to="/academico/carreras" replace />} />
                <Route path="mis-materias" element={<EstudianteMaterias />} />
                <Route path="carreras" element={<CareerManagementPage />} />
              </Route>
              <Route path="/asistente" element={<AsistenteAcademico />} />
              <Route path="/materias" element={<SubjectManagementPage />} />
              <Route path="/notificaciones" element={<Notificaciones />} />
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/admin/usuarios" element={<AdminPage />} />
              <Route path="/admin/academico" element={<AdminAcademicoPage />} />
              <Route path="/admin/moderacion" element={<AdminModeracionPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
            <Route path="*" element={<AppErrorPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
