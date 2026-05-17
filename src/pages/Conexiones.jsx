import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Box,
  Button,
  TextField,
  IconButton,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Alert,
  Chip,
  Snackbar,
  MenuItem,
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
import { fetchStudents, switchStudent } from '../features/auth/slice';
import {
  fetchConexiones,
  fetchPendientes,
  inviteContact,
  respondToInvitation,
  deleteConexion,
  clearConexionesError,
} from '../features/conexiones/slice';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function ProjectSelector({ user, students, onSwitch }) {
  return (
    <Select
      value={user?.id || ''}
      label="Simular Usuario"
      onChange={(e) => onSwitch(e.target.value)}
      renderValue={(selected) => {
        const student = students.find((s) => s.id === selected);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={student?.avatar} sx={{ width: 24, height: 24 }}>
              {student?.nombre?.charAt(0)}
            </Avatar>
            <Typography variant="body2" fontWeight="500">
              {student?.nombre} {student?.apellido}
            </Typography>
          </Box>
        );
      }}
      size="small"
      sx={{ minWidth: 220 }}
    >
      {students.map((s) => (
        <MenuItem key={s.id} value={s.id}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={s.avatar} sx={{ width: 28, height: 28 }}>
              {s.nombre?.charAt(0)}
            </Avatar>
            <Box>
              <Typography>{s.nombre} {s.apellido}</Typography>
              {s.rol === 'administrador' && (
                <Typography variant="caption" color="warning.main" sx={{ fontWeight: 'bold' }}>
                  Administrador
                </Typography>
              )}
            </Box>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
}

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
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Cargando usuarios...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6, maxWidth: '800px !important' }}>
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Conexiones
        </Typography>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Simular Usuario</InputLabel>
          <ProjectSelector
            user={user}
            students={students}
            onSwitch={(val) => dispatch(switchStudent(val))}
          />
        </FormControl>
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
        <Box component="form" onSubmit={handleInvite} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
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
          <Tab
            icon={<People />}
            iconPosition="start"
            label={`Mis Conexiones (${list.length})`}
          />
          <Tab
            icon={<HourglassEmpty />}
            iconPosition="start"
            label={`Pendientes (${requests.length})`}
          />
          <Tab
            icon={<Search />}
            iconPosition="start"
            label="Descubrir"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : list.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <People sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">
              Aún no tienes conexiones. ¡Invita a otros estudiantes!
            </Typography>
          </Paper>
        ) : (
          <List>
            {list.map((conexion) => {
              const contacto = conexion.contacto;
              return (
                <Card key={conexion.id} sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={contacto?.avatarUrl} sx={{ width: 50, height: 50 }}>
                          {contacto?.nombre?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {contacto?.nombre} {contacto?.apellido}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {contacto?.email}
                          </Typography>
                          <Chip
                            label="Conectado"
                            size="small"
                            color="success"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                      <IconButton
                        onClick={() => handleDeleteClick(conexion.id, contacto)}
                        color="error"
                        title="Eliminar conexión"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </List>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <HourglassEmpty sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">
              No tienes solicitudes pendientes
            </Typography>
          </Paper>
        ) : (
          <List>
            {requests.map((req) => (
              <Card key={req.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={req.usuario?.avatarUrl} sx={{ width: 50, height: 50 }}>
                        {req.usuario?.nombre?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {req.usuario?.nombre} {req.usuario?.apellido}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {req.usuario?.email}
                        </Typography>
                        <Chip
                          label="Pendiente"
                          size="small"
                          color="warning"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={() => handleRespond(req.id, 'aceptada')}
                        color="success"
                        title="Aceptar"
                      >
                        <CheckCircle />
                      </IconButton>
                      <IconButton
                        onClick={() => handleRespond(req.id, 'rechazada')}
                        color="error"
                        title="Rechazar"
                      >
                        <Cancel />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
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
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <Search sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">
              {searchText
                ? 'No se encontraron estudiantes con ese nombre'
                : 'No hay más estudiantes disponibles para conectar'}
            </Typography>
          </Paper>
        ) : (
          <List>
            {resultadosBusqueda.map((s) => (
              <Card key={s.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={s.avatar} sx={{ width: 50, height: 50 }}>
                        {s.nombre?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {s.nombre} {s.apellido}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {s.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      startIcon={invitedUserIds.has(s.id) ? null : <PersonAdd />}
                      onClick={() => handleInviteFromDiscover(s.id)}
                      disabled={invitingUserId === s.id || invitedUserIds.has(s.id)}
                      color={invitedUserIds.has(s.id) ? 'success' : 'primary'}
                      variant={invitedUserIds.has(s.id) ? 'outlined' : 'contained'}
                    >
                      {invitingUserId === s.id ? 'Enviando...' : invitedUserIds.has(s.id) ? 'Pendiente' : 'Agregar'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>
        )}
      </TabPanel>

      <Dialog open={confirmDelete.open} onClose={handleDeleteCancel}>
        <DialogTitle>Eliminar conexión</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que querés eliminar tu conexión con <strong>{confirmDelete.contacto?.nombre} {confirmDelete.contacto?.apellido}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Eliminar</Button>
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
    </Container>
  );
}
