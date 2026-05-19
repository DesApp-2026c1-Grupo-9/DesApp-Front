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

import ConnectionCard from '../components/ConnectionCard';
import RequestCard from '../components/RequestCard';
import DiscoverCard from '../components/DiscoverCard';
import { TabPanel, PageContainer, LoadingSpinner, EmptyState } from '../components/ui';

export default function Conexiones() {
  const dispatch = useDispatch();
  const { list, requests, loading, error } = useSelector((state) => state.conexiones);
  const { user, students, loadingStudents } = useSelector((state) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [invitingUserId, setInvitingUserId] = useState(null);
  const [invitedUserIds, setInvitedUserIds] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
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

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviteLoading(true);
    try {
      await dispatch(inviteContact({ email, usuarioId: user.id })).unwrap();
      setEmail('');
      showSnackbar('Invitación enviada exitosamente', 'success');
      dispatch(fetchPendientes(user.id));
    } catch (err) {
      showSnackbar(err || 'Error al enviar invitación', 'error');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRespond = async (id, estado) => {
    try {
      await dispatch(respondToInvitation({ id, estado, usuarioId: user.id })).unwrap();
      showSnackbar(`Solicitud ${estado} exitosamente`, 'success');
      dispatch(fetchPendientes(user.id));
      dispatch(fetchConexiones(user.id));
    } catch (err) {
      showSnackbar(err || 'Error al responder solicitud', 'error');
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
      showSnackbar('Conexión eliminada exitosamente', 'success');
      dispatch(fetchConexiones(user.id));
    } catch (err) {
      showSnackbar(err || 'Error al eliminar conexión', 'error');
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

  const filterText = searchText.toLowerCase().trim();
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
      showSnackbar('El usuario no tiene email registrado', 'error');
      setInvitingUserId(null);
      return;
    }
    try {
      await dispatch(inviteContact({ email: target.email, usuarioId: user.id })).unwrap();
      showSnackbar('Invitación enviada exitosamente', 'success');
      setInvitedUserIds((prev) => new Set(prev).add(targetId));
      dispatch(fetchPendientes(user.id));
    } catch (err) {
      showSnackbar(err || 'Error al enviar invitación', 'error');
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
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Conexiones
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tu email: {user?.email}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearConexionesError())}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="h6" gutterBottom>
          <Mail sx={{ mr: 1, verticalAlign: 'middle' }} />
          Enviar Invitación
        </Typography>
        <Box
          component="form"
          onSubmit={handleInvite}
          sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}
        >
          <TextField
            fullWidth
            size="small"
            label="Email del estudiante"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@universidad.edu"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={inviteLoading || !email.trim()}
            startIcon={<PersonAdd />}
          >
            Invitar
          </Button>
        </Box>
      </Paper>

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
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Paper>

        {resultadosBusqueda.length === 0 ? (
          <EmptyState
            title={searchText ? 'Sin resultados' : 'No hay más estudiantes'}
            message={
              searchText
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}