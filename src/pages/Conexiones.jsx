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
import { fetchStudents } from '../features/auth/slice';
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
  const { user, students, loadingStudents } = useSelector((state) => state.auth);

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

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchConexiones(user.id));
      dispatch(fetchPendientes(user.id));
    }
  }, [user, dispatch]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviteLoading(true);
    try {
      await dispatch(inviteContact({ email, usuarioId: user.id })).unwrap();
      setEmail('');
      showSuccess('Invitación enviada exitosamente');
      dispatch(fetchPendientes(user.id));
    } catch (err) {
      showError(err || 'Error al enviar invitación');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRespond = async (id, estado) => {
    try {
      await dispatch(respondToInvitation({ id, estado, usuarioId: user.id })).unwrap();
      showSuccess(`Solicitud ${estado} exitosamente`);
      dispatch(fetchPendientes(user.id));
      dispatch(fetchConexiones(user.id));
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
      await dispatch(deleteConexion({ id: conexionId, usuarioId: user.id })).unwrap();
      showSuccess('Conexión eliminada exitosamente');
      dispatch(fetchConexiones(user.id));
    } catch (err) {
      showError(err || 'Error al eliminar conexión');
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, conexionId: null, contacto: null });
  };

  const conexionIds = new Set(list.map((c) => c.contacto?.id));

  const usuariosDescubribles = students.filter(
    (s) =>
      s.id !== user?.id &&
      s.visibleEnDescubrir !== false &&
      !conexionIds.has(s.id) &&
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
      await dispatch(inviteContact({ email: target.email, usuarioId: user.id })).unwrap();
      showSuccess('Invitación enviada exitosamente');
      setInvitedUserIds((prev) => new Set(prev).add(targetId));
      dispatch(fetchPendientes(user.id));
    } catch (err) {
      showError(err || 'Error al enviar invitación');
    } finally {
      setInvitingUserId(null);
    }
  };

  if (loadingStudents || !user) {
    return (
      <PageContainer centered padding={3}>
        <LoadingSpinner message="Cargando usuarios..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={800}>
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
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<People />} iconPosition="start" label={`Mis Conexiones (${list.length})`} />
          <Tab
            icon={<HourglassEmpty />}
            iconPosition="start"
            label={`Pendientes (${requests.length})`}
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
          list.map((conexion) => (
            <ConnectionCard
              key={conexion.id}
              conexion={conexion}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <LoadingSpinner message="Cargando solicitudes..." />
        ) : requests.length === 0 ? (
          <EmptyState
            title="Sin solicitudes pendientes"
            message="No tienes solicitudes de conexión pendientes."
            icon="inbox"
          />
        ) : (
          requests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onAccept={(id) => handleRespond(id, 'aceptada')}
              onReject={(id) => handleRespond(id, 'rechazada')}
            />
          ))
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
          resultadosBusqueda.map((s) => (
            <DiscoverCard
              key={s.id}
              student={s}
              onInvite={handleInviteFromDiscover}
              isInviting={invitingUserId === s.id}
              isInvited={invitedUserIds.has(s.id)}
            />
          ))
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