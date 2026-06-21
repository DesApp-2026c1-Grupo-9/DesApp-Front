import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateAvatar } from '../features/auth/slice';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  Alert,
  Paper,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import { PageContainer, LoadingSpinner } from '../components/ui';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { calcularEdad } from '../utils';
import {
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';
import { PhotoCamera } from '@mui/icons-material';

const adminTheme = createTheme({
  palette: {
    primary: { main: '#ed6c02' },
  },
});

export const EstudianteDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { estudianteActual } = useAuth();
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const { user, students } = useSelector(state => state.auth);
  const esAdmin = user?.rol === 'administrador';
  const totalUsuarios = students?.length || 0;
  const totalEstudiantes = students?.filter((item) => item.rol !== 'administrador').length || 0;
  const totalAdministradores = students?.filter((item) => item.rol === 'administrador').length || 0;
  
  const [estudiante, setEstudiante] = useState(null);
  const [situacionAcademica, setSituacionAcademica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        const estudianteData = await EstudianteService.obtenerEstudiante(estudianteActual.id);
        
        const estudianteInfo = {
          ...estudianteData.data,
          ...estudianteData.data.usuario,
          carreras: estudianteData.data.carreras,
        };
        
        setEstudiante(estudianteInfo);
        
        const carreras = estudianteInfo.carreras || [];
        const resultados = [];
        for (const carrera of carreras) {
          try {
            const data = await EstudianteService.obtenerMateriasEstudiante(estudianteActual.id, carrera.id);
            resultados.push({
              carreraId: carrera.id,
              carrera: data.data?.carrera?.nombre || carrera.nombre,
              estadisticas: {
                materiasAprobadas: data.data?.resumen?.aprobadas || 0,
                materiasRegularizaciones: data.data?.resumen?.regularizadas || 0,
                materiasCursando: data.data?.resumen?.cursando || 0,
                totalMaterias: data.data?.resumen?.total || 0,
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

  if (esAdmin) {
    return (
      <ThemeProvider theme={adminTheme}>
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
                background: 'linear-gradient(135deg, #ed6c02, #ffb74d)',
              }}
            />
            <CardContent sx={{ mt: -6, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  mx: 'auto',
                  border: '4px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  bgcolor: 'primary.main',
                }}
              >
                <AdminPanelSettingsIcon sx={{ fontSize: 48 }} />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" mt={1}>
                {user?.nombre || 'Admin'}
              </Typography>
              <Typography variant="body2" color="text.secondary" textTransform="capitalize">
                {user?.rol || 'administrador'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="center" gap={4} flexWrap="wrap">
                <Typography variant="body2">
                  <strong>Email:</strong> {user?.email || 'no disponible'}
                </Typography>
                <Typography variant="body2">
                  <strong>ID:</strong> {user?.id || '-'}
                </Typography>
              </Box>

              <Box mt={2} p={2} bgcolor="grey.50" borderRadius={2}>
                <Typography variant="body2" color="text.secondary">
                  Panel de administración general — acceso y control operativo del sistema.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Paper
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.200',
                  bgcolor: 'primary.50',
                }}
              >
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {totalUsuarios}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Usuarios totales
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'success.200',
                  bgcolor: 'success.50',
                }}
              >
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {totalEstudiantes}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estudiantes
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'warning.200',
                  bgcolor: 'warning.50',
                }}
              >
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {totalAdministradores}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Administradores
                </Typography>
              </Paper>
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const usuarioId = user?.id;
      if (!usuarioId) return;

      const result = await dispatch(updateAvatar({ id: usuarioId, file })).unwrap();
      setEstudiante((prev) => ({ ...prev, avatarUrl: result }));
    } catch {
      console.error('Error al subir avatar');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const generoLabel = estudiante.genero
    ? estudiante.genero.charAt(0).toUpperCase() + estudiante.genero.slice(1)
    : null;

  return (
    <PageContainer maxWidth={800}>
      {/* Información Personal */}
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <Box
            sx={{
              position: 'relative',
              width: 96,
              height: 96,
              mx: 'auto',
              cursor: 'pointer',
              '&:hover .avatar-overlay': { opacity: 1 },
            }}
            onClick={handleAvatarClick}
          >
            <Avatar
              src={estudiante.avatarUrl || `https://ui-avatars.com/api/?name=${estudiante.nombre}+${estudiante.apellido}&background=random&bold=true`}
              sx={{
                width: 96,
                height: 96,
                boxSizing: 'border-box',
                border: '4px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
            <Box
              className="avatar-overlay"
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                bgcolor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: avatarUploading ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
            >
              <PhotoCamera sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Box>
          <Typography variant="h5" fontWeight="bold" mt={1}>
            {estudiante.nombre} {estudiante.apellido}
          </Typography>
          {estudiante.carreras?.length > 0 ? (
            <Box display="flex" justifyContent="center" flexWrap="wrap" gap={0.5} mt={0.5}>
              {estudiante.carreras.map((c, i) => (
                <Chip
                  key={i}
                  label={c.nombre}
                  size="small"
                  icon={<SchoolIcon sx={{ fontSize: 14 }} />}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Estudiante
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2">{estudiante.email}</Typography>
            </Box>
            {estudiante.fechaNacimiento && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <CakeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {new Date(estudiante.fechaNacimiento).toLocaleDateString('es-AR')}
                  {` (${calcularEdad(estudiante.fechaNacimiento)} años)`}
                </Typography>
              </Box>
            )}
            {generoLabel && (
              <Typography variant="body2" color="text.secondary">
                Género: {generoLabel}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Información Académica */}
      {situacionAcademica.length === 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Información Académica
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sin carrera asignada
            </Typography>
          </CardContent>
        </Card>
      )}

      {situacionAcademica.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <SchoolIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Información Académica
              </Typography>
            </Box>

            {situacionAcademica.map((acad, idx) => {
              const stats = acad.estadisticas || {};
              const total = stats.materiasAprobadas + stats.materiasRegularizaciones + stats.materiasCursando || 1;
              const progreso = Math.round((stats.materiasAprobadas / total) * 100);

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
                          {stats.materiasAprobadas || 0}
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
                          {stats.materiasRegularizaciones || 0}
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
                          {stats.materiasCursando || 0}
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

            <Box mt={3} textAlign="center">
              <Button
                variant="contained"
                startIcon={<MenuBookIcon />}
                onClick={() => navigate('/academico/mis-materias')}
                size="large"
                sx={{ borderRadius: 2, px: 4 }}
              >
                Ver Detalle de Materias
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
};