import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';

export const EstudianteDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estudiante, setEstudiante] = useState(null);
  const [situacionAcademica, setSituacionAcademica] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatosEstudiante = async () => {
      try {
        setLoading(true);
        const [estudianteData, situacionData] = await Promise.all([
          EstudianteService.obtenerEstudiante(id),
          EstudianteService.obtenerMateriasEstudiante(id)
        ]);
        setEstudiante(estudianteData);
        setSituacionAcademica(situacionData);
      } catch (err) {
        console.error('Error al cargar datos del estudiante:', err);
        setError('Error al cargar la información del estudiante');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarDatosEstudiante();
    }
  }, [id]);

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'Aprobada': return 'success';
      case 'Regularizada': return 'warning';
      case 'Cursando': return 'info';
      default: return 'default';
    }
  };

  const navegarAOtroEstudiante = (nuevoId) => {
    navigate(`/estudiante/${nuevoId}`);
  };

  if (loading) {
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
      {/* Navegación entre estudiantes */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Estudiantes Disponibles
        </Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant={id === '1' ? 'contained' : 'outlined'}
            onClick={() => navegarAOtroEstudiante(1)}
          >
            Juan Pérez (Avanzado)
          </Button>
          <Button 
            variant={id === '2' ? 'contained' : 'outlined'}
            onClick={() => navegarAOtroEstudiante(2)}
          >
            María González (Intermedio)
          </Button>
          <Button 
            variant={id === '3' ? 'contained' : 'outlined'}
            onClick={() => navegarAOtroEstudiante(3)}
          >
            Carlos López (Principiante)
          </Button>
        </Box>
      </Paper>

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
                {situacionAcademica.carrera}
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {situacionAcademica.estadisticas.materiasAprobadas}
                    </Typography>
                    <Typography variant="caption">Aprobadas</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {situacionAcademica.estadisticas.materiasRegularizadas}
                    </Typography>
                    <Typography variant="caption">Regularizadas</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {situacionAcademica.estadisticas.materiasCursando}
                    </Typography>
                    <Typography variant="caption">Cursando</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      {situacionAcademica.estadisticas.promedioGeneral || 'N/A'}
                    </Typography>
                    <Typography variant="caption">Promedio</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box mt={3}>
                <Button 
                  variant="contained" 
                  startIcon={<MenuBookIcon />}
                  onClick={() => navigate(`/estudiante/${id}/materias`)}
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
                {situacionAcademica.situacionAcademica
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