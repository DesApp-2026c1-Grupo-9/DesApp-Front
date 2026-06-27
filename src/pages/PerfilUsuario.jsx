import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Paper,
  Button,
  Alert,
  Divider,
  Chip,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import { PageContainer, LoadingSpinner } from '../components/ui';
import {
  School as SchoolIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  ArrowBack,
  PersonAdd,
  People,
  Lock,
  Public,
  Block,
  PersonSearch as PersonSearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';
import { fetchConexiones, inviteContact } from '../features/conexiones/slice';
import { calcularEdad } from '../utils';
import { useSnackbar } from '../hooks';

export const PerfilUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { estudianteActual, estudiantesDisponibles } = useAuth();
  const { user } = useSelector(state => state.auth);
  const { list: conexiones, loading: loadingConex } = useSelector(state => state.conexiones);
  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();

  const usuarioIdActual = estudianteActual?.usuario?.id;
  const esMiPerfil = Number(id) === Number(usuarioIdActual);

  useEffect(() => {
    if (esMiPerfil) {
      navigate('/mi-perfil', { replace: true });
    }
  }, [esMiPerfil, navigate]);

  const [profile, setProfile] = useState(null);
  const [academicData, setAcademicData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const esContacto = useMemo(() => {
    if (!conexiones?.length || !id) return false;
    return conexiones.some(c => Number(c.contacto?.id) === Number(id));
  }, [conexiones, id]);

  useEffect(() => {
    if (usuarioIdActual && !esMiPerfil) {
      dispatch(fetchConexiones(estudianteActual?.id));
    }
  }, [usuarioIdActual, esMiPerfil, dispatch]);

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const estudianteMatch = estudiantesDisponibles.find(
          e => Number(e.usuario?.id) === Number(id)
        );

        if (!estudianteMatch) {
          setError('No se encontró el usuario solicitado');
          return;
        }

        const estudianteId = estudianteMatch.id;

        const estudianteResponse = await EstudianteService.obtenerEstudiante(estudianteId);
        const data = estudianteResponse.data;
        setProfile(data);

        const carreras = data.carreras || [];
        const resultados = [];
        for (const carrera of carreras) {
          try {
            const situacionResponse = await EstudianteService.obtenerMateriasEstudiante(estudianteId, carrera.id);
            const situacion = situacionResponse.data;
            if (situacion) {
              resultados.push({
                carreraId: carrera.id,
                carrera: situacion.carrera?.nombre || carrera.nombre,
                estadisticas: {
                  aprobadas: situacion.resumen?.aprobadas || 0,
                  regularizadas: situacion.resumen?.regularizadas || 0,
                  cursando: situacion.resumen?.cursando || 0,
                  total: situacion.resumen?.total || 0,
                },
              });
            }
          } catch (err) {
            if (err?.response?.status === 403) {
              console.log('Situación académica no disponible (privacidad)');
            } else {
              console.error('Error al cargar situación académica:', err);
            }
          }
        }
        setAcademicData(resultados);
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        setError('Error al cargar la información del perfil');
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, [id, estudiantesDisponibles]);

  const handleInvite = async () => {
    if (!profile?.usuario?.email || !usuarioIdActual) return;
    try {
      await dispatch(inviteContact({
        email: profile.usuario.email,
        usuarioId: usuarioIdActual,
      })).unwrap();
      showSuccess('Invitación enviada exitosamente');
    } catch (err) {
      showError(err || 'Error al enviar invitación');
    }
  };

  const puedeVerEmail = esContacto
    ? true
    : (profile?.perfilPublico === false ? false : (profile?.mostrarEmail ?? false));

  const puedeVerSituacion = esContacto
    ? true
    : (profile?.perfilPublico === false ? false : (profile?.mostrarSituacionAcademica ?? false));

  const puedeVerTodo = esMiPerfil || esContacto || profile?.perfilPublico !== false;

  if (loading) {
    return (
      <PageContainer centered padding={3}>
        <LoadingSpinner message="Cargando perfil..." />
      </PageContainer>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer maxWidth={500}>
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <PersonSearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Usuario no encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              No encontramos un usuario con ese ID. Podés volver al inicio.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')} size="large">
              Ir al inicio
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const usuario = profile.usuario || {};
  const nombre = usuario.nombre || '';
  const apellido = usuario.apellido || '';
  const email = usuario.email || '';
  const avatarUrl = usuario.avatarUrl;
  const fechaNacimiento = usuario.fechaNacimiento;
  const edad = fechaNacimiento ? calcularEdad(fechaNacimiento) : null;
  const carreras = profile.carreras?.filter(Boolean) || [];

  return (
    <PageContainer maxWidth={800}>
      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          mb: 3,
        }}
      >
        <Box
          sx={{
            height: 100,
            background: theme =>
              `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
          }}
        />
        <CardContent sx={{ mt: -6, textAlign: 'center' }}>
          <Box position="relative" display="inline-block">
            <Avatar
              src={avatarUrl || `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=random&bold=true`}
              sx={{
                width: 96,
                height: 96,
                mx: 'auto',
                border: '4px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
            {!profile.perfilPublico && !esMiPerfil && (
              <Lock
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  fontSize: 20,
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                  p: 0.3,
                  border: '2px solid white',
                  color: 'text.disabled',
                }}
              />
            )}
          </Box>

          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={1}>
            <Typography variant="h5" fontWeight="bold">
              {nombre} {apellido}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={0.5} mt={0.5}>
            {carreras.length > 0 ? (
              carreras.map((c, i) => (
                <Chip
                  key={i}
                  label={c.nombre}
                  size="small"
                  icon={<SchoolIcon sx={{ fontSize: 14 }} />}
                  variant="outlined"
                  color="primary"
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Estudiante
              </Typography>
            )}
          </Box>

          {!esMiPerfil && (
            <Box mt={1.5}>
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAdd />}
                onClick={handleInvite}
                disabled={esContacto}
                sx={{ borderRadius: 2 }}
              >
                {esContacto ? 'Conectado' : 'Agregar contacto'}
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            {puedeVerEmail && email && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">{email}</Typography>
              </Box>
            )}
            {puedeVerEmail && fechaNacimiento && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <CakeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {new Date(fechaNacimiento).toLocaleDateString('es-AR')}
                  {edad ? ` (${edad} años)` : ''}
                </Typography>
              </Box>
            )}
          </Box>

          {!puedeVerTodo && (
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              Este perfil es privado. Conectate con {nombre} para ver más detalles.
            </Alert>
          )}
        </CardContent>
      </Card>

      {puedeVerSituacion && academicData.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <SchoolIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Información Académica
              </Typography>
            </Box>

            {academicData.map((acad, idx) => {
              const stats = acad.estadisticas || {};
              const total = stats.aprobadas + stats.regularizadas + stats.cursando || 1;
              const progreso = Math.round((stats.aprobadas / total) * 100);

              return (
                <Box key={idx}>
                  {idx > 0 && <Divider sx={{ my: 3 }} />}
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                    {acad.carrera}
                  </Typography>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Progreso general
                      </Typography>
                      <Typography variant="caption" fontWeight="bold" color="success.main">
                        {progreso}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progreso}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'success.50',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'success.200',
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                          {stats.aprobadas ?? 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Aprobadas
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'warning.50',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'warning.200',
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                          {stats.regularizadas ?? 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Regularizadas
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'info.50',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'info.200',
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                          {stats.cursando ?? 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cursando
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              );
            })}

            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                variant="contained"
                size="large"
                startIcon={<VisibilityIcon />}
                onClick={() => navigate('/perfil/' + id + '/materias')}
                sx={{ borderRadius: 2, px: 4 }}
              >
                Ver detalle de materias
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};
