import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Grid,
  Alert,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar
} from '@mui/material';
import { PageContainer, LoadingSpinner } from '../components/ui';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { calcularEdad } from '../utils';
import {
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Public,
  Lock,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';
import { fetchPreferencias, updatePreferencias } from '../features/auth/slice';
import { useSnackbar } from '../hooks';

const adminTheme = createTheme({
  palette: {
    primary: { main: '#ed6c02' },
  },
});

export const EstudianteDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { estudianteActual } = useAuth();
  const { user, students, preferencias, loadingPreferencias, errorPreferencias } = useSelector(state => state.auth);
  const esAdmin = user?.rol === 'administrador';
  const totalUsuarios = students?.length || 0;
  const totalEstudiantes = students?.filter((item) => item.rol !== 'administrador').length || 0;
  const totalAdministradores = students?.filter((item) => item.rol === 'administrador').length || 0;
  
  const [estudiante, setEstudiante] = useState(null);
  const [situacionAcademica, setSituacionAcademica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  const [perfilPublico, setPerfilPublico] = useState(true);
  const [visibleEnDescubrir, setVisibleEnDescubrir] = useState(true);
  const [pubInscripciones, setPubInscripciones] = useState(true);
  const [pubRegularizaciones, setPubRegularizaciones] = useState(true);
  const [pubAprobaciones, setPubAprobaciones] = useState(true);
  const [pubSesiones, setPubSesiones] = useState(true);
  const [recibirEmails, setRecibirEmails] = useState(true);

  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();

  const usuarioId = estudianteActual?.usuario?.id;

  useEffect(() => {
    if (usuarioId) {
      dispatch(fetchPreferencias(usuarioId));
    }
  }, [usuarioId, dispatch]);

  useEffect(() => {
    if (preferencias) {
      setPerfilPublico(preferencias.perfilPublico ?? true);
      setVisibleEnDescubrir(preferencias.visibleEnDescubrir ?? true);
      setPubInscripciones(preferencias.publicarInscripciones ?? true);
      setPubRegularizaciones(preferencias.publicarRegularizaciones ?? true);
      setPubAprobaciones(preferencias.publicarAprobaciones ?? true);
      setPubSesiones(preferencias.publicarSesiones ?? true);
      setRecibirEmails(preferencias.recibirEmails ?? true);
    }
  }, [preferencias]);

  const handlePerfilPublicoChange = (e) => {
    const newValue = e.target.checked;
    setPerfilPublico(newValue);

    if (usuarioId) {
      dispatch(updatePreferencias({
        estudianteId: usuarioId,
        preferencias: { perfilPublico: newValue }
      }))
        .unwrap()
        .then(() => {
          showSuccess('Preferencia guardada');
        })
        .catch((err) => {
          setPerfilPublico(!newValue);
          showError('Error al guardar: ' + (err.message || 'Error desconocido'));
        });
    }
  };

  const handleVisibleEnDescubrirChange = (e) => {
    const newValue = e.target.checked;
    setVisibleEnDescubrir(newValue);

    if (usuarioId) {
      dispatch(updatePreferencias({
        estudianteId: usuarioId,
        preferencias: { visibleEnDescubrir: newValue }
      }))
        .unwrap()
        .then(() => {
          showSuccess('Preferencia guardada');
        })
        .catch((err) => {
          setVisibleEnDescubrir(!newValue);
          showError('Error al guardar: ' + (err.message || 'Error desconocido'));
        });
    }
  };

  const handlePublishChange = (field, setter) => (e) => {
    const newValue = e.target.checked;
    setter(newValue);
    if (usuarioId) {
      dispatch(updatePreferencias({
        estudianteId: usuarioId,
        preferencias: { [field]: newValue }
      }))
        .unwrap()
        .then(() => {
          showSuccess('Preferencia guardada');
        })
        .catch((err) => {
          setter(!newValue);
          showError('Error al guardar: ' + (err.message || 'Error desconocido'));
        });
    }
  };

  useEffect(() => {
    const cargarDatosEstudiante = async () => {
      if (!estudianteActual?.id) {
        setEstudiante(null);
        setSituacionAcademica(null);
        setError(null);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const [estudianteData, situacionData] = await Promise.all([
          EstudianteService.obtenerEstudiante(estudianteActual.id),
          EstudianteService.obtenerMateriasEstudiante(estudianteActual.id)
        ]);
        
        const estudianteInfo = {
          ...estudianteData.data,
          ...estudianteData.data.usuario,
          carreras: estudianteData.data.carreras
        };
        
        const situacionProcesada = {
          carrera: situacionData.data?.carrera?.nombre,
          estadisticas: {
            materiasAprobadas: situacionData.data?.resumen?.aprobadas || 0,
            materiasRegularizaciones: situacionData.data?.resumen?.regularizaciones || 0,
            materiasCursando: situacionData.data?.resumen?.cursando || 0,
            totalMaterias: situacionData.data?.resumen?.total || 0
          },
          situacionAcademica: Object.values(situacionData.data?.materiasPorAnio || {}).flat() || []
        };
        
        setEstudiante(estudianteInfo);
        setSituacionAcademica(situacionProcesada);
      } catch (err) {
        console.error('Error al cargar datos del estudiante:', err);
        setError('Error al cargar la información del estudiante');
      } finally {
        setLoading(false);
      }
    };

    if (estudianteActual) {
      cargarDatosEstudiante();
    }
  }, [estudianteActual]);

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'Aprobada': return 'success';
      case 'Regularizada': return 'warning';
      case 'Cursando': return 'info';
      default: return 'default';
    }
  };

  if (esAdmin) {
    return (
      <ThemeProvider theme={adminTheme}>
      <PageContainer maxWidth={800}>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ width: 80, height: 80, mr: 2, bgcolor: 'primary.main' }}>
                    <AdminPanelSettingsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {user?.nombre || 'Admin Inicial'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user?.rol || 'administrador'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ID: {user?.id || '-'}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" gutterBottom>
                  <strong>Email:</strong> {user?.email || 'no disponible'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Modo:</strong> Administracion general
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="subtitle2">
                    Perfil administrativo
                  </Typography>
                </Box>

                <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                  Este perfil no tiene situacion academica asociada; muestra accesos y control operativo.
                </Typography>

              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h4" color="primary.main">
                    {totalUsuarios}
                  </Typography>
                  <Typography variant="caption">Usuarios totales</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h4" color="success.main">
                    {totalEstudiantes}
                  </Typography>
                  <Typography variant="caption">Estudiantes</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h4" color="warning.main">
                    {totalAdministradores}
                  </Typography>
                  <Typography variant="caption">Administradores</Typography>
                </Paper>
              </Grid>
            </Grid>


          </Grid>
        </Grid>
      </PageContainer>
      </ThemeProvider>
    );
  }

  if (loading) {
    return (
      <PageContainer centered padding={3}>
        <LoadingSpinner message="Cargando perfil..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!estudiante || !situacionAcademica) {
    return (
      <Box p={3}>
        <Alert severity="info">No se encontró información del estudiante</Alert>
      </Box>
    );
  }

  return (
    <PageContainer maxWidth={800}>
      <Grid container spacing={3}>
        {/* Información Personal */}
        <Grid item xs={12}>
          <Card sx={{ '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar 
                  src={estudiante.avatarUrl || `https://ui-avatars.com/api/?name=${estudiante.nombre}+${estudiante.apellido}&background=random`}
                  sx={{ width: 80, height: 80, mr: 2 }}
                ></Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {estudiante.nombre} {estudiante.apellido}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estudiante
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" gutterBottom>
                <strong>Email:</strong> {estudiante.email}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Fecha de Nacimiento:</strong> {estudiante.fechaNacimiento}
              </Typography>
              <Typography variant="body2">
                <strong>Edad:</strong> {calcularEdad(estudiante.fechaNacimiento)} años
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" alignItems="center" gap={1} mb={1}>
                {perfilPublico ? <Public color="success" fontSize="small" /> : <Lock fontSize="small" />}
                <Typography variant="subtitle2">
                  Visibilidad del Perfil
                </Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={perfilPublico}
                    onChange={handlePerfilPublicoChange}
                    size="small"
                    disabled={loadingPreferencias}
                  />
                }
                label="Perfil Público"
              />

              <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                {perfilPublico 
                  ? 'Tu perfil es visible para todos' 
                  : 'Tu perfil es visible solo para tus contactos'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Cambios de marcos/Conexiones */}
              <FormControlLabel
                control={
                  <Switch
                    checked={visibleEnDescubrir}
                    onChange={handleVisibleEnDescubrirChange}
                    size="small"
                    disabled={loadingPreferencias}
                  />
                }
                label="Aparecer en búsqueda de contactos"
              />

              <Typography variant="caption" color="textSecondary" display="block" mb={2}>
                Los demás estudiantes podrán encontrarte por nombre en la sección Descubrir de Conexiones
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Cambios de develop */}
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="subtitle2">
                  Publicación automática en el Feed
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={pubInscripciones}
                    onChange={handlePublishChange('publicarInscripciones', setPubInscripciones)}
                    size="small"
                    disabled={loadingPreferencias}
                  />
                }
                label="Publicar inscripciones"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={pubRegularizaciones}
                    onChange={handlePublishChange('publicarRegularizaciones', setPubRegularizaciones)}
                    size="small"
                    disabled={loadingPreferencias}
                  />
                }
                label="Publicar regularizaciones"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={pubAprobaciones}
                    onChange={handlePublishChange('publicarAprobaciones', setPubAprobaciones)}
                    size="small"
                    disabled={loadingPreferencias}
                  />
                }
                label="Publicar aprobaciones"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={pubSesiones}
                    onChange={handlePublishChange('publicarSesiones', setPubSesiones)}
                    size="small"
                    disabled={loadingPreferencias}
                  />
                }
                label="Publicar sesiones de estudio"
              />

              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                Controla qué eventos se publican automáticamente en tu feed de novedades
              </Typography>

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={recibirEmails}
                    onChange={handlePublishChange('recibirEmails', setRecibirEmails)}
                    size="small"
                    disabled={loadingPreferencias}
                  />
                }
                label="Recibir notificaciones por email"
              />

              <Typography variant="caption" color="textSecondary" display="block">
                Recibirás un email por cada notificación generada en la plataforma
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Información Académica */}
        <Grid item xs={12}>
          <Card sx={{ '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Información Académica</Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom color="primary">
                {situacionAcademica?.carrera || 'Cargando...'}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {situacionAcademica?.estadisticas?.materiasAprobadas || 0}
                    </Typography>
                    <Typography variant="caption">Aprobadas</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {situacionAcademica?.estadisticas?.materiasRegularizaciones || 0}
                    </Typography>
                    <Typography variant="caption">Regularizadas</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {situacionAcademica?.estadisticas?.materiasCursando || 0}
                    </Typography>
                    <Typography variant="caption">Cursando</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box mt={3}>
                <Button 
                  variant="contained" 
                  startIcon={<MenuBookIcon />}
                  onClick={() => navigate('/academico/mis-materias')}
                  size="large"
                >
                  Ver Detalle de Materias
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};