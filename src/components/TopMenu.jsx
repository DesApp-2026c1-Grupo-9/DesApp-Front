import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  ListItemIcon,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { School, Home, Groups, LibraryBooks, AdminPanelSettings, Block, MenuBook, DynamicFeed, Logout, Menu as MenuIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import NotificacionesPopover from './NotificacionesPopover';

export function TopMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { estudianteActual, cerrarSesion } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const showAdmin = user?.rol === 'administrador';

  const menuItems = [
    { label: 'Inicio', path: '/', icon: <Home /> },
    { label: 'Mi Perfil', path: '/mi-perfil', icon: <DynamicFeed /> },
    { label: 'Académico', path: '/academico/carreras', icon: <School /> },
    { label: 'Social', path: '/social/feed', icon: <Groups /> },
    { label: 'Sesiones', path: '/sesiones', icon: <Groups /> },
    { label: 'Materiales', path: '/materiales', icon: <LibraryBooks /> },
    ...(showAdmin ? [{ label: 'Admin', path: '/admin', icon: <AdminPanelSettings /> }] : []),
  ];

  const visibleItems = menuItems.filter(item => item.label !== 'Inicio');
  const tabIndex = visibleItems.findIndex(
    item => location.pathname === item.path || 
      (item.label === 'Académico' && location.pathname.startsWith('/academico/')) ||
      (item.label === 'Social' && location.pathname.startsWith('/social/'))
  );

  const handleLogout = () => {
    setConfirmOpen(false);
    setAnchorEl(null);
    cerrarSesion();
    navigate('/login');
  };

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

        <NotificacionesPopover />

        <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
          <MenuIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => { setAnchorEl(null); setConfirmOpen(true); }}>
            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Cerrar sesión</DialogTitle>
          <DialogContent>
            <DialogContentText>¿Estás seguro de que querés cerrar la sesión?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={handleLogout} color="primary" variant="contained">Cerrar sesión</Button>
          </DialogActions>
        </Dialog>
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
