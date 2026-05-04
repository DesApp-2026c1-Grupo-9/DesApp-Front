import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Button,
  Avatar,
  Paper
} from '@mui/material';
import { 
  School, 
  Person, 
  Book, 
  TrendingUp, 
  CalendarToday,
  CheckCircle,
  PlayArrow,
  Warning,
  Assignment,
  Event
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const { estudianteActual, loading: authLoading } = useAuth();
  const [estudianteInfo, setEstudianteInfo] = useState(null);
  const [situacionAcademica, setSituacionAcademica] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del estudiante actual
  useEffect(() => {
    const loadStudentData = async () => {
      if (!estudianteActual?.id) return;
      
      try {
        setLoading(true);
        const [estudianteData, materias] = await Promise.all([
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
          carrera: materias.data?.carrera?.nombre,
          resumen: materias.data?.resumen || {},
          materiasPorAnio: materias.data?.materiasPorAnio || {},
          situacionAcademica: Object.values(materias.data?.materiasPorAnio || {}).flat() || []
        };
        
        setEstudianteInfo(estudianteInfo);
        setSituacionAcademica(situacionProcesada);
        
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (estudianteActual) {
      loadStudentData();
    }
  }, [estudianteActual]);

  // Loading state
  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Cargando datos del estudiante...</Typography>
      </Box>
    );
  }

  if (!estudianteInfo) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography color="error">Error al cargar datos del estudiante</Typography>
      </Box>
    );
  }

  const proximasFechas = [
    { evento: 'Período de Finales', fecha: 'Julio 1-15, 2026', tipo: 'periodo' }
  ];

  // Calcular progreso basado en datos reales del backend
  const materiasAprobadas = situacionAcademica?.resumen?.aprobadas || 0;
  const materiasRegularizadas = situacionAcademica?.resumen?.regularizadas || 0;
  const materiasCursando = []; // Por ahora empty array, se puede calcular si es necesario
  const totalMaterias = situacionAcademica?.resumen?.total || 0;
  const progresoCarrera = totalMaterias > 0 ? (materiasAprobadas / totalMaterias) * 100 : 0;

  const getEventIcon = (tipo) => {
    switch (tipo) {
      case 'inscripcion': return <Assignment color="primary" />;
      case 'examen': return <Event color="warning" />;
      case 'periodo': return <CalendarToday color="info" />;
      default: return <Event />;
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {/* Header de Bienvenida */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Avatar 
              src={estudianteInfo.avatarUrl}
              sx={{ width: 80, height: 80, mr: 3 }}
            >
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" gutterBottom>
                ¡Bienvenido, {estudianteInfo.nombre} {estudianteInfo.apellido}!
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {estudianteInfo.carreras?.[0]?.nombre || 'Sin carrera'} - 2024 • 1er Cuatrimestre 2026
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Navegación entre estudiantes - REMOVIDA para mayor realismo */}
      </Box>

      {/* Métricas Rápidas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {materiasAprobadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Materias Aprobadas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                de {totalMaterias} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayArrow sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {materiasCursando.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cursando Ahora
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {materiasRegularizadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Regularizadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Botón para ver todas las materias */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          startIcon={<School />}
          onClick={() => navigate('/mis-materias')}
          sx={{ px: 4, py: 1.5 }}
        >
          Ver Plan de Estudios Completo
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Mi Cursada Actual */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Mi Cursada Actual (2026-1)
              </Typography>
              <List>
                {materiasCursando.map((materia, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <PlayArrow color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary={materia.nombre}
                      secondary={materia.estado}
                    />
                    <Chip label={materia.estado} color="info" size="small" />
                  </ListItem>
                ))}
              </List>
              
              {materiasRegularizadas.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <strong>Materias Regularizadas:</strong>
                  </Alert>
                  <List>
                    {materiasRegularizadas.map((materia, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={materia.nombre}
                          secondary={`Vence: ${materia.vencimiento}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Próximas Fechas Importantes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Próximas Fechas Importantes
              </Typography>
              <List>
                {proximasFechas.map((fecha, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {getEventIcon(fecha.tipo)}
                    </ListItemIcon>
                    <ListItemText
                      primary={fecha.evento}
                      secondary={fecha.fecha}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Progreso de Carrera */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Progreso de Carrera
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={progresoCarrera} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progresoCarrera)}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Has completado {materiasAprobadas} de {totalMaterias} materias de {estudianteInfo.carreras?.[0]?.nombre || 'tu carrera'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mensaje informativo */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Usa el menú superior para acceder a información detallada de tu perfil, carreras y situación académica
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;