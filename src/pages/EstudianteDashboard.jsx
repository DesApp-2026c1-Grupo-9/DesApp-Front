import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  Divider,
} from '@mui/material';
import { PageContainer, LoadingSpinner } from '../components/ui';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { calcularEdad } from '../utils';
import {
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';

const adminTheme = createTheme({
  palette: {
    primary: { main: '#ed6c02' },
  },
});

export const EstudianteDashboard = () => {
  const navigate = useNavigate();
  const { estudianteActual } = useAuth();
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
            materiasRegularizaciones: situacionData.data?.resumen?.regularizadas || 0,
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

              <Box mt={2}>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/configuracion')}
                  size="large"
                  fullWidth
                >
                  Configuración del Perfil
                </Button>
              </Box>
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

              <Box mt={3} textAlign="center">
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
    </PageContainer>
  );
};