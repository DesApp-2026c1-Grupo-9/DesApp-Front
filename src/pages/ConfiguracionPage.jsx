import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Person,
  Lock,
  Save,
  Email as EmailIcon,
  Public,
  ArrowBack,
} from '@mui/icons-material';
import { PageContainer, TabPanel } from '../components/ui';
import { updateUserData, fetchPreferencias, updatePreferencias } from '../features/auth/slice';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../hooks';
import { calcularEdad } from '../utils';

function ProfileSection() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { estudianteActual } = useAuth();

  const usuario = user || estudianteActual?.usuario || {};

  const [form, setForm] = useState({
    nombre: usuario.nombre || '',
    apellido: usuario.apellido || '',
    email: usuario.email || '',
    fechaNacimiento: usuario.fechaNacimiento || '',
    genero: usuario.genero || 'sin especificar',
  });

  const generos = ['femenino', 'masculino', 'no binario', 'sin especificar'];
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    setForm({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      fechaNacimiento: usuario.fechaNacimiento || '',
      genero: usuario.genero || 'sin especificar',
    });
  }, [user, estudianteActual]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario.id) return;

    const data = {};
    if (form.nombre !== usuario.nombre) data.nombre = form.nombre;
    if (form.apellido !== usuario.apellido) data.apellido = form.apellido;
    if (form.email !== usuario.email) data.email = form.email;
    if (form.fechaNacimiento !== (usuario.fechaNacimiento || '')) data.fechaNacimiento = form.fechaNacimiento || null;
    if (form.genero !== (usuario.genero || 'sin especificar')) data.genero = form.genero;

    if (Object.keys(data).length === 0) {
      showSuccess('No hay cambios para guardar');
      return;
    }

    setSaving(true);
    try {
      await dispatch(updateUserData({ id: usuario.id, data })).unwrap();
      showSuccess('Datos actualizados correctamente');
    } catch (err) {
      showError(err?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>Datos personales</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 250 }}>
                <TextField fullWidth label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 250 }}>
                <TextField fullWidth label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 250 }}>
                <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 250 }}>
                <TextField fullWidth select label="Género" name="genero" value={form.genero} onChange={handleChange}>
                  {generos.map((g) => (
                    <MenuItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: 250 }}>
                <TextField fullWidth label="Fecha de Nacimiento" name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                {form.fechaNacimiento && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Edad: {calcularEdad(form.fechaNacimiento)} años
                  </Typography>
                )}
              </Box>
            </Box>
            <Box mt={2}>
              <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving} size="large">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

function PrivacySection() {
  const dispatch = useDispatch();
  const { estudianteActual } = useAuth();
  const { preferencias, loadingPreferencias } = useSelector((state) => state.auth);

  const [perfilPublico, setPerfilPublico] = useState(true);
  const [mostrarEmail, setMostrarEmail] = useState(true);
  const [mostrarSituacionAcademica, setMostrarSituacionAcademica] = useState(true);
  const [visibleEnDescubrir, setVisibleEnDescubrir] = useState(true);
  const [pubInscripciones, setPubInscripciones] = useState(true);
  const [pubRegularizaciones, setPubRegularizaciones] = useState(true);
  const [pubAprobaciones, setPubAprobaciones] = useState(true);
  const [pubSesiones, setPubSesiones] = useState(true);
  const [recibirEmails, setRecibirEmails] = useState(true);

  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();
  const usuarioId = estudianteActual?.usuario?.id;

  useEffect(() => {
    if (usuarioId) dispatch(fetchPreferencias(usuarioId));
  }, [usuarioId, dispatch]);

  useEffect(() => {
    if (preferencias) {
      setPerfilPublico(preferencias.perfilPublico ?? true);
      setMostrarEmail(preferencias.mostrarEmail ?? true);
      setMostrarSituacionAcademica(preferencias.mostrarSituacionAcademica ?? true);
      setVisibleEnDescubrir(preferencias.visibleEnDescubrir ?? true);
      setPubInscripciones(preferencias.publicarInscripciones ?? true);
      setPubRegularizaciones(preferencias.publicarRegularizaciones ?? true);
      setPubAprobaciones(preferencias.publicarAprobaciones ?? true);
      setPubSesiones(preferencias.publicarSesiones ?? true);
      setRecibirEmails(preferencias.recibirEmails ?? true);
    }
  }, [preferencias]);

  const handleChange = (field, setter) => (e) => {
    const newValue = e.target.checked;
    setter(newValue);
    if (usuarioId) {
      dispatch(updatePreferencias({ estudianteId: usuarioId, preferencias: { [field]: newValue } }))
        .unwrap()
        .then(() => showSuccess('Preferencia guardada'))
        .catch((err) => {
          setter(!newValue);
          showError('Error al guardar: ' + (err.message || 'Error desconocido'));
        });
    }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            {perfilPublico ? <Public color="success" fontSize="small" /> : <Lock fontSize="small" />}
            <Typography variant="subtitle1" fontWeight="bold">Visibilidad del Perfil</Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={perfilPublico} onChange={handleChange('perfilPublico', setPerfilPublico)} disabled={loadingPreferencias} />}
            label="Perfil Público"
          />
          <Typography variant="caption" color="textSecondary" display="block" mb={2}>
            {perfilPublico ? 'Tu perfil es visible para todos los estudiantes' : 'Tu perfil es visible solo para tus contactos'}
          </Typography>

          <Box sx={{ ml: 3, mb: 2 }}>
            <FormControlLabel
              control={<Switch checked={mostrarEmail} onChange={handleChange('mostrarEmail', setMostrarEmail)} disabled={loadingPreferencias} size="small" />}
              label="Mostrar email en el perfil público"
            />
            <FormControlLabel
              control={<Switch checked={mostrarSituacionAcademica} onChange={handleChange('mostrarSituacionAcademica', setMostrarSituacionAcademica)} disabled={loadingPreferencias} size="small" />}
              label="Mostrar situación académica en el perfil público"
            />
            <Typography variant="caption" color="textSecondary" display="block" sx={{ ml: 3 }}>
              Estos ajustes solo aplican cuando el perfil es público
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={<Switch checked={visibleEnDescubrir} onChange={handleChange('visibleEnDescubrir', setVisibleEnDescubrir)} disabled={loadingPreferencias} />}
            label="Aparecer en búsqueda de contactos"
          />
          <Typography variant="caption" color="textSecondary" display="block">
            Los demás estudiantes podrán encontrarte por nombre en la sección Descubrir de Conexiones
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Publicación automática en el Feed</Typography>
          <FormControlLabel control={<Switch checked={pubInscripciones} onChange={handleChange('publicarInscripciones', setPubInscripciones)} disabled={loadingPreferencias} />} label="Publicar inscripciones" />
          <FormControlLabel control={<Switch checked={pubRegularizaciones} onChange={handleChange('publicarRegularizaciones', setPubRegularizaciones)} disabled={loadingPreferencias} />} label="Publicar regularizaciones" />
          <FormControlLabel control={<Switch checked={pubAprobaciones} onChange={handleChange('publicarAprobaciones', setPubAprobaciones)} disabled={loadingPreferencias} />} label="Publicar aprobaciones" />
          <FormControlLabel control={<Switch checked={pubSesiones} onChange={handleChange('publicarSesiones', setPubSesiones)} disabled={loadingPreferencias} />} label="Publicar sesiones de estudio" />
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
            Controlá qué eventos se publican automáticamente en tu feed de novedades
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <EmailIcon fontSize="small" />
            <Typography variant="subtitle1" fontWeight="bold">Notificaciones</Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={recibirEmails} onChange={handleChange('recibirEmails', setRecibirEmails)} disabled={loadingPreferencias} />}
            label="Recibir notificaciones por email"
          />
          <Typography variant="caption" color="textSecondary" display="block">
            Recibirás un email por cada notificación generada en la plataforma
          </Typography>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default function ConfiguracionPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  return (
    <PageContainer maxWidth={1200}>
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
          >
            <Tab icon={<Person />} label="Perfil" iconPosition="start" />
            <Tab icon={<Lock />} label="Privacidad" iconPosition="start" />
          </Tabs>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/mi-perfil')}
            size="small"
          >
            Volver a Mi Perfil
          </Button>
        </Box>

        <TabPanel value={tab} index={0}>
          <ProfileSection />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <PrivacySection />
        </TabPanel>
      </Box>
    </PageContainer>
  );
}
