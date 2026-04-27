import React from 'react';
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
  Alert
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
  // Datos del estudiante (mismos que en StudentProfilePage)
  const studentData = {
    name: 'Juan Pérez',
    carrera: 'Licenciatura en Informática',
    planEstudio: 'Plan 2026',
    materiasAprobadas: 5,
    totalMaterias: 45,
    promedio: 8.0,
    materiasCursando: [
      { nombre: 'Programación con Objetos I', estado: 'Cursando' },
      { nombre: 'Bases de Datos', estado: 'Cursando' }
    ],
    materiasRegularizadas: [
      { nombre: 'Estructuras de Datos', vencimiento: 'Junio 2026' }
    ]
  };

  const proximasFechas = [
    { evento: 'Período de exámenes', fecha: 'Julio 1-15, 2026', tipo: 'periodo' }
  ];

  const progresoCarrera = (studentData.materiasAprobadas / studentData.totalMaterias) * 100;

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
        <Typography variant="h3" gutterBottom>
          ¡Bienvenido, {studentData.name}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {studentData.carrera} - {studentData.planEstudio} • 1er Cuatrimestre 2026
        </Typography>
      </Box>

      {/* Métricas Rápidas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {studentData.materiasAprobadas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Materias Aprobadas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                de {studentData.totalMaterias} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayArrow sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {studentData.materiasCursando.length}
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
                {studentData.materiasRegularizadas.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Regularizadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Mi Cursada Actual */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Mi Cursada Actual (2026-1)
              </Typography>
              <List>
                {studentData.materiasCursando.map((materia, index) => (
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
              
              {studentData.materiasRegularizadas.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <strong>Materias Regularizadas:</strong>
                  </Alert>
                  <List>
                    {studentData.materiasRegularizadas.map((materia, index) => (
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
                Has completado {studentData.materiasAprobadas} de {studentData.totalMaterias} materias de la {studentData.carrera}
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
