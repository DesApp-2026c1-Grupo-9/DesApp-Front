import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';
import { fetchSesiones } from '../features/sesiones/slice';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  Event,
  AdminPanelSettings
} from '@mui/icons-material';

import { PageContainer, LoadingSpinner } from '../components/ui';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { estudianteActual } = useAuth();
  const { user } = useSelector((state) => state.auth);
  const { list: sesionesList } = useSelector((state) => state.sesiones);
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

  useEffect(() => {
    if (estudianteActual && user?.rol !== 'administrador' && estudianteActual.carreras?.length === 0) {
      navigate('/academico/carreras', { replace: true });
    }
  }, [estudianteActual, user, navigate]);

  useEffect(() => {
    if (estudianteActual?.id) {
      dispatch(fetchSesiones({
        estudianteId: estudianteActual.id,
        fechaInicio: new Date().toISOString().split('T')[0]
      }));
    }
  }, [estudianteActual, dispatch]);

  const esAdmin =
    user?.rol === 'administrador' ||
    String(user?.nombre || '').toLowerCase().includes('admin') ||
    String(user?.apellido || '').toLowerCase().includes('admin');

  if (esAdmin) {
    return (
      <PageContainer maxWidth={1200}>
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}
              >
                <AdminPanelSettings sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" gutterBottom>
                  ¡Hola, {user?.nombre || 'Admin Inicial'}!
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Panel de administracion del sistema
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  // Loading state
  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner message="Cargando datos del estudiante..." />
      </PageContainer>
    );
  }

  if (!estudianteInfo) {
    return (
      <PageContainer>
        <Typography color="error">Error al cargar datos del estudiante</Typography>
      </PageContainer>
    );
  }

  const estudianteId = estudianteActual?.id || estudianteActual?.estudianteId;

  const hoy = new Date().toISOString().split('T')[0];

  const proximasFechas = [
    { evento: 'Período de Finales', fecha: 'Julio 1-15, 2026', tipo: 'periodo' },
    ...sesionesList
      .filter(s => {
        const esParticipante = s.participantes?.some(p => p.estudianteId === estudianteId);
        const fechaSesion = s.fechaHora?.split('T')[0];
        return esParticipante && s.estado !== 'cancelada' && fechaSesion >= hoy;
      })
      .map(s => ({
        evento: s.tema,
        fecha: format(new Date(s.fechaHora), "dd 'de' MMMM yyyy - HH:mm", { locale: es }),
        tipo: 'sesion',
        materia: s.materia?.nombre
      }))
  ];

  // Calcular progreso basado en datos reales del backend
  const materiasAprobadas = situacionAcademica?.resumen?.aprobadas || 0;
  const materiasRegularizadas = situacionAcademica?.resumen?.regularizadas || 0;
  const totalMaterias = situacionAcademica?.resumen?.total || 0;
  const progresoCarrera = totalMaterias > 0 ? (materiasAprobadas / totalMaterias) * 100 : 0;
  const materiasCursandoList = situacionAcademica?.situacionAcademica?.filter(m => m.estado === 'cursando') || [];
  const materiasRegularizadasList = situacionAcademica?.situacionAcademica?.filter(m => m.estado === 'regularizada') || [];

  const getEventIcon = (tipo) => {
    switch (tipo) {
      case 'inscripcion': return <Assignment color="primary" />;
      case 'examen': return <Event color="warning" />;
      case 'periodo': return <CalendarToday color="info" />;
      case 'sesion': return <Book color="primary" />;
      default: return <Event />;
    }
  };

  return (
    <PageContainer maxWidth={1200}>
      {/* Header de Bienvenida */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Avatar 
              src={estudianteInfo.avatarUrl || `https://ui-avatars.com/api/?name=${estudianteInfo.nombre}+${estudianteInfo.apellido}&background=random`}
              sx={{ width: 80, height: 80, mr: 3 }}
            ></Avatar>
            <Box>
              <Typography variant="h3" gutterBottom>
                ¡Hola, {estudianteInfo.nombre} {estudianteInfo.apellido}!
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
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
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
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayArrow sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {materiasCursandoList.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cursando Ahora
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
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
          onClick={() => navigate('/academico/mis-materias')}
          sx={{ px: 4, py: 1.5 }}
        >
          Ver Plan de Estudios Completo
        </Button>
      </Box>

      <Grid container spacing={6}>
        {/* Mi Cursada Actual */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Mi Cursada Actual (2026-1)
              </Typography>
              <List>
                {materiasCursandoList.map((materia, index) => (
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
              
              {materiasRegularizadasList.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <strong>Materias Regularizadas:</strong>
                  </Alert>
                  <List>
                    {materiasRegularizadasList.map((materia, index) => (
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
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
          <Card sx={{ height: '100%' }}>
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
    </PageContainer>
  );
};

export default Home;