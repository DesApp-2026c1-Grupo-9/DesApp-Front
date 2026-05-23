import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { School, Person, Book, Home, People, Groups, DynamicFeed, LibraryBooks, AdminPanelSettings } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { UserSelector } from './UserSelector';

export function TopMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const showAdmin = user?.rol === 'administrador';

  const menuItems = [
    { label: 'Inicio', path: '/', icon: <Home /> },
    { label: 'Mi Perfil', path: '/mi-perfil', icon: <Person /> },
    { label: 'Mis Materias', path: '/mis-materias', icon: <Book /> },
    { label: 'Carreras', path: '/carreras', icon: <School /> },
    { label: 'Feed', path: '/feed', icon: <DynamicFeed /> },
    { label: 'Conexiones', path: '/conexiones', icon: <Groups /> },
    { label: 'Sesiones', path: '/sesiones', icon: <Groups /> },
    { label: 'Materiales', path: '/materiales', icon: <LibraryBooks /> },
    ...(showAdmin ? [{ label: 'Admin', path: '/admin', icon: <AdminPanelSettings /> }] : []),
  ];

  return (
    <AppBar position="static" sx={{ mb: 3, borderRadius: 0 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Box
            component="a"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{
              fontWeight: 'bold',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                color: 'inherit'
              }
            }}
          >
            Sistema Académico UNAHUR
          </Box>
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
          {menuItems.filter(item => item.label !== 'Inicio').map((item) => (
            <Button
              key={item.label}
              variant="text"
              color="inherit"
              onClick={() => {
                navigate(item.path);
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

        <UserSelector />
      </Toolbar>
    </AppBar>
  );
}