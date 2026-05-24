import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Sesiones from '../pages/Sesiones';
import Feed from '../pages/Feed';
import Conexiones from '../pages/Conexiones';
import { StudentProfilePage } from '../pages/StudentProfilePage';
import { CareerManagementPage } from '../pages/CareerManagementPage';
import { SubjectManagementPage } from '../pages/SubjectManagementPage';
import { EstudianteDashboard } from '../pages/EstudianteDashboard';
import { EstudianteMaterias } from '../pages/EstudianteMaterias';
import { SelectorEstudiante } from '../pages/SelectorEstudiante';
import Materiales from '../pages/Materiales';
import AdminPage from '../pages/AdminPage';
import AdminAcademicoPage from '../pages/AdminAcademicoPage';
import AppErrorPage from '../pages/AppErrorPage';
import AuthProvider from '../context/AuthContext';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';

const AppRouter = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/error" element={<AppErrorPage />} />
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sesiones" element={<Sesiones />} />
            <Route path="/materiales" element={<Materiales />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/conexiones" element={<Conexiones />} />
            <Route path="/mi-perfil" element={<EstudianteDashboard />} />
            <Route path="/mis-materias" element={<EstudianteMaterias />} />
            <Route path="/carreras" element={<CareerManagementPage />} />
            <Route path="/materias" element={<SubjectManagementPage />} />
            <Route path="/demo-selector" element={<SelectorEstudiante />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin/usuarios" element={<AdminPage />} />
            <Route path="/admin/academico" element={<AdminAcademicoPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<AppErrorPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
