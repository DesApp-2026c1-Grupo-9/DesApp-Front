import React, { useState, useEffect, useRef } from 'react';
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
  Avatar,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Person,
  Lock,
  Save,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Email as EmailIcon,
  PhotoCamera,
  Public,
} from '@mui/icons-material';
import { PageContainer, LoadingSpinner, TabPanel } from '../components/ui';
import { updateUserData, updateAvatar, fetchPreferencias, updatePreferencias } from '../features/auth/slice';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../hooks';
import { calcularEdad } from '../utils';
import EstudianteService from '../services/EstudianteService';

function ProfileSection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { estudianteActual } = useAuth();
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [estudiante, setEstudiante] = useState(null);
  const [situacionAcademica, setSituacionAcademica] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const cargarDatos = async () => {
      if (!estudianteActual?.id) {
        setEstudiante(null);
        setSituacionAcademica(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await EstudianteService.obtenerEstudiante(estudianteActual.id);
        setEstudiante({
          ...data.data,
          ...data.data.usuario,
          carreras: data.data.carreras,
        });

        const carreras = data.data.carreras || [];
        const resultados = [];
        for (const carrera of carreras) {
          try {
            const materiasData = await EstudianteService.obtenerMateriasEstudiante(estudianteActual.id, carrera.id);
            resultados.push({
              carreraId: carrera.id,
              carrera: materiasData.data?.carrera?.nombre || carrera.nombre,
              estadisticas: {
                materiasAprobadas: materiasData.data?.resumen?.aprobadas || 0,
                materiasRegularizaciones: materiasData.data?.resumen?.regularizadas || 0,
                materiasCursando: materiasData.data?.resumen?.cursando || 0,
                totalMaterias: materiasData.data?.resumen?.total || 0,
              },
            });
          } catch {
            resultados.push({
              carreraId: carrera.id,
              carrera: carrera.nombre,
              estadisticas: { materiasAprobadas: 0, materiasRegularizaciones: 0, materiasCursando: 0, totalMaterias: 0 },
            });
          }
        }
        setSituacionAcademica(resultados);
      } catch {
        showError('Error al cargar datos del perfil');
      } finally {
        setLoading(false);
      }
    };
    if (estudianteActual) cargarDatos();
  }, [estudianteActual]);

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

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const result = await dispatch(updateAvatar({ id: user?.id, file })).unwrap();
      setEstudiante((prev) => ({ ...prev, avatarUrl: result }));
    } catch {
      showError('Error al subir avatar');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <LoadingSpinner message="Cargando perfil..." />;

  return (
    <Box>
      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <Box sx={{ height: 100, background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})` }} />
        <CardContent sx={{ mt: -6, textAlign: 'center' }}>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
          <Box
            sx={{ position: 'relative', width: 96, height: 96, mx: 'auto', cursor: 'pointer', '&:hover .avatar-overlay': { opacity: 1 } }}
            onClick={handleAvatarClick}
          >
            <Avatar
              src={estudiante?.avatarUrl || `https://ui-avatars.com/api/?name=${form.nombre}+${form.apellido}&background=random&bold=true`}
              sx={{ width: 96, height: 96, border: '4px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            />
            <Box className="avatar-overlay" sx={{ position: 'absolute', inset: 0, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: avatarUploading ? 1 : 0, transition: 'opacity 0.2s' }}>
              <PhotoCamera sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Box>
          <Typography variant="h5" fontWeight="bold" mt={1}>{form.nombre} {form.apellido}</Typography>
          {estudiante?.carreras?.length > 0 ? (
            <Box display="flex" justifyContent="center" flexWrap="wrap" gap={0.5} mt={0.5}>
              {estudiante.carreras.map((c, i) => (
                <Chip key={i} label={c.nombre} size="small" icon={<SchoolIcon sx={{ fontSize: 14 }} />} variant="outlined" color="primary" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" mt={0.5}>Estudiante</Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>Datos personales</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Género" name="genero" value={form.genero} onChange={handleChange}>
                  {generos.map((g) => (
                    <MenuItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Fecha de Nacimiento" name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                {form.fechaNacimiento && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Edad: {calcularEdad(form.fechaNacimiento)} años
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Box mt={2}>
              <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving} size="large">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {situacionAcademica?.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <SchoolIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Información Académica</Typography>
            </Box>
            {situacionAcademica.map((acad, idx) => {
              const stats = acad.estadisticas || {};
              const total = stats.materiasAprobadas + stats.materiasRegularizaciones + stats.materiasCursando || 1;
              const progreso = Math.round((stats.materiasAprobadas / total) * 100);
              return (
                <Box key={idx}>
                  {idx > 0 && <Divider sx={{ my: 3 }} />}
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>{acad.carrera}</Typography>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" color="text.secondary">Progreso general</Typography>
                      <Typography variant="caption" fontWeight="bold" color="success.main">{progreso}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progreso} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
                        <Typography variant="h4" fontWeight="bold" color="success.main">{stats.materiasAprobadas || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">Aprobadas</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', borderRadius: 2, border: '1px solid', borderColor: 'warning.200' }}>
                        <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.materiasRegularizaciones || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">Regularizadas</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.200' }}>
                        <Typography variant="h4" fontWeight="bold" color="info.main">{stats.materiasCursando || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">Cursando</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              );
            })}
            <Box mt={3} textAlign="center">
              <Button variant="contained" startIcon={<MenuBookIcon />} onClick={() => navigate('/academico/mis-materias')} size="large" sx={{ borderRadius: 2, px: 4 }}>
                Ver Detalle de Materias
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {situacionAcademica?.length === 0 && estudiante && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>Información Académica</Typography>
            <Typography variant="body2" color="text.secondary">Sin carrera asignada</Typography>
          </CardContent>
        </Card>
      )}

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
  const [tab, setTab] = useState(0);

  return (
    <PageContainer maxWidth={900}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Tabs
          orientation="vertical"
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            minWidth: 180,
            borderRight: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { alignItems: 'flex-start', minHeight: 48, pl: 2 },
          }}
        >
          <Tab icon={<Person />} label="Perfil" iconPosition="start" />
          <Tab icon={<Lock />} label="Privacidad" iconPosition="start" />
        </Tabs>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <TabPanel value={tab} index={0}>
            <ProfileSection />
          </TabPanel>
          <TabPanel value={tab} index={1}>
            <PrivacySection />
          </TabPanel>
        </Box>
      </Box>
    </PageContainer>
  );
}
