import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Paper,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Public,
  Lock
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';

export const EstudianteDashboard = () => {
  const navigate = useNavigate();
  const { estudianteActual, loading: authLoading } = useAuth();
  const [estudiante, setEstudiante] = useState(null);
  const [situacionAcademica, setSituacionAcademica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perfilPublico, setPerfilPublico] = useState(true);

  useEffect(() => {
    if (estudianteActual?.id) {
      const stored = localStorage.getItem(`perfilPublico_${estudianteActual.id}`);
      setPerfilPublico(stored !== null ? stored === 'true' : true);
    }
  }, [estudianteActual]);

  const handlePerfilPublicoChange = (e) => {
    const newValue = e.target.checked;
    setPerfilPublico(newValue);
    if (estudianteActual?.id) {
      localStorage.setItem(`perfilPublico_${estudianteActual.id}`, newValue.toString());
    }
  };

  useEffect(() => {
    const cargarDatosEstudiante = async () => {
      if (!estudianteActual?.id) return;
      
      try {
        setLoading(true);
        const [estudianteData, situacionData] = await Promise.all([
          EstudianteService.obtenerEstudiante(estudianteActual.id),
          EstudianteService.obtenerMateriasEstudiante(estudianteActual.id)
        ]);
        
        // Procesar datos del estudiante
        const estudianteInfo = {
          ...estudianteData.data,
          ...estudianteData.data.usuario,
          carreras: estudianteData.data.carreras
        };
        
        // Procesar situación académica desde la nueva estructura
        const situacionProcesada = {
          carrera: situacionData.data?.carrera?.nombre,
          estadisticas: {
            materiasAprobadas: situacionData.data?.resumen?.aprobadas || 0,
            materiasRegularizadas: situacionData.data?.resumen?.regularizadas || 0,
            materiasCursando: 0, // Se puede calcular de las materias si es necesario
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

  const verMaterias = () => {
    navigate('/mis-materias');
  };

  // Función navegarAOtroEstudiante removida - no es realista

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
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
    <Box p={3}>
      {/* Navegación entre estudiantes - REMOVIDA para mayor realismo */}

      {/* Saludo personalizado */}
      <Typography variant="h4" gutterBottom>
        Bienvenido, {estudiante.nombre} {estudiante.apellido}
      </Typography>

      <Grid container spacing={3}>
        {/* Información Personal */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar 
                  src={estudiante.avatarUrl} 
                  sx={{ width: 80, height: 80, mr: 2 }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {estudiante.nombre} {estudiante.apellido}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {estudiante.id}
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
                <strong>Edad:</strong> {estudiante.edad} años
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
                  />
                }
                label="Perfil Público"
              />

               <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                {perfilPublico 
                  ? 'Tu perfil es visible para todos' 
                  : 'Tus perfil es visible solo para tus contactos'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Información Académica */}
        <Grid item xs={12} md={8}>
          <Card>
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
                      {situacionAcademica?.estadisticas?.materiasRegularizadas || 0}
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
                  onClick={() => navigate('/mis-materias')}
                  size="large"
                >
                  Ver Detalle de Materias
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Últimas Materias */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado Actual de Materias
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {(situacionAcademica?.situacionAcademica || [])
                  .slice(0, 8) // Mostrar solo las primeras 8
                  .map((materia, index) => (
                  <Chip
                    key={index}
                    label={`${materia.nombre} (${materia.estado})`}
                    color={obtenerColorEstado(materia.estado)}
                    variant={materia.estado === 'Cursando' ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};