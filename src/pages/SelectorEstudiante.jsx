import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  AccountCircle,
  Warning
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';

export const SelectorEstudiante = () => {
  const navigate = useNavigate();
  const { estudianteActual, cambiarEstudiante } = useAuth();
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        setLoading(true);
        const estudiantesData = await EstudianteService.obtenerTodosEstudiantes();
        console.log('Datos recibidos:', estudiantesData); // Debug
        // Manejar si viene en formato { data: [...] } o directamente [...]
        const estudiantesArray = Array.isArray(estudiantesData) ? estudiantesData : estudiantesData.data || [];
        setEstudiantes(estudiantesArray);
      } catch (err) {
        console.error('Error al cargar estudiantes:', err);
        setError('Error al cargar la lista de estudiantes');
      } finally {
        setLoading(false);
      }
    };

    cargarEstudiantes();
  }, []);

  const seleccionarEstudiante = async (id) => {
    await cambiarEstudiante(id);
    navigate('/mi-perfil');
  };

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'Principiante': return 'info';
      case 'Intermedio': return 'warning';
      case 'Avanzado': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando estudiantes...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'warning.light' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Warning color="warning" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" color="text.primary">
              🚨 Modo Demostración
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Esta página es SOLO para demostración. En una app real, cada estudiante solo ve SU información.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Estudiante actual: <strong>{estudianteActual?.nombre} {estudianteActual?.apellido}</strong>
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="h4" gutterBottom>
        Selector de Estudiante (Demo)
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Selecciona un estudiante para simular estar logueado como él:
      </Typography>

      <Grid container spacing={3}>
        {Array.isArray(estudiantes) && estudiantes.map((estudiante) => (
          <Grid item xs={12} sm={6} md={4} key={estudiante.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: estudianteActual?.id === estudiante.id ? 3 : 0,
                borderColor: 'primary.main',
                bgcolor: estudianteActual?.id === estudiante.id ? 'primary.50' : 'background.paper'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={2} alignItems="center">
                  <Avatar
                    src={estudiante.avatarUrl}
                    sx={{ width: 60, height: 60 }}
                  >
                    <AccountCircle sx={{ fontSize: 40 }} />
                  </Avatar>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" component="h2">
                      {estudiante.usuario?.nombre || estudiante.nombre} {estudiante.usuario?.apellido || estudiante.apellido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {estudiante.id}
                    </Typography>
                  </Box>

                  <Chip
                    icon={<SchoolIcon />}
                    label={estudiante.carreras?.[0]?.nombre || estudiante.carrera || 'Sin carrera'}
                    color="primary"
                    size="small"
                  />

                  <Chip
                    label={estudiante.nivel || 'Estudiante'}
                    color={getNivelColor(estudiante.nivel)}
                    size="small"
                  />

                  {estudianteActual?.id === estudiante.id && (
                    <Chip
                      label="👤 ACTUAL"
                      color="success"
                      variant="filled"
                    />
                  )}
                </Stack>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant={estudianteActual?.id === estudiante.id ? "outlined" : "contained"}
                  fullWidth
                  startIcon={<PersonIcon />}
                  onClick={() => seleccionarEstudiante(estudiante.id)}
                  disabled={estudianteActual?.id === estudiante.id}
                >
                  {estudianteActual?.id === estudiante.id ? "Seleccionado" : "Seleccionar"}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {Array.isArray(estudiantes) && estudiantes.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron estudiantes
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SelectorEstudiante;