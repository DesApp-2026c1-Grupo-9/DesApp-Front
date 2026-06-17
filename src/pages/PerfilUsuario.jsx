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
  const [academicData, setAcademicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const esContacto = useMemo(() => {
    if (!conexiones?.length || !id) return false;
    return conexiones.some(c => Number(c.contacto?.id) === Number(id));
  }, [conexiones, id]);

  useEffect(() => {
    if (usuarioIdActual && !esMiPerfil) {
      dispatch(fetchConexiones(usuarioIdActual));
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

        try {
          const situacionResponse = await EstudianteService.obtenerMateriasEstudiante(estudianteId);
          const situacion = situacionResponse.data;
          if (situacion) {
            setAcademicData({
              carrera: situacion.carrera?.nombre,
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

  const puedeVerEmail = esMiPerfil || profile?.perfilPublico === false
    ? esContacto
    : (profile?.mostrarEmail ?? false);

  const puedeVerSituacion = esMiPerfil || profile?.perfilPublico === false
    ? esContacto
    : (profile?.mostrarSituacionAcademica ?? false);

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
  const carrera = academicData?.carrera || profile.carreras?.[0]?.nombre;

  return (
    <PageContainer maxWidth={800}>
      <Card sx={{ '&:hover': { boxShadow: (theme) => theme.shadows[2] } }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              src={avatarUrl || `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=random`}
              sx={{ width: 80, height: 80, mr: 2 }}
            />
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="h5" fontWeight="bold">
                  {nombre} {apellido}
                </Typography>
                {!profile.perfilPublico && !esMiPerfil && (
                  <Lock sx={{ fontSize: 16, color: 'text.disabled' }} />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Estudiante
              </Typography>
            </Box>
            {!esMiPerfil && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAdd />}
                onClick={handleInvite}
                disabled={esContacto}
              >
                {esContacto ? 'Conectado' : 'Agregar contacto'}
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {puedeVerEmail && email && (
            <Typography variant="body2" gutterBottom>
              <EmailIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 16 }} />
              {email}
            </Typography>
          )}

          {puedeVerEmail && fechaNacimiento && (
            <Typography variant="body2" gutterBottom>
              <CakeIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 16 }} />
              {fechaNacimiento}
              {edad ? ` (${edad} años)` : ''}
            </Typography>
          )}

          {!puedeVerTodo && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Este perfil es privado. Conectate con {nombre} para ver más detalles.
            </Alert>
          )}
        </CardContent>
      </Card>

      {puedeVerSituacion && carrera && (
        <Card elevation={0} sx={{ mt: 3, border: 1, borderColor: 'divider', transition: 'none' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <SchoolIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Información Académica</Typography>
            </Box>

            <Typography variant="h6" gutterBottom color="primary">
              {carrera}
            </Typography>

            {academicData?.estadisticas && (
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="h4" color="success.main">
                      {academicData.estadisticas.aprobadas ?? 0}
                    </Typography>
                    <Typography variant="caption">Aprobadas</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="h4" color="warning.main">
                      {academicData.estadisticas.regularizadas ?? 0}
                    </Typography>
                    <Typography variant="caption">Regularizadas</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="h4" color="info.main">
                      {academicData.estadisticas.cursando ?? 0}
                    </Typography>
                    <Typography variant="caption">Cursando</Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => navigate('/perfil/' + id + '/materias')}
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
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};
