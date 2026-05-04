import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Perfil from '../pages/Perfil';
import Sesiones from '../pages/Sesiones';
import Feed from '../pages/Feed';
import Conexiones from '../pages/Conexiones';
// Páginas del sistema académico
import { StudentProfilePage } from '../pages/StudentProfilePage';
import { CareerManagementPage } from '../pages/CareerManagementPage';
import { SubjectManagementPage } from '../pages/SubjectManagementPage';
import { EstudianteDashboard } from '../pages/EstudianteDashboard';
import { EstudianteMaterias } from '../pages/EstudianteMaterias';
import { SelectorEstudiante } from '../pages/SelectorEstudiante';
import { TopMenu } from '../components/TopMenu';
import AuthProvider from '../context/AuthContext';

const AppRouter = () => {
  return (
    <AuthProvider>
      <Router>
        <TopMenu />
        <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/sesiones" element={<Sesiones />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/conexiones" element={<Conexiones />} />
            {/* Rutas del sistema académico - Solo para el estudiante actual */}
            <Route path="/mi-perfil" element={<EstudianteDashboard />} />
            <Route path="/mis-materias" element={<EstudianteMaterias />} />
            <Route path="/carreras" element={<CareerManagementPage />} />
            <Route path="/materias" element={<SubjectManagementPage />} />
            {/* Ruta especial para demostración - cambiar estudiante */}
            <Route path="/demo-selector" element={<SelectorEstudiante />} />
          </Routes>
        </Box>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;
