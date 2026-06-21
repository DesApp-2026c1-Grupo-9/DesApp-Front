import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
import { EstudianteDashboard } from '../pages/EstudianteDashboard';
import { EditarPerfil } from '../pages/EditarPerfil';
import { PrivacidadPerfil } from '../pages/PrivacidadPerfil';
import { PerfilUsuario } from '../pages/PerfilUsuario';
import { MateriasVisitante } from '../pages/MateriasVisitante';
import { EstudianteMaterias } from '../pages/EstudianteMaterias';
import { SelectorEstudiante } from '../pages/SelectorEstudiante';
import Materiales from '../pages/Materiales';
import AdminPage from '../pages/AdminPage';
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

const AuthLayout = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
    <Outlet />
  </Box>
);

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
              <Route path="/mi-perfil" element={<EstudianteDashboard />} />
              <Route path="/configuracion" element={<EditarPerfil />} />
              <Route path="/privacidad" element={<PrivacidadPerfil />} />
              <Route path="/perfil/:id" element={<PerfilUsuario />} />
              <Route path="/perfil/:id/materias" element={<MateriasVisitante />} />
              <Route path="/academico" element={<AcademicoPage />}>
                <Route index element={<Navigate to="/academico/carreras" replace />} />
                <Route path="mis-materias" element={<EstudianteMaterias />} />
                <Route path="carreras" element={<CareerManagementPage />} />
              </Route>
              <Route path="/asistente" element={<AsistenteAcademico />} />
              <Route path="/materias" element={<SubjectManagementPage />} />
              <Route path="/demo-selector" element={<SelectorEstudiante />} />
              <Route path="/notificaciones" element={<Notificaciones />} />
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/admin/usuarios" element={<AdminPage />} />
              <Route path="/admin/academico" element={<AdminAcademicoPage />} />
              <Route path="/admin/moderacion" element={<AdminModeracionPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<AppErrorPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
