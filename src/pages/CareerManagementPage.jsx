import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, CircularProgress, Alert, Button, Stack, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { School, ExpandMore, Business, Schedule, Assignment } from '@mui/icons-material';
import { PageContainer } from '../components/ui';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import EstudianteService from '../services/EstudianteService';

export function CareerManagementPage() {
  const { estudianteActual } = useAuth();
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carrerasEstudiante, setCarrerasEstudiante] = useState([]);
  const [inscripcionFeedback, setInscripcionFeedback] = useState(null);
  const [inscripcionLoadingId, setInscripcionLoadingId] = useState(null);
  const [elegibilidad, setElegibilidad] = useState(null);
  const [dialogBaja, setDialogBaja] = useState({
    abierto: false,
    carreraId: null,
    carreraNombre: '',
  });
  const [bajaLoading, setBajaLoading] = useState(false);

  const estudianteId = estudianteActual?.id;

  const cargarCarrerasEstudiante = async () => {
    if (!estudianteId) {
      setCarrerasEstudiante([]);
      return;
    }

    try {
      const response = await EstudianteService.obtenerEstudiante(estudianteId);
      setCarrerasEstudiante(response?.data?.carreras || []);
    } catch {
      setCarrerasEstudiante(estudianteActual?.carreras || []);
    }
  };

  const cargarElegibilidad = async () => {
    if (!estudianteId) {
      setElegibilidad(null);
      return;
    }

    try {
      const response = await EstudianteService.obtenerElegibilidadInscripcion(
        estudianteId
      );
      setElegibilidad(response?.data || null);
    } catch {
      setElegibilidad(null);
    }
  };

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/api/carreras', { params: { limit: 100 } });
        setCarreras(res.data.data || []);
        await cargarCarrerasEstudiante();
        await cargarElegibilidad();
      } catch (err) {
        console.error('Error al cargar carreras:', err);
        setError('No se pudieron cargar las carreras. Verifique la conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchCarreras();
  }, [estudianteId]);

  const getEstadoPlanColor = (estado) => {
    switch (estado) {
      case 'vigente': return 'success';
      case 'transición': return 'warning';
      case 'discontinuado': return 'error';
      default: return 'default';
    }
  };

  const totalCarreras = carreras.length;
  const totalPlanes = carreras.reduce((total, carrera) => total + (carrera.planesEstudio?.length || 0), 0);
  const planesVigentes = carreras.reduce((total, carrera) =>
    total + (carrera.planesEstudio?.filter(plan => plan.estado === 'vigente').length || 0), 0
  );
  const alcanzoMaximoCarreras = carrerasEstudiante.length >= 2;
  const puedeInscribirseSegunRegla = elegibilidad?.puedeInscribirse ?? !alcanzoMaximoCarreras;
  const esTecnicatura = (carrera) =>
    /tecnicatura/i.test(`${carrera?.nombre || ''} ${carrera?.titulo || ''}`);
  const carreraBaseActual = carrerasEstudiante[0] || null;
  const puedeInscribirseEnCarrera = (carrera) => {
    if (estaInscripto(carrera.id) || alcanzoMaximoCarreras) {
      return false;
    }

    if (carrerasEstudiante.length === 0) {
      return true;
    }

    if (carrerasEstudiante.length === 1) {
      const baseEsTecnicatura = esTecnicatura(carreraBaseActual);
      const destinoEsTecnicatura = esTecnicatura(carrera);

      if (!baseEsTecnicatura && destinoEsTecnicatura) {
        return true;
      }

      if (baseEsTecnicatura && destinoEsTecnicatura) {
        return (elegibilidad?.porcentajeCarreraActual ?? 0) > 50;
      }

      return (elegibilidad?.porcentajeCarreraActual ?? 0) > 60;
    }

    return false;
  };
  const bloquearInscripcion = (carrera) => !puedeInscribirseEnCarrera(carrera);

  const estaInscripto = (carreraId) =>
    carrerasEstudiante.some((carrera) => Number(carrera.id) === Number(carreraId));

  const handleInscribirse = async (carreraId) => {
    if (!estudianteId) return;

    try {
      setInscripcionFeedback(null);
      setInscripcionLoadingId(carreraId);

      const response = await EstudianteService.inscribirEnCarrera(estudianteId, carreraId);
      setInscripcionFeedback({
        severity: 'success',
        message: response?.message || 'Inscripción completada correctamente.',
      });
      await cargarCarrerasEstudiante();
      await cargarElegibilidad();
    } catch (inscribirError) {
      setInscripcionFeedback({
        severity: 'error',
        message: inscribirError.message || 'No se pudo completar la inscripción.',
      });
    } finally {
      setInscripcionLoadingId(null);
    }
  };

  const abrirDialogoBaja = (carrera) => {
    setDialogBaja({
      abierto: true,
      carreraId: carrera.id,
      carreraNombre: carrera.nombre,
    });
  };

  const cerrarDialogoBaja = () => {
    setDialogBaja({
      abierto: false,
      carreraId: null,
      carreraNombre: '',
    });
  };

  const confirmarBajaCarrera = async () => {
    if (!estudianteId || !dialogBaja.carreraId) return;

    try {
      setBajaLoading(true);
      setInscripcionFeedback(null);

      const response = await EstudianteService.darDeBajaCarrera(
        estudianteId,
        dialogBaja.carreraId
      );

      setInscripcionFeedback({
        severity: 'success',
        message: response?.message || 'Se dio de baja la carrera correctamente.',
      });

      await cargarCarrerasEstudiante();
      await cargarElegibilidad();
      cerrarDialogoBaja();
    } catch (bajaError) {
      setInscripcionFeedback({
        severity: 'error',
        message: bajaError.message || 'No se pudo dar de baja la carrera.',
      });
    } finally {
      setBajaLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth={1200}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer maxWidth={1200}>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1200}>
      <Box sx={{ mb: 3, pt: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          Gestión de Carreras y Planes de Estudio
        </Typography>
      </Box>

      {inscripcionFeedback && (
        <Alert severity={inscripcionFeedback.severity} sx={{ mb: 3 }}>
          {inscripcionFeedback.message}
        </Alert>
      )}

      {alcanzoMaximoCarreras && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Ya alcanzaste el máximo permitido de 2 carreras.
        </Alert>
      )}

      {!alcanzoMaximoCarreras && elegibilidad && !elegibilidad.puedeInscribirse && !(
        carrerasEstudiante.length === 1 && carreraBaseActual && !esTecnicatura(carreraBaseActual)
      ) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {elegibilidad.message}
        </Alert>
      )}

      <Card sx={{ mb: 3, '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mi inscripción a carreras
          </Typography>

          {carrerasEstudiante.length === 0 ? (
            <Alert severity="info">
              Todavía no estás inscripto en ninguna carrera. Seleccioná una de la lista para anotarte.
            </Alert>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {carrerasEstudiante.map((carrera) => (
                <Box key={`carrera-est-${carrera.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={carrera.nombre}
                    color="primary"
                    variant="filled"
                  />
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    onClick={() => abrirDialogoBaja(carrera)}
                    disabled={carrerasEstudiante.length <= 1}
                  >
                    Dar de baja
                  </Button>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Resumen General */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{totalCarreras}</Typography>
              <Typography variant="body1">Carreras Total</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText', '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{totalPlanes}</Typography>
              <Typography variant="body1">Planes de Estudio</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText', '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{planesVigentes}</Typography>
              <Typography variant="body1">Planes Vigentes</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de Carreras */}
      <Card sx={{ '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Carreras Disponibles
          </Typography>

          {carreras.map((carrera) => (
            <Accordion key={carrera.id} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`panel-${carrera.id}-content`}
                id={`panel-${carrera.id}-header`}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {carrera.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <Business sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    {carrera.instituto} • Duración: {carrera.duracion} años
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                  {estaInscripto(carrera.id) ? (
                    <Chip size="small" color="success" label="Inscripto" />
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleInscribirse(carrera.id);
                      }}
                      disabled={
                        inscripcionLoadingId === carrera.id || bloquearInscripcion(carrera)
                      }
                    >
                      {inscripcionLoadingId === carrera.id ? 'Inscribiendo...' : 'Inscribirme'}
                    </Button>
                  )}
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Información General */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Información General
                    </Typography>

                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Título que otorga"
                          secondary={carrera.titulo}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Instituto"
                          secondary={carrera.instituto}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Duración estimada"
                          secondary={`${carrera.duracion} años`}
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  {/* Planes de Estudio */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Planes de Estudio
                    </Typography>

                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Plan</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="center">Materias</TableCell>
                            <TableCell align="center">Carga Horaria</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(carrera.planesEstudio || []).map((plan) => (
                            <TableRow key={plan.id}>
                              <TableCell component="th" scope="row">
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {plan.nombre}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={plan.estado}
                                  color={getEstadoPlanColor(plan.estado)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">{plan.totalMaterias}</TableCell>
                              <TableCell align="center">{plan.cargaHoraria}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogBaja.abierto} onClose={cerrarDialogoBaja} maxWidth="xs" fullWidth>
        <DialogTitle>Confirmar baja de carrera</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`¿Estás seguro que querés darte de baja de ${dialogBaja.carreraNombre}? Esta acción puede impactar en tu plan académico.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogoBaja} disabled={bajaLoading}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmarBajaCarrera} disabled={bajaLoading}>
            {bajaLoading ? 'Dando de baja...' : 'Confirmar baja'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
