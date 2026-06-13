import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Notifications as BellIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchContador,
  fetchNotificaciones,
  readAllNotificaciones,
} from '../features/notificaciones/slice';

export default function NotificacionesPopover() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { noLeidas, lista, loading } = useSelector(
    (state) => state.notificaciones
  );
  const userId = useSelector((state) => state.auth.user?.id);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (userId) {
      dispatch(readAllNotificaciones(userId));
      dispatch(fetchNotificaciones({ usuarioId: userId, noLeidas: true, page: 1 }));
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleVerTodas = () => {
    handleClose();
    navigate('/notificaciones');
  };

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchContador(userId));
    const interval = setInterval(() => {
      dispatch(fetchContador(userId));
    }, 20000);
    return () => clearInterval(interval);
  }, [userId, dispatch]);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `hace ${diffMin} min`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `hace ${diffHrs}h`;
    return d.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const ultimas = lista.slice(0, 5);

  return (
    <>
      <Tooltip title="Notificaciones">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={noLeidas} color="error">
            <BellIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 480 } } }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notificaciones
          </Typography>
        </Box>
        <Divider />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : ultimas.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay notificaciones
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ py: 0 }}>
            {ultimas.map((notif) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  sx={{
                    bgcolor: notif.leido ? 'transparent' : 'action.hover',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <ListItemText
                    primary={notif.titulo}
                    secondary={formatTime(notif.createdAt)}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: notif.leido ? 400 : 600,
                    }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
          <Button size="small" onClick={handleVerTodas}>
            Ver todas
          </Button>
        </Box>
      </Popover>
    </>
  );
}
