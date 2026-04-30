import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EstudianteService from '../services/EstudianteService';
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
  Avatar
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
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos de estudiantes al montar el componente
  useEffect(() => {
    const loadStudentsData = async () => {
      try {
        // Cargar los 3 estudiantes
        const estudiantes = await Promise.all([
          EstudianteService.obtenerEstudiante(1),
          EstudianteService.obtenerEstudiante(2),
          EstudianteService.obtenerEstudiante(3)
        ]);
        
        // Transformar datos para compatibilidad con la UI
        const transformedStudents = estudiantes.map(estudiante => ({
          id: estudiante.id,
          name: `${estudiante.nombre} ${estudiante.apellido}`,
          avatar: estudiante.avatar,
          carrera: estudiante.carrera,
          planEstudio: estudiante.planEstudio,
          materiasAprobadas: estudiante.estadisticas.materiasAprobadas,
          totalMaterias: estudiante.estadisticas.materiasAprobadas + estudiante.estadisticas.materiasRegularizadas + estudiante.estadisticas.materiasCursando + estudiante.estadisticas.materiasSinCursar,
          promedio: estudiante.promedio,
          materiasCursando: estudiante.situacionAcademica
            .filter(m => m.estado === 'Cursando')
            .map(m => ({ nombre: m.nombre, estado: m.estado })),
          materiasRegularizadas: estudiante.situacionAcademica
            .filter(m => m.estado === 'Regularizada')
            .map(m => ({ nombre: m.nombre, vencimiento: 'Próximamente' }))
        }));
        
        setStudentsData(transformedStudents);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando estudiantes:', error);
        setLoading(false);
      }
    };

    loadStudentsData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Cargando datos del estudiante...</Typography>
      </Box>
    );
  }

  if (studentsData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography color="error">Error al cargar datos del estudiante</Typography>
      </Box>
    );
  }

  const currentStudent = studentsData[currentStudentIndex];

  const proximasFechas = [
    { evento: 'Período de Finales', fecha: 'Julio 1-15, 2026', tipo: 'periodo' }
  ];

  const progresoCarrera = (currentStudent.materiasAprobadas / currentStudent.totalMaterias) * 100;

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
              src={currentStudent.avatar}
              sx={{ width: 80, height: 80, mr: 3 }}
            >
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" gutterBottom>
                ¡Bienvenido, {currentStudent.name}!
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {currentStudent.carrera} - {currentStudent.planEstudio} • 1er Cuatrimestre 2026
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Navegación entre estudiantes */}
        <Box display="flex" gap={1} mt={2}>
          {studentsData.map((student, index) => (
            <Button
              key={student.id}
              variant={index === currentStudentIndex ? "contained" : "outlined"}
              size="small"
              onClick={() => setCurrentStudentIndex(index)}
              startIcon={
                <Avatar src={student.avatar} sx={{ width: 24, height: 24 }}>
                  <Person sx={{ fontSize: 16 }} />
                </Avatar>
              }
            >
              {student.name}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Métricas Rápidas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {currentStudent.materiasAprobadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Materias Aprobadas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                de {currentStudent.totalMaterias} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayArrow sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {currentStudent.materiasCursando.length}
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
                {currentStudent.materiasRegularizadas.length}
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
          onClick={() => navigate(`/estudiante/${currentStudent.id}/materias`)}
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
                {currentStudent.materiasCursando.map((materia, index) => (
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
              
              {currentStudent.materiasRegularizadas.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <strong>Materias Regularizadas:</strong>
                  </Alert>
                  <List>
                    {currentStudent.materiasRegularizadas.map((materia, index) => (
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
                Has completado {currentStudent.materiasAprobadas} de {currentStudent.totalMaterias} materias de la {currentStudent.carrera}
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