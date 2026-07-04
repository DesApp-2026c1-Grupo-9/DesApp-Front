import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  Home,
  AdminPanelSettings,
  PersonAdd,
  School,
  Gavel,
  Logout,
  BarChart,
  ChevronLeft,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_WIDTH = 260;

export function AdminSidebar({ mobileOpen, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state) => state.auth);
  const { cerrarSesion } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = () => {
    setConfirmOpen(false);
    cerrarSesion();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Inicio', path: '/admin', icon: <Home />, exact: true },
    { label: 'Reportes', path: '/admin/reportes', icon: <BarChart /> },
    { label: 'Usuarios', path: '/admin/usuarios', icon: <PersonAdd /> },
    { label: 'Académico', path: '/admin/academico', icon: <School /> },
    { label: 'Moderación', path: '/admin/moderacion', icon: <Gavel /> },
  ];

  const isSelected = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const drawerContent = (
    <>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box
          onClick={() => navigate('/admin')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 2.5,
            cursor: 'pointer',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <AdminPanelSettings color="warning" sx={{ fontSize: 28 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
              Panel Admin
            </Typography>
            <Typography variant="caption" color="text.secondary">
              UNAHUR
            </Typography>
          </Box>
          {isMobile && (
            <IconButton onClick={onToggle} size="small">
              <ChevronLeft />
            </IconButton>
          )}
        </Box>

        <List sx={{ flexGrow: 1, overflowY: 'auto', pt: 1, pb: 1 }}>
          {menuItems.map((item) => {
            const selected = isSelected(item);
            return (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  selected={selected}
                  onClick={() => { navigate(item.path); if (isMobile) onToggle(); }}
                  sx={{
                    borderRadius: 0,
                    '&.Mui-selected': {
                      bgcolor: 'warning.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'warning.dark' },
                      '& .MuiListItemIcon-root': { color: 'white' },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: selected ? 'white' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: selected ? 600 : 400 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider />

        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.nombre || ''}+${user?.apellido || ''}&background=1976d2&color=fff&bold=true`}
            sx={{ width: 36, height: 36, fontSize: 14 }}
          >
            {user?.nombre?.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.nombre} {user?.apellido}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <List dense disablePadding>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setConfirmOpen(true)} sx={{ px: 2, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Logout fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontSize: 13 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Cerrar sesión</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro de que querés cerrar la sesión?</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleLogout} color="primary" variant="contained">Cerrar sesión</Button>
        </DialogActions>
      </Dialog>
    </>
  );

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
