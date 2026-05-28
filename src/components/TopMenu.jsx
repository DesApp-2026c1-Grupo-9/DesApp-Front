import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { School, Person, Book, Home, People, Groups, DynamicFeed, LibraryBooks, AdminPanelSettings, Block, MenuBook } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { UserSelector } from './UserSelector';

export function TopMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { estudianteActual } = useAuth();

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

  const visibleItems = menuItems.filter(item => item.label !== 'Inicio');
  const tabIndex = visibleItems.findIndex(
    item => location.pathname === item.path || (item.label === 'Materias' && location.pathname.includes('/materias'))
  );

  return (
    <AppBar position="static" sx={{ mb: 3, borderRadius: 0 }}>
      <Toolbar>
        <Box
          component="a"
          href="/"
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'inherit',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': { color: 'inherit' },
            mr: 3,
            whiteSpace: 'nowrap',
          }}
        >
          <MenuBook sx={{ mr: 1 }} />
          <Typography variant="h6">
            Sistema Académico UNAHUR
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />

        <Tabs
          value={tabIndex === -1 ? false : tabIndex}
          onChange={(_, i) => navigate(visibleItems[i].path)}
          textColor="inherit"
          sx={{ mr: 2, '& .MuiTabs-indicator': { backgroundColor: 'white' } }}
        >
          {visibleItems.map((item) => (
            <Tab key={item.label} icon={item.icon} label={item.label} iconPosition="start" />
          ))}
        </Tabs>

        <UserSelector />
      </Toolbar>
      {estudianteActual?.usuario?.activo === false && (
        <Alert severity="warning" sx={{ borderRadius: 0, justifyContent: 'center', '& .MuiAlert-message': { textAlign: 'center', width: '100%' } }} icon={false}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Block />
            <AlertTitle sx={{ mb: 0 }}>Cuenta desactivada</AlertTitle>
          </Box>
        </Alert>
      )}
    </AppBar>
  );
}
