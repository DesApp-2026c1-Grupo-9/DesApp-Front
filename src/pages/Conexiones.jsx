import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Tabs,
  Tab,
  Paper,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  PersonAdd,
  Delete,
  CheckCircle,
  Cancel,
  People,
  Mail,
  HourglassEmpty,
  Search,
} from '@mui/icons-material';
import {
  fetchConexiones,
  fetchPendientes,
  inviteContact,
  respondToInvitation,
  deleteConexion,
  clearConexionesError,
} from '../features/conexiones/slice';
import { useFilter, useSnackbar } from '../hooks';

import ConnectionCard from '../components/ConnectionCard';
import RequestCard from '../components/RequestCard';
import DiscoverCard from '../components/DiscoverCard';
import { TabPanel, PageContainer, LoadingSpinner, EmptyState } from '../components/ui';

export default function Conexiones() {
  const dispatch = useDispatch();
  const { list, requests, loading, error } = useSelector((state) => state.conexiones);
  const { user, students } = useSelector((state) => state.auth);

  const { showSuccess, showError, showWarning, showInfo, snackbar, closeSnackbar } = useSnackbar();

  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const { filters, setFilter, clearFilters, hasActiveFilters } = useFilter({
    initialFilters: { search: '' },
    debounceMs: 300,
  });
  const [invitingUserId, setInvitingUserId] = useState(null);
  const [invitedUserIds, setInvitedUserIds] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState({ open: false, conexionId: null, contacto: null });

  const estudianteId = user?.estudianteId || user?.Estudiante?.id;

  useEffect(() => {
    if (estudianteId) {
      dispatch(fetchConexiones(estudianteId));
      dispatch(fetchPendientes(estudianteId));
    }
  }, [estudianteId, dispatch]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviteLoading(true);
    try {
      await dispatch(inviteContact({ email, estudianteId })).unwrap();
      setEmail('');
      showSuccess('Invitación enviada exitosamente');
      dispatch(fetchPendientes(estudianteId));
    } catch (err) {
      showError(err || 'Error al enviar invitación');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRespond = async (id, estado) => {
    try {
      await dispatch(respondToInvitation({ id, estado, estudianteId })).unwrap();
      showSuccess(`Solicitud ${estado} exitosamente`);
      dispatch(fetchPendientes(estudianteId));
      dispatch(fetchConexiones(estudianteId));
    } catch (err) {
      showError(err || 'Error al responder solicitud');
    }
  };

  const handleDeleteClick = (conexionId, contacto) => {
    setConfirmDelete({ open: true, conexionId, contacto });
  };

  const handleDeleteConfirm = async () => {
    const { conexionId } = confirmDelete;
    setConfirmDelete({ open: false, conexionId: null, contacto: null });
    try {
      await dispatch(deleteConexion({ id: conexionId, estudianteId })).unwrap();
      showSuccess('Conexión eliminada exitosamente');
      dispatch(fetchConexiones(estudianteId));
    } catch (err) {
      showError(err || 'Error al eliminar conexión');
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, conexionId: null, contacto: null });
  };

  const acceptedIds = new Set(list.map((c) => c.contacto?.estudianteId).filter(Boolean));
  const pendingIds = new Set([
    ...requests.filter((r) => r.usuarioId === estudianteId).map((r) => r.contacto?.estudianteId),
    ...requests.filter((r) => r.contactoId === estudianteId).map((r) => r.usuario?.estudianteId),
  ].filter(Boolean));

  const usuariosDescubribles = students.filter(
    (s) =>
      s.id !== estudianteId &&
      s.activo !== false &&
      s.visibleEnDescubrir !== false &&
      !acceptedIds.has(s.id) &&
      s.rol !== 'administrador'
  );

  const filterText = filters.search.toLowerCase().trim();
  const resultadosBusqueda = filterText
    ? usuariosDescubribles.filter(
        (s) =>
          s.nombre.toLowerCase().includes(filterText) ||
          s.apellido.toLowerCase().includes(filterText)
      )
    : usuariosDescubribles;

  const handleInviteFromDiscover = async (targetId) => {
    setInvitingUserId(targetId);
    const target = students.find((s) => s.id === targetId);
    if (!target?.email) {
      showError('El usuario no tiene email registrado');
      setInvitingUserId(null);
      return;
    }
    try {
      await dispatch(inviteContact({ email: target.email, estudianteId })).unwrap();
      showSuccess('Invitación enviada exitosamente');
      dispatch(fetchPendientes(estudianteId));
    } catch (err) {
      showError(err || 'Error al enviar invitación');
    } finally {
      setInvitingUserId(null);
    }
  };

  return (
    <PageContainer maxWidth={1200}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          Conexiones
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearConexionesError())}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<People />} iconPosition="start" label={`Mis Conexiones (${list.length})`} />
          <Tab
            icon={<HourglassEmpty />}
            iconPosition="start"
            label={`Pendientes (${requests.filter((r) => r.contactoId === estudianteId).length})`}
          />
          <Tab icon={<Search />} iconPosition="start" label="Descubrir" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <LoadingSpinner message="Cargando conexiones..." />
        ) : list.length === 0 ? (
          <EmptyState
            title="Sin conexiones"
            message="Aún no tienes conexiones. ¡Invita a otros estudiantes!"
            icon="inbox"
          />
        ) : (
          <Grid container spacing={2}>
            {list.map((conexion) => (
              <Grid item xs={12} sm={6} key={conexion.id}>
                <ConnectionCard
                  conexion={conexion}
                  onDelete={handleDeleteClick}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <LoadingSpinner message="Cargando solicitudes..." />
        ) : requests.filter((r) => r.contactoId === estudianteId).length === 0 ? (
          <EmptyState
            title="Sin solicitudes pendientes"
            message="No tienes solicitudes de conexión pendientes."
            icon="inbox"
          />
        ) : (
          <Grid container spacing={2}>
            {requests.filter((r) => r.contactoId === estudianteId).map((req) => (
              <Grid item xs={12} sm={6} key={req.id}>
                <RequestCard
                  request={req}
                  onAccept={(id) => handleRespond(id, 'aceptada')}
                  onReject={(id) => handleRespond(id, 'rechazada')}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h6" gutterBottom>
            <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
            Buscar estudiantes
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre o apellido..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </Paper>

        {resultadosBusqueda.length === 0 ? (
          <EmptyState
            title={filters.search ? 'Sin resultados' : 'No hay más estudiantes'}
            message={
              filters.search
                ? 'No se encontraron estudiantes con ese nombre'
                : 'No hay más estudiantes disponibles para conectar'
            }
            icon="search"
          />
        ) : (
          <Grid container spacing={2}>
            {resultadosBusqueda.map((s) => (
              <Grid item xs={12} sm={6} key={s.id}>
                <DiscoverCard
                  student={s}
                  onInvite={handleInviteFromDiscover}
                  isInviting={invitingUserId === s.id}
                  isInvited={invitedUserIds.has(s.id)}
                  isPending={pendingIds.has(s.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <Dialog open={confirmDelete.open} onClose={handleDeleteCancel}>
        <DialogTitle>Eliminar conexión</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que querés eliminar tu conexión con{' '}
            <strong>
              {confirmDelete.contacto?.nombre} {confirmDelete.contacto?.apellido}
            </strong>
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}