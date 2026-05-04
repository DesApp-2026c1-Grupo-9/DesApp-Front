import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Paper,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  MenuBook as MenuBookIcon,
  AccountCircle
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';

export const ListaEstudiantes = () => {
  const navigate = useNavigate();
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        setLoading(true);
        const estudiantesData = await EstudianteService.obtenerTodosEstudiantes();
        setEstudiantes(estudiantesData);
      } catch (err) {
        console.error('Error al cargar estudiantes:', err);
        setError('Error al cargar la lista de estudiantes');
      } finally {
        setLoading(false);
      }
    };

    cargarEstudiantes();
  }, []);

  const verEstudiante = (id) => {
    navigate(`/estudiante/${id}`);
  };

  const verMateriasEstudiante = (id) => {
    navigate(`/estudiante/${id}/materias`);
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
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <PersonIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" color="primary">
              Lista de Estudiantes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Explora los perfiles de todos los estudiantes registrados
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
        Total de estudiantes: <strong>{estudiantes.length}</strong>
      </Typography>

      <Grid container spacing={3}>
        {estudiantes.map((estudiante) => (
          <Grid item xs={12} sm={6} md={4} key={estudiante.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={2} alignItems="center">
                  {/* Avatar del estudiante */}
                  <Avatar
                    src={estudiante.avatarUrl}
                    sx={{ width: 80, height: 80 }}
                  >
                    <AccountCircle sx={{ fontSize: 60 }} />
                  </Avatar>

                  {/* Información básica */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" component="h2">
                      {estudiante.nombre} {estudiante.apellido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {estudiante.id}
                    </Typography>
                  </Box>

                  {/* Carrera */}
                  <Chip
                    icon={<SchoolIcon />}
                    label={estudiante.carrera}
                    color="primary"
                    size="small"
                  />

                  {/* Nivel académico */}
                  <Chip
                    label={estudiante.nivel}
                    color={getNivelColor(estudiante.nivel)}
                    size="small"
                  />

                  {/* Información adicional */}
                  <Box sx={{ textAlign: 'center', width: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Edad: {estudiante.edad} años
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Plan: {estudiante.planEstudio}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>

              {/* Botones de acción */}
              <Box sx={{ p: 2, pt: 0 }}>
                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PersonIcon />}
                    onClick={() => verEstudiante(estudiante.id)}
                  >
                    Ver Perfil
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<MenuBookIcon />}
                    onClick={() => verMateriasEstudiante(estudiante.id)}
                  >
                    Ver Materias
                  </Button>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {estudiantes.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay estudiantes registrados
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ListaEstudiantes;