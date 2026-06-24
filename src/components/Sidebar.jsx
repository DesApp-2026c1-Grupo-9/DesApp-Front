import { useState, useEffect } from 'react';
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
  Collapse,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
  Badge,
} from '@mui/material';
import {
  Home,
  Groups,
  DynamicFeed,
  People,
  School,
  MenuBook,
  Book,
  AccessTime,
  LibraryBooks,
  AdminPanelSettings,
  ExpandLess,
  ExpandMore,
  Logout,
  Block,
  Notifications,
  Person,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { fetchContador } from '../features/notificaciones/slice';

const SIDEBAR_WIDTH = 260;

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const noLeidas = useSelector((state) => state.notificaciones.noLeidas);
  const { estudianteActual, cerrarSesion } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchContador(userId));
    const interval = setInterval(() => {
      dispatch(fetchContador(userId));
    }, 20000);
    return () => clearInterval(interval);
  }, [userId, dispatch]);

  const showAdmin = user?.rol === 'administrador';
  const isSocialActive = location.pathname.startsWith('/social/');
  const isAcademicoActive = location.pathname.startsWith('/academico/');

  const [socialOpen, setSocialOpen] = useState(isSocialActive);
  const [academicoOpen, setAcademicoOpen] = useState(isAcademicoActive);

  useEffect(() => {
    if (isSocialActive) setSocialOpen(true);
    if (isAcademicoActive) setAcademicoOpen(true);
  }, [location.pathname]);

  const handleLogout = () => {
    setConfirmOpen(false);
    cerrarSesion();
    navigate('/login');
  };

  const menuGroups = [
    {
      type: 'link',
      label: 'Inicio',
      path: '/',
      icon: <Home />,
      exact: true,
    },
    {
      type: 'link',
      label: 'Mi Perfil',
      path: '/mi-perfil',
      icon: <Person />,
      exact: true,
    },
    {
      type: 'expandable',
      label: 'Académico',
      icon: <School />,
      open: academicoOpen,
      onToggle: () => setAcademicoOpen((prev) => !prev),
      isActive: isAcademicoActive,
      children: [
        { label: 'Carreras', path: '/academico/carreras', icon: <MenuBook /> },
        { label: 'Materias', path: '/academico/mis-materias', icon: <Book /> },
      ],
    },
    {
      type: 'link',
      label: 'Sesiones',
      path: '/sesiones',
      icon: <AccessTime />,
    },
    {
      type: 'link',
      label: 'Materiales',
      path: '/materiales',
      icon: <LibraryBooks />,
    },
    {
      type: 'expandable',
      label: 'Social',
      icon: <Groups />,
      open: socialOpen,
      onToggle: () => setSocialOpen((prev) => !prev),
      isActive: isSocialActive,
      children: [
        { label: 'Feed', path: '/social/feed', icon: <DynamicFeed /> },
        { label: 'Conexiones', path: '/social/conexiones', icon: <People /> },
      ],
    },
    {
      type: 'link',
      label: 'Notificaciones',
      path: '/notificaciones',
      icon: <Notifications />,
      badge: noLeidas,
    },
    ...(showAdmin
      ? [{ type: 'link', label: 'Admin', path: '/admin', icon: <AdminPanelSettings /> }]
      : []),
  ];

  const renderNavItem = (item) => {
    if (item.type === 'expandable') {
      return (
        <Box key={item.label}>
          <ListItem disablePadding>
            <ListItemButton
              selected={item.isActive}
              onClick={item.onToggle}
              sx={{ pl: 2, borderRadius: 0, '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.light' }, '& .MuiListItemIcon-root': { color: 'primary.contrastText' } } }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
              {item.open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={item.open} timeout="auto" unmountOnExit>
            <List disablePadding dense>
              {item.children.map((child) => {
                const selected = location.pathname === child.path;
                return (
                  <ListItem key={child.label} disablePadding>
                    <ListItemButton
                      selected={selected}
                      onClick={() => navigate(child.path)}
                      sx={{ pl: 5, borderRadius: 0, '&.Mui-selected': { bgcolor: 'action.selected', fontWeight: 600 }, '&.Mui-selected .MuiListItemText-primary': { fontWeight: 600 } }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>{child.icon}</ListItemIcon>
                      <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: 13 }} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </Box>
      );
    }

    const selected = item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

    return (
      <ListItem key={item.label} disablePadding>
        <ListItemButton
          selected={selected}
          onClick={() => navigate(item.path)}
          sx={{ pl: 2, borderRadius: 0, '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.light' }, '& .MuiListItemIcon-root': { color: 'primary.contrastText' } } }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
          {item.badge != null && item.badge > 0 && (
            <Badge badgeContent={item.badge} color="error" sx={{ mr: 1 }} />
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
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
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box
          onClick={() => navigate('/')}
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
          <MenuBook color="primary" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
              Sistema Académico
            </Typography>
            <Typography variant="caption" color="text.secondary">
              UNAHUR
            </Typography>
          </Box>
        </Box>

        <List sx={{ flexGrow: 1, overflowY: 'auto', pt: 0, pb: 1 }}>
          {menuGroups.map(renderNavItem)}
        </List>

        {estudianteActual?.usuario?.activo === false && (
          <Alert severity="warning" sx={{ mx: 1, mb: 1, py: 0 }} icon={false}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Block fontSize="small" />
              <AlertTitle sx={{ mb: 0, fontSize: 12 }}>Cuenta desactivada</AlertTitle>
            </Box>
          </Alert>
        )}

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
                <Logout fontSize="small" />
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
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleLogout} color="primary" variant="contained">Cerrar sesión</Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
