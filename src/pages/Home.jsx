import React, { useState, useEffect, useMemo } from 'react';
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
  Button,
  Avatar,
  Stack,
  IconButton
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
  AdminPanelSettings,
  Groups,
  Speed,
  EmojiEvents,
  MenuBook,
  ChevronRight
} from '@mui/icons-material';

import { PageContainer, LoadingSpinner, SectionCard, PageTransition } from '../components/ui';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { estudianteActual } = useAuth();
  const { user } = useSelector((state) => state.auth);
  const { list: sesionesList } = useSelector((state) => state.sesiones);
  const [estudianteInfo, setEstudianteInfo] = useState(null);
  const [analisisAcademico, setAnalisisAcademico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carreraFiltro, setCarreraFiltro] = useState(null);

  // Cargar datos del estudiante actual
  useEffect(() => {
    const loadStudentData = async () => {
      if (!estudianteActual?.id) return;
      
      try {
        setLoading(true);
        const [estudianteData, analisis] = await Promise.all([
          EstudianteService.obtenerEstudiante(estudianteActual.id),
          EstudianteService.obtenerAsistenteAcademico(estudianteActual.id, { modo: 'intercalado' })
        ]);
        
        // Procesar datos del estudiante
        const estudianteInfo = {
          ...estudianteData.data,
          ...estudianteData.data.usuario,
          carreras: estudianteData.data.carreras
        };
        
        setEstudianteInfo(estudianteInfo);
        setAnalisisAcademico(analisis.data);
        if (carreraFiltro === null && analisis.data.carrerasSeleccionadas?.length > 0) {
          setCarreraFiltro(analisis.data.carrerasSeleccionadas[0].nombre);
        }
        
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

  const saludo = useMemo(() => {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buen día';
    if (hora < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  }, []);

  if (esAdmin) {
    return (
      <PageTransition>
        <PageContainer maxWidth={1200}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
              borderRadius: 4,
              mb: 4,
              color: 'white',
              overflow: 'visible',
            }}
            elevation={0}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" alignItems="center" spacing={3}>
                <Avatar
                  sx={{ width: 90, height: 90, bgcolor: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)' }}
                >
                  <AdminPanelSettings sx={{ fontSize: 50 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    ¡Hola, {user?.nombre || 'Admin Inicial'}!
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                    Panel de administración del sistema
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <SectionCard
                title="Usuarios"
                subtitle="Gestionar cuentas"
                action={
                  <IconButton size="small" onClick={() => navigate('/admin/usuarios')}>
                    <ChevronRight />
                  </IconButton>
                }
              >
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Person sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Button variant="outlined" size="small" fullWidth onClick={() => navigate('/admin/usuarios')}>
                    Ir a Usuarios
                  </Button>
                </Box>
              </SectionCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SectionCard
                title="Académico"
                subtitle="Carreras y materias"
                action={
                  <IconButton size="small" onClick={() => navigate('/admin/academico')}>
                    <ChevronRight />
                  </IconButton>
                }
              >
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <School sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                  <Button variant="outlined" size="small" fullWidth onClick={() => navigate('/admin/academico')}>
                    Ir a Académico
                  </Button>
                </Box>
              </SectionCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SectionCard
                title="Moderación"
                subtitle="Denuncias y reportes"
                action={
                  <IconButton size="small" onClick={() => navigate('/admin/moderacion')}>
                    <ChevronRight />
                  </IconButton>
                }
              >
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Warning sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                  <Button variant="outlined" size="small" fullWidth onClick={() => navigate('/admin/moderacion')}>
                    Ir a Moderación
                  </Button>
                </Box>
              </SectionCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SectionCard
                title="Dashboard"
                subtitle="Estadísticas del sistema"
                action={
                  <IconButton size="small" onClick={() => navigate('/admin')}>
                    <ChevronRight />
                  </IconButton>
                }
              >
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Speed sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Button variant="outlined" size="small" fullWidth onClick={() => navigate('/admin')}>
                    Ver Dashboard
                  </Button>
                </Box>
              </SectionCard>
            </Grid>
          </Grid>
        </PageContainer>
      </PageTransition>
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

  // Calcular progreso basado en todas las carreras (intercalado)
  const todasLasMaterias = analisisAcademico?.materias || [];
  const carrerasConPlan = analisisAcademico?.carrerasSeleccionadas || [];

  const materiasCursandoList = todasLasMaterias.filter(m => m.estado === 'cursando');
  const materiasRegularizadasList = todasLasMaterias.filter(m => m.estado === 'regularizada');

  // Progreso filtrado por carrera seleccionada
  const materiasFiltradas = carreraFiltro
    ? todasLasMaterias.filter(m => m.carreras?.includes(carreraFiltro))
    : [];

  const aprobadasFilt = materiasFiltradas.filter(m => m.estado === 'aprobada').length;
  const regularizadasFilt = materiasFiltradas.filter(m => m.estado === 'regularizada').length;
  const cursandoFilt = materiasFiltradas.filter(m => m.estado === 'cursando').length;
  const totalFilt = materiasFiltradas.length;
  const progresoCarrera = totalFilt > 0 ? (aprobadasFilt / totalFilt) * 100 : 0;

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
    <PageTransition>
      <PageContainer maxWidth={1200}>
        {/* Header de Bienvenida con gradiente */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
            borderRadius: 4,
            mb: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
          elevation={0}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -80,
              left: '30%',
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
            }}
          />
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={3}>
              <Avatar
                src={estudianteInfo.avatarUrl || `https://ui-avatars.com/api/?name=${estudianteInfo.nombre}+${estudianteInfo.apellido}&background=random`}
                sx={{
                  width: 90,
                  height: 90,
                  border: '3px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {saludo}, {estudianteInfo.nombre}!
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={0.5} alignItems="center">
                  {estudianteInfo.carreras?.length > 0 ? (
                    estudianteInfo.carreras.map((c, i) => (
                      <Chip
                        key={i}
                        label={c.nombre}
                        size="small"
                        icon={<School sx={{ fontSize: 14 }} />}
                        variant="outlined"
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.5)',
                          fontWeight: 500,
                          '& .MuiChip-icon': { color: 'rgba(255,255,255,0.7)' },
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                      Estudiante
                    </Typography>
                  )}
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Selector de Carrera */}
        {carrerasConPlan.length > 1 && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {carrerasConPlan.map((c) => (
                <Chip
                  key={c.id}
                  label={c.nombre}
                  size="medium"
                  variant={carreraFiltro === c.nombre ? 'filled' : 'outlined'}
                  color={carreraFiltro === c.nombre ? 'primary' : 'default'}
                  onClick={() => setCarreraFiltro(c.nombre)}
                  sx={{ fontWeight: carreraFiltro === c.nombre ? 700 : 400 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Métricas Rápidas con estilo moderno */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <SectionCard hoverable sx={{ cursor: 'pointer' }}>
              <Box sx={{ textAlign: 'center', py: 1 }} onClick={() => navigate('/academico/mis-materias', { state: { tabIndex: 1 } })}>
                <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
                  <CheckCircle sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {aprobadasFilt}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Aprobadas
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  de {totalFilt} totales
                </Typography>
              </Box>
            </SectionCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SectionCard hoverable sx={{ cursor: 'pointer' }}>
              <Box sx={{ textAlign: 'center', py: 1 }} onClick={() => navigate('/academico/mis-materias', { state: { tabIndex: 3 } })}>
                <Avatar sx={{ bgcolor: 'info.light', width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
                  <PlayArrow sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {cursandoFilt}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Cursando
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  materias este cuatrimestre
                </Typography>
              </Box>
            </SectionCard>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <SectionCard hoverable sx={{ cursor: 'pointer' }}>
              <Box sx={{ textAlign: 'center', py: 1 }} onClick={() => navigate('/academico/mis-materias', { state: { tabIndex: 2 } })}>
                <Avatar sx={{ bgcolor: 'warning.light', width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
                  <Warning sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {regularizadasFilt}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Regularizadas
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  con final pendiente
                </Typography>
              </Box>
            </SectionCard>
          </Grid>
        </Grid>

        <Grid container spacing={3} alignItems="stretch">
          {/* Mi Cursada Actual */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <SectionCard
              sx={{ flex: 1 }}
              title="Mi Cursada Actual"
              subtitle="1er Cuatrimestre 2026"
              headerColor="rgba(2, 136, 209, 0.06)"
              action={
                <Button size="small" onClick={() => navigate('/academico/mis-materias')} endIcon={<ChevronRight />}>
                  Ver todo
                </Button>
              }
            >
              {materiasCursandoList.length === 0 && materiasRegularizadasList.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Assignment sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">
                    No tenés materias cargadas todavía
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => navigate('/academico/mis-materias')}
                    sx={{ mt: 1 }}
                  >
                    Cargar materias
                  </Button>
                </Box>
              ) : (
                <>
                  {materiasCursandoList.length > 0 && (
                    <List disablePadding>
                      {materiasCursandoList.map((materia, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,

                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'info.main' }}>
                              <PlayArrow sx={{ fontSize: 18 }} />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={materia.nombre}
                            primaryTypographyProps={{ fontWeight: 500, variant: 'body2' }}
                            secondary="Cursando"
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          <Chip label="Cursando" color="info" size="small" sx={{ fontWeight: 600 }} />
                        </ListItem>
                      ))}
                    </List>
                  )}

                  {materiasRegularizadasList.length > 0 && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="caption" color="warning.main" sx={{ px: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Warning fontSize="inherit" />
                        MATERIAS REGULARIZADAS
                      </Typography>
                      <List disablePadding>
                        {materiasRegularizadasList.map((materia, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              borderRadius: 2,
                              mb: 0.5,
  
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.main' }}>
                                <Warning sx={{ fontSize: 18 }} />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={materia.nombre}
                              primaryTypographyProps={{ fontWeight: 500, variant: 'body2' }}
                              secondary={`Vence: ${materia.vencimiento || 'No especificado'}`}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </>
              )}
            </SectionCard>
          </Grid>

          {/* Próximas Fechas Importantes */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <SectionCard
              sx={{ flex: 1 }}
              title="Próximas Fechas"
              subtitle="Eventos y sesiones próximas"
              headerColor="rgba(237, 108, 2, 0.06)"
              action={
                <Button size="small" onClick={() => navigate('/sesiones')} endIcon={<ChevronRight />}>
                  Ver todo
                </Button>
              }
            >
              {proximasFechas.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CalendarToday sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">
                    No hay eventos próximos
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {proximasFechas.map((fecha, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: fecha.tipo === 'periodo' ? 'info.main' : 'primary.main',
                          }}
                        >
                          {getEventIcon(fecha.tipo)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={fecha.evento}
                        primaryTypographyProps={{ fontWeight: 500, variant: 'body2' }}
                        secondary={fecha.fecha}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      {fecha.materia && (
                        <Chip label={fecha.materia} size="small" variant="outlined" sx={{ ml: 1 }} />
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </SectionCard>
          </Grid>

          {/* Progreso de Carrera */}
          <Grid item xs={12}>
            <SectionCard
              title="Progreso de Carrera"
              subtitle={carreraFiltro}
              headerColor="rgba(46, 125, 50, 0.06)"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progresoCarrera}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 6,
                          background: progresoCarrera > 50
                            ? 'linear-gradient(90deg, #4caf50, #2e7d32)'
                            : 'linear-gradient(90deg, #ff9800, #ed6c02)',
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', minWidth: 50, textAlign: 'right' }}>
                    {Math.round(progresoCarrera)}%
                  </Typography>
                </Box>
                <Stack direction="row" spacing={3} justifyContent="center">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{aprobadasFilt}</Typography>
                    <Typography variant="caption" color="text.secondary">Aprobadas</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>{regularizadasFilt}</Typography>
                    <Typography variant="caption" color="text.secondary">Regularizadas</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>{cursandoFilt}</Typography>
                    <Typography variant="caption" color="text.secondary">Cursando</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary' }}>{totalFilt}</Typography>
                    <Typography variant="caption" color="text.secondary">Totales</Typography>
                  </Box>
                </Stack>
            </SectionCard>
          </Grid>
        </Grid>

      </PageContainer>
    </PageTransition>
  );
};

export default Home;