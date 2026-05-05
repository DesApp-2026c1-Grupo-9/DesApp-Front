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
            <Typography>{s.nombre} {s.apellido}</Typography>
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

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

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteConexion({ id, usuarioId: user.id })).unwrap();
      showSnackbar('Conexión eliminada exitosamente', 'success');
      dispatch(fetchConexiones(user.id));
    } catch (err) {
      showSnackbar(err || 'Error al eliminar conexión', 'error');
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
                        onClick={() => handleDelete(conexion.id)}
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
