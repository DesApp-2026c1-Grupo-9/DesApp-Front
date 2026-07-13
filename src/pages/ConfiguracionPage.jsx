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
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  FormGroup,
  Tabs,
  Tab,
} from '@mui/material';
import { Save, Shield, AutoAwesome, Person, ArrowBack } from '@mui/icons-material';
import { PageContainer } from '../components/ui';
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
      await dispatch(updateUserData({ data })).unwrap();
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
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: 250 } }}>
                <TextField fullWidth label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: 250 } }}>
                <TextField fullWidth label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: 250 } }}>
                <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: 250 } }}>
                <TextField fullWidth select label="Género" name="genero" value={form.genero} onChange={handleChange}>
                  {generos.map((g) => (
                    <MenuItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 8px)', minWidth: { xs: '100%', sm: 250 } }}>
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

function PreferencesSection() {
  const dispatch = useDispatch();
  const { estudianteActual } = useAuth();
  const { preferencias, loadingPreferencias } = useSelector((state) => state.auth);
  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();
  const estudianteId = estudianteActual?.id;

  const [localPrefs, setLocalPrefs] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (estudianteId) {
      dispatch(fetchPreferencias(estudianteId));
    }
  }, [estudianteId, dispatch]);

  useEffect(() => {
    if (preferencias) {
      setLocalPrefs({ ...preferencias });
    }
  }, [preferencias]);

  const handleToggle = (field) => {
    setLocalPrefs((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    if (!estudianteId || !localPrefs) return;
    setSaving(true);
    try {
      await dispatch(updatePreferencias({ estudianteId, preferencias: localPrefs })).unwrap();
      showSuccess('Preferencias guardadas correctamente');
    } catch (err) {
      showError(err?.message || 'Error al guardar preferencias');
    } finally {
      setSaving(false);
    }
  };

  if (!localPrefs) return null;

  const privacidad = [
    { field: 'perfilPublico', label: 'Perfil público', desc: 'Cualquier estudiante puede ver tu perfil' },
    { field: 'mostrarEmail', label: 'Mostrar email', desc: 'Mostrar tu email en tu perfil público' },
    { field: 'mostrarSituacionAcademica', label: 'Mostrar situación académica', desc: 'Mostrar tus materias y estados en tu perfil' },
    { field: 'visibleEnDescubrir', label: 'Visible en descubrir', desc: 'Aparecer en la sección de descubrir personas' },
    { field: 'recibirEmails', label: 'Recibir emails', desc: 'Recibir notificaciones por correo electrónico' },
  ];

  const autoPosts = [
    { field: 'publicarInscripciones', label: 'Inscripciones', desc: 'Publicar automáticamente cuando te inscribas a una materia' },
    { field: 'publicarRegularizaciones', label: 'Regularizaciones', desc: 'Publicar automáticamente cuando regularices una materia' },
    { field: 'publicarAprobaciones', label: 'Aprobaciones', desc: 'Publicar automáticamente cuando apruebes una materia' },
    { field: 'publicarSesiones', label: 'Sesiones de estudio', desc: 'Publicar automáticamente cuando crees una sesión de estudio' },
  ];

  return (
    <Box>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Shield color="primary" />
            <Typography variant="h6" fontWeight="bold">Privacidad</Typography>
          </Box>
          <FormGroup>
            {privacidad.map(({ field, label, desc }) => (
              <FormControlLabel
                key={field}
                control={<Switch checked={!!localPrefs[field]} onChange={() => handleToggle(field)} sx={{ mt: 0.5 }} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{label}</Typography>
                    <Typography variant="caption" color="text.secondary">{desc}</Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AutoAwesome color="secondary" />
            <Typography variant="h6" fontWeight="bold">Publicaciones automáticas</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Elegí qué eventos se publican automáticamente en tu feed de novedades.
          </Typography>
          <FormGroup>
            {autoPosts.map(({ field, label, desc }) => (
              <FormControlLabel
                key={field}
                control={<Switch checked={!!localPrefs[field]} onChange={() => handleToggle(field)} sx={{ mt: 0.5 }} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{label}</Typography>
                    <Typography variant="caption" color="text.secondary">{desc}</Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', mb: 0.5 }}
              />
            ))}
          </FormGroup>
        </CardContent>
      </Card>

      <Box mb={3} sx={{ textAlign: 'right' }}>
        <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving || loadingPreferencias} size="large">
          {saving ? 'Guardando...' : 'Guardar preferencias'}
        </Button>
      </Box>
    </Box>
  );
}

export default function ConfiguracionPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  return (
    <PageContainer maxWidth={1200}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/mi-perfil')} variant="outlined" size="small" sx={{ minWidth: 0 }}>
            Mi Perfil
          </Button>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab icon={<Person />} label="Datos personales" iconPosition="start" />
            <Tab icon={<Shield />} label="Privacidad" iconPosition="start" />
          </Tabs>
        </Box>
        {tab === 0 && <ProfileSection />}
        {tab === 1 && <PreferencesSection />}
      </Box>
    </PageContainer>
  );
}
