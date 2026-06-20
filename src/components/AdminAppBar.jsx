import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Tabs, Tab, IconButton,
  Menu, MenuItem, ListItemIcon,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';
import { AdminPanelSettings, PersonAdd, School, Gavel, DynamicFeed, Logout, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export function AdminAppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cerrarSesion } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const tab = location.pathname.includes('/academico') ? 1 : location.pathname.includes('/moderacion') ? 2 : location.pathname === '/mi-perfil' ? 3 : 0;

  const handleLogout = () => {
    setConfirmOpen(false);
    setAnchorEl(null);
    cerrarSesion();
    navigate('/login');
  };

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
          onChange={(_, v) => navigate(v === 0 ? '/admin/usuarios' : v === 1 ? '/admin/academico' : v === 2 ? '/admin/moderacion' : '/mi-perfil')}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab icon={<PersonAdd />} label="Usuarios" iconPosition="start" />
          <Tab icon={<School />} label="Académico" iconPosition="start" />
          <Tab icon={<Gavel />} label="Moderación" iconPosition="start" />
          <Tab icon={<DynamicFeed />} label="Mi Perfil" iconPosition="start" />
        </Tabs>

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
    </AppBar>
  );
}
