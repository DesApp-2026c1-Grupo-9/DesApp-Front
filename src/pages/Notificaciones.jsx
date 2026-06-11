import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Pagination,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  MarkEmailRead,
  DoneAll,
  Notifications as BellIcon,
} from '@mui/icons-material';
import {
  fetchNotificaciones,
  readNotificacion,
  readAllNotificaciones,
  fetchContador,
} from '../features/notificaciones/slice';

export default function Notificaciones() {
  const dispatch = useDispatch();
  const { lista, total, page, totalPages, noLeidas, loading } = useSelector(
    (state) => state.notificaciones
  );
  const userId = useSelector((state) => state.auth.user?.id);

  const [filtro, setFiltro] = useState(false);

  const cargar = useCallback(
    (pagina) => {
      if (!userId) return;
      dispatch(
        fetchNotificaciones({
          usuarioId: userId,
          noLeidas: filtro,
          page: pagina,
        })
      );
    },
    [userId, filtro, dispatch]
  );

  useEffect(() => {
    cargar(1);
    if (userId) dispatch(fetchContador(userId));
  }, [userId, filtro, dispatch, cargar]);

  const handleCambiarPagina = (_, pagina) => {
    cargar(pagina);
  };

  const handleMarcarLeida = (id) => {
    if (userId) dispatch(readNotificacion({ id, usuarioId: userId }));
  };

  const handleMarcarTodas = () => {
    if (userId) dispatch(readAllNotificaciones(userId));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BellIcon sx={{ mr: 1.5, fontSize: 32 }} />
        <Typography variant="h5" fontWeight={600} sx={{ flexGrow: 1 }}>
          Notificaciones
        </Typography>
        {noLeidas > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DoneAll />}
            onClick={handleMarcarTodas}
          >
            Marcar todas leídas ({noLeidas})
          </Button>
        )}
      </Box>

      <Tabs
        value={filtro ? 1 : 0}
        onChange={(_, v) => setFiltro(v === 1)}
        sx={{ mb: 2 }}
      >
        <Tab label="Todas" />
        <Tab label={`No leídas (${noLeidas})`} />
      </Tabs>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && lista.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay notificaciones
          {filtro ? ' sin leer' : ''}.
        </Alert>
      )}

      {!loading && lista.length > 0 && (
        <List disablePadding>
          {lista.map((notif, idx) => (
            <Box key={notif.id}>
              <ListItem
                sx={{
                  bgcolor: notif.leido ? 'transparent' : 'action.hover',
                  py: 1.5,
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {!notif.leido && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleMarcarLeida(notif.id)}
                      >
                        Marcar leída
                      </Button>
                    )}
                    {notif.leido && (
                      <Chip
                        label="Leída"
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
              >
                <ListItemText
                  primary={notif.titulo}
                  secondary={
                    <>
                      {formatDate(notif.createdAt)}
                      {notif.actor && (
                        <> &middot; {notif.actor.nombre} {notif.actor.apellido}</>
                      )}
                    </>
                  }
                  primaryTypographyProps={{
                    fontWeight: notif.leido ? 400 : 600,
                  }}
                />
              </ListItem>
              {idx < lista.length - 1 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleCambiarPagina}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}
