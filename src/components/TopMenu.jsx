import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Chip } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { School, Person, Book, Home, People, Groups, DynamicFeed } from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';

export function TopMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [estudianteActual, setEstudianteActual] = useState(null);

  // Cargar información del estudiante cuando estamos en rutas de estudiante
  useEffect(() => {
    if (id && location.pathname.includes('/estudiante/')) {
      EstudianteService.obtenerEstudiante(id)
        .then(estudiante => setEstudianteActual(estudiante))
        .catch(err => console.error('Error al cargar estudiante en TopMenu:', err));
    } else {
      setEstudianteActual(null);
    }
  }, [id, location.pathname]);

  // Función para obtener el path de materias con el ID correcto
  const getMateriasPath = () => {
    const estudianteId = id || '1'; // Si no hay ID, usar estudiante 1 por defecto
    return `/estudiante/${estudianteId}/materias`;
  };

  const menuItems = [
    { label: 'Inicio', path: '/', icon: <Home /> },
    { label: 'Perfil Estudiantil', path: '/estudiante', icon: <Person /> },
    { label: 'Carreras', path: '/carreras', icon: <School /> },
    { label: 'Materias', path: getMateriasPath(), icon: <Book /> },
    { label: 'Feed', path: '/feed', icon: <DynamicFeed /> },
    { label: 'Conexiones', path: '/conexiones', icon: <People /> },
    { label: 'Sesiones', path: '/sesiones', icon: <Groups /> },
  ];

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Sistema Académico UNAHUR
          {estudianteActual && (
            <Chip 
              label={`${estudianteActual.nombre} ${estudianteActual.apellido}`}
              color="secondary"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.label}
              color="inherit"
              onClick={() => {
                if (item.label === 'Materias') {
                  navigate(getMateriasPath());
                } else {
                  navigate(item.path);
                }
              }}
              startIcon={item.icon}
              sx={{ 
                backgroundColor: (
                  location.pathname === item.path || 
                  (item.label === 'Materias' && location.pathname.includes('/materias'))
                ) ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}