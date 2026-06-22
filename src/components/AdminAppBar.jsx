import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Tabs, Tab, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';
import { AdminPanelSettings, PersonAdd, School, Gavel, DynamicFeed, Logout, Menu as MenuIcon, Person } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';

export function AdminAppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cerrarSesion } = useAuth();
  const { user } = useSelector((state) => state.auth);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const tab = location.pathname === '/mi-perfil' ? 0
    : location.pathname.includes('/usuarios') ? 1
    : location.pathname.includes('/academico') ? 2
    : location.pathname.includes('/moderacion') ? 3
    : false;

  const handleLogout = () => {
    setConfirmOpen(false);
    setDrawerOpen(false);
    cerrarSesion();
    navigate('/login');
  };

  const drawerWidth = 280;

  return (
    <AppBar position="static" sx={{ mb: 3, bgcolor: 'warning.dark', borderRadius: 0 }}>
      <Toolbar>
        <Box
          component="a"
          href="/admin"
          onClick={(e) => { e.preventDefault(); navigate('/admin'); }}
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
          <AdminPanelSettings sx={{ mr: 1 }} />
          <Typography variant="h6">
            Sistema Académico UNAHUR
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Tabs
          value={tab}
          onChange={(_, v) => navigate(v === 0 ? '/mi-perfil' : v === 1 ? '/admin/usuarios' : v === 2 ? '/admin/academico' : '/admin/moderacion')}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab icon={<DynamicFeed />} label="Mi Perfil" iconPosition="start" />
          <Tab icon={<PersonAdd />} label="Usuarios" iconPosition="start" />
          <Tab icon={<School />} label="Académico" iconPosition="start" />
          <Tab icon={<Gavel />} label="Moderación" iconPosition="start" />
        </Tabs>

        <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ ml: 1 }}>
          <MenuIcon />
        </IconButton>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: drawerWidth, pt: 2 }}>
            <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person />
              <Box>
                <Typography variant="subtitle2">{user?.nombre} {user?.apellido}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
            </Box>
            <Divider />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => { setDrawerOpen(false); setConfirmOpen(true); }}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  <ListItemText primary="Cerrar sesión" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>

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
    </AppBar>
  );
}
