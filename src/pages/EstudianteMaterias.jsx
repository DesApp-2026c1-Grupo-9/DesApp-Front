import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  Alert, Tabs, Tab, Grid, Avatar, ButtonGroup,
  Select, MenuItem, FormControl, Dialog, DialogActions, Menu,
  DialogContent, DialogContentText, DialogTitle, List, ListItem,
  ListItemText, ListItemIcon, Tooltip, CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Book as BookIcon,
  AutoAwesome as AutoAwesomeIcon,
  UploadFile as UploadFileIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';

import { PageContainer, LoadingSpinner, EmptyState } from '../components/ui';

export const EstudianteMaterias = () => {
  const navigate = useNavigate();
  const { estudianteActual, loading: authLoading } = useAuth();
  const [estudiante, setEstudiante] = useState(null);
  const [situacionAcademica, setSituacionAcademica] = useState(null);
  const [carrerasDisponibles, setCarrerasDisponibles] = useState([]);
  const [carreraSeleccionadaId, setCarreraSeleccionadaId] = useState('');
  const [anchorCarreraEl, setAnchorCarreraEl] = useState(null);
  const [planesDisponibles, setPlanesDisponibles] = useState([]);
  const [planSeleccionadoId, setPlanSeleccionadoId] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para importar Excel
  const [dialogImport, setDialogImport] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResultado, setImportResultado] = useState(null);
  const [importError, setImportError] = useState(null);
  const inicializado = useRef(false);

  // Estados para manejar conflictos de correlatividades
  const [dialogoConflicto, setDialogoConflicto] = useState({ 
    abierto: false, 
    materia: null, 
    nuevoEstado: null,
    materiasAfectadas: [],
    mensaje: ''
  });

  const [dialogoPrerrequisitos, setDialogoPrerrequisitos] = useState({
    abierto: false,
    materiaNombre: '',
    prerequisitosIncumplidos: [],
    accion: ''
  });

  const transformarMateriaBackend = (materia, anio) => ({
    id: materia.id,
    nombre: materia.nombre,
    anio: parseInt(anio),
    cargaHoraria: materia.cargaHoraria || 0,
    profundidad: materia.profundidad,
    tipo: materia.tipo || 'cuatrimestral',
    estado:
      materia.estado === 'aprobada'
        ? 'Aprobada'
        : materia.estado === 'regularizada'
          ? 'Regularizada'
          : materia.estado === 'cursando'
            ? 'Cursando'
            : materia.estado === 'no_cursada' && materia.disponible
              ? 'Disponible'
              : 'No Disponible',
    disponible: materia.disponible !== false,
    prerrequisitos: materia.prerrequisitos || []
  });

  const ordenarMateriasParaVista = (materias) => {
    return [...materias].sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;

      const profundidadA = Number.isFinite(a.profundidad) ? a.profundidad : 0;
      const profundidadB = Number.isFinite(b.profundidad) ? b.profundidad : 0;

      if (profundidadA !== profundidadB) return profundidadA - profundidadB;

      return a.nombre.localeCompare(b.nombre);
    });
  };

  const reconstruirSituacionAcademica = (data) => {
    const todasLasMaterias = [];
    const materiasPorAnio = data.materiasPorAnio || {};

    Object.keys(materiasPorAnio).forEach((anio) => {
      const materiasDelAnio = materiasPorAnio[anio].map((materia) =>
        transformarMateriaBackend(materia, anio)
      );
      todasLasMaterias.push(...materiasDelAnio);
    });

    const materiasOrdenadas = ordenarMateriasParaVista(todasLasMaterias);

    return {
      materias: materiasOrdenadas,
      resumen: data.resumen || {},
      carrera: data.carrera,
      planDeEstudio: data.planDeEstudio
    };
  };

  const obtenerAccionEstado = (estado) => {
    switch (estado) {
      case 'Aprobada':
        return 'aprobar';
      case 'Regularizada':
        return 'regularizar';
      case 'Cursando':
        return 'cursar';
      default:
        return 'actualizar';
    }
  };

  const obtenerTooltipEstado = (materia) => {
    switch (materia.estado) {
      case 'Aprobada':
        return 'Materia finalizada y aprobada.';
      case 'Regularizada':
        return 'Materia cursada y regularizada. Falta rendir el final.';
      case 'Cursando':
        return 'Materia actualmente en curso.';
      case 'Disponible':
        return 'Cumple correlativas y puede marcarse como cursando.';
      case 'No Disponible': {
        const reqs = (materia.prerrequisitos || []).map((p) => p.nombre);
        return reqs.length > 0
          ? `Necesitás aprobar o regularizar: ${reqs.join(', ')}.`
          : 'No cumple las correlativas necesarias.';
      }
      default:
        return 'Estado académico de la materia.';
    }
  };

  const obtenerOpcionesEstado = (materia) => {
    if (materia.estado === 'No Disponible') {
      return ['No Disponible'];
    }

    return ['Disponible', 'Cursando', 'Regularizada', 'Aprobada'];
  };

  const renderTablaMaterias = (materias) => {
    const materiasOrdenadas = ordenarMateriasParaVista(materias);
    const materiasPorAnio = materiasOrdenadas.reduce((acc, materia) => {
      if (!acc[materia.anio]) {
        acc[materia.anio] = [];
      }
      acc[materia.anio].push(materia);
      return acc;
    }, {});

    const aniosOrdenados = Object.keys(materiasPorAnio).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Materia</TableCell>
              <TableCell>Horas</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {aniosOrdenados.map((anio) => (
              <React.Fragment key={`anio-${anio}`}>
                <TableRow>
                  <TableCell colSpan={4} sx={{ bgcolor: 'grey.100' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {anio}° año
                    </Typography>
                    
                  </TableCell>
                </TableRow>

                {materiasPorAnio[anio].map((materia, index) => (
                  <TableRow key={materia.id || `${anio}-${index}`}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {obtenerIconoEstado(materia.estado)}
                        <Typography sx={{ ml: 1 }}>
                          {materia.nombre}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{materia.cargaHoraria || 0} hs</TableCell>
                    <TableCell>
                      <Tooltip title={obtenerTooltipEstado(materia)} arrow>
                        <Box component="span">
                          <Chip
                            label={materia.estado}
                            color={obtenerColorEstado(materia.estado)}
                            size="small"
                          />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={
                          materia.estado === 'No Disponible'
                            ? 'No podés cambiar este estado hasta cumplir correlativas.'
                            : 'Actualizá el estado académico de la materia.'
                        }
                        arrow
                      >
                        <Box component="span">
                          <FormControl size="small" sx={{ minWidth: 160 }}>
                            <Select
                              value={materia.estado}
                              disabled={materia.estado === 'No Disponible'}
                              onChange={(e) => {
                                const nuevoEstado = e.target.value;
                                handleCambiarEstadoMateria(materia.id, nuevoEstado);
                              }}
                              displayEmpty
                              sx={{
                                '& .MuiSelect-select': {
                                  py: 0.5,
                                  fontSize: '0.875rem'
                                }
                              }}
                            >
                              {obtenerOpcionesEstado(materia).map((estado) => (
                                <MenuItem key={`${materia.id}-${estado}`} value={estado}>
                                  {estado}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const cargarPlan = async (idEstudiante, idCarrera = null, idPlan = null) => {
    const response = await EstudianteService.obtenerPlanEstudios(
      idEstudiante,
      idCarrera || undefined,
      idPlan || undefined
    );

    if (response.data) {
      setEstudiante(response.data.estudiante);
      setSituacionAcademica(reconstruirSituacionAcademica(response.data));
      setCarrerasDisponibles(response.data.carrerasDisponibles || []);
      setPlanesDisponibles(response.data.planesDisponibles || []);
    }
  };

  // Reset plan al cambiar carrera
  useEffect(() => {
    setPlanSeleccionadoId('');
  }, [carreraSeleccionadaId]);

  // Carga inicial al cambiar de estudiante
  useEffect(() => {
    inicializado.current = false;
    if (!estudianteActual?.id) {
      setEstudiante(null);
      setSituacionAcademica(null);
      setCarrerasDisponibles([]);
      setCarreraSeleccionadaId('');
      setPlanesDisponibles([]);
      setPlanSeleccionadoId('');
      setError(null);
      setLoading(false);
      return;
    }

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await EstudianteService.obtenerPlanEstudios(estudianteActual.id);
        if (response.data) {
          setEstudiante(response.data.estudiante);
          setSituacionAcademica(reconstruirSituacionAcademica(response.data));
          setCarrerasDisponibles(response.data.carrerasDisponibles || []);
          setPlanesDisponibles(response.data.planesDisponibles || []);
          if (response.data.carrera?.id) setCarreraSeleccionadaId(String(response.data.carrera.id));
          if (response.data.planDeEstudio?.id) setPlanSeleccionadoId(String(response.data.planDeEstudio.id));
        }
      } catch (errorCargar) {
        console.error('Error al cargar datos del estudiante:', errorCargar);
        setError('Error al cargar los datos del estudiante');
      } finally {
        setLoading(false);
        inicializado.current = true;
      }
    };
    init();
  }, [estudianteActual?.id]);

  // Recarga cuando el usuario cambia carrera/plan (skip initial trigger)
  useEffect(() => {
    if (!inicializado.current) return;
    if (!estudianteActual?.id || !carreraSeleccionadaId) return;

    const reload = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await EstudianteService.obtenerPlanEstudios(
          estudianteActual.id,
          carreraSeleccionadaId,
          planSeleccionadoId
        );
        if (response.data) {
          setEstudiante(response.data.estudiante);
          setSituacionAcademica(reconstruirSituacionAcademica(response.data));
          setPlanesDisponibles(response.data.planesDisponibles || []);
        }
      } catch (errorCargar) {
        console.error('Error al recargar datos:', errorCargar);
      } finally {
        setLoading(false);
      }
    };
    reload();
  }, [carreraSeleccionadaId, planSeleccionadoId]);

  // Función para cambiar el estado de una materia
  const handleCambiarEstadoMateria = async (materiaId, nuevoEstado, confirmarCascada = false) => {
    try {
      // Mapear estados de UI a estados de base de datos
      const estadoMapeado = mapearEstadoUIaDB(nuevoEstado);
      
      await EstudianteService.actualizarEstadoMateria(
        estudianteActual.id, 
        materiaId, 
        estadoMapeado,
        confirmarCascada,
        planSeleccionadoId || null
      );
      
      // Recargar los datos para reflejar el cambio
      await cargarPlan(
        estudianteActual.id,
        carreraSeleccionadaId || null,
        planSeleccionadoId || null
      );
      console.log(`Materia actualizada exitosamente: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error al actualizar materia:', error);
      
      // Manejar conflicto de correlatividades
      if (error.tipo === 'CONFLICTO_CORRELATIVIDADES') {
        setDialogoConflicto({
          abierto: true,
          materia: materiaId,
          nuevoEstado: nuevoEstado,
          materiasAfectadas: error.data.materiasAfectadas || [],
          mensaje: error.data.message
        });
      } 
      // Manejar prerrequisitos incumplidos
      else if (error.tipo === 'PRERREQUISITOS_INCUMPLIDOS') {
        const materiaNombre = situacionAcademica.materias.find(m => m.id === materiaId)?.nombre || 'Esta materia';
        
        setDialogoPrerrequisitos({
          abierto: true,
          materiaNombre: materiaNombre,
          prerequisitosIncumplidos: error.data.prerequisitosIncumplidos || [],
          accion: obtenerAccionEstado(nuevoEstado)
        });
      } else {
        setError(error.message || 'Error al actualizar el estado de la materia');
      }
    }
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'Aprobada': return 'success';
      case 'Regularizada': return 'warning';
      case 'Cursando': return 'info';
      case 'Disponible': return 'primary';
      case 'No Disponible': return 'error';
      default: return 'default';
    }
  };

  // Funciones para manejar el diálogo de conflicto de correlatividades
  const handleConfirmarCascada = async () => {
    try {
      setDialogoConflicto(prev => ({ ...prev, abierto: false }));
      
      // Reintentamos con confirmación de cascada
      await handleCambiarEstadoMateria(
        dialogoConflicto.materia, 
        dialogoConflicto.nuevoEstado, 
        true // confirmarCascada = true
      );
    } catch (error) {
      console.error('Error al aplicar cascada:', error);
      setError('Error al aplicar el cambio en cascada');
    }
  };

  const handleCancelarCambio = () => {
    setDialogoConflicto({ 
      abierto: false, 
      materia: null, 
      nuevoEstado: null,
      materiasAfectadas: [],
      mensaje: ''
    });
  };

  const handleCerrarPrerrequisitos = () => {
    setDialogoPrerrequisitos({
      abierto: false,
      materiaNombre: '',
      prerequisitosIncumplidos: [],
      accion: ''
    });
  };

  // --- Excel import ---
  const handleArchivoExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    setImportError(null);
    setImportResultado(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const materias = rows
        .map((row) => {
          const nombre = row['nombre'] || row['Nombre'] || row['NOMBRE'] || '';
          const estado = row['estado'] || row['Estado'] || row['ESTADO'] || '';
          return { nombre: String(nombre).trim(), estado: String(estado).trim().toLowerCase() };
        })
        .filter((r) => r.nombre);

      if (materias.length === 0) {
        setImportError('El archivo no tiene filas válidas. Asegurate de que tenga columnas "nombre" y "estado".');
        setImportLoading(false);
        return;
      }

      const result = await EstudianteService.importarMateriasDesdeExcel(
        estudianteActual.id,
        materias
      );
      setImportResultado(result);

      // Recargar datos
      await cargarPlan(
        estudianteActual.id,
        carreraSeleccionadaId || null,
        planSeleccionadoId || null
      );
    } catch (err) {
      setImportError(err.message);
    } finally {
      setImportLoading(false);
      e.target.value = '';
    }
  };
  // Mapear estados de UI a estados de base de datos
  const mapearEstadoUIaDB = (estadoUI) => {
    const mapeo = {
      'Aprobada': 'aprobada',
      'Regularizada': 'regularizada',
      'Cursando': 'cursando',
      'Disponible': 'no_cursada',
      'No Cursada': 'no_cursada'
    };
    return mapeo[estadoUI] || estadoUI.toLowerCase();
  };
  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'Aprobada': return <CheckCircleIcon fontSize="small" />;
      case 'Regularizada': return <ScheduleIcon fontSize="small" color="warning" />;
      case 'Cursando': return <ScheduleIcon fontSize="small" color="info" />;
      case 'Disponible': return <SchoolIcon fontSize="small" color="primary" />;
      default: return <SchoolIcon fontSize="small" />;
    }
  };

  const filtrarMateriasPorEstado = (estado) => {
    if (!situacionAcademica?.materias) return [];
    return situacionAcademica.materias.filter(m => m.estado === estado);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (authLoading || loading) {
    return (
      <PageContainer centered padding={3}>
        <LoadingSpinner message="Cargando información académica..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer padding={3}>
        <EmptyState
          title="Error al cargar"
          message={error}
          icon="error"
          actionLabel="Reintentar"
          onAction={() => window.location.reload()}
        />
      </PageContainer>
    );
  }

  if (!estudiante || !situacionAcademica) {
    return (
      <PageContainer padding={3}>
        <EmptyState
          title="Sin información"
          message="No se encontró información del estudiante"
          icon="inbox"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer padding={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Box flexGrow={1}>
          <Typography variant="h4">
            Materias de {estudiante?.nombre} {estudiante?.apellido}
          </Typography>
          {carrerasDisponibles.length > 0 ? (
            <>
              <Button
                onClick={(e) => setAnchorCarreraEl(e.currentTarget)}
                endIcon={<ExpandMoreIcon />}
                sx={{
                  mt: 0.5,
                  minWidth: 300,
                  justifyContent: 'space-between',
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  borderRadius: 1,
                  color: 'text.primary',
                  textTransform: 'none',
                  px: 1.5,
                  py: 0.8,
                  '&:hover': {
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                    <SchoolIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="body2" fontWeight="500">
                    {carrerasDisponibles.find((item) => String(item.id) === String(carreraSeleccionadaId))?.nombre ||
                      situacionAcademica?.carrera?.nombre ||
                      'Seleccionar carrera'}
                  </Typography>
                </Box>
              </Button>
              <Menu
                anchorEl={anchorCarreraEl}
                open={Boolean(anchorCarreraEl)}
                onClose={() => setAnchorCarreraEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{ sx: { mt: 1, minWidth: 300 } }}
              >
                {carrerasDisponibles.map((carrera) => (
                  <MenuItem
                    key={`selector-carrera-${carrera.id}`}
                    selected={String(carrera.id) === String(carreraSeleccionadaId)}
                    onClick={() => {
                      setCarreraSeleccionadaId(String(carrera.id));
                      setAnchorCarreraEl(null);
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                        <SchoolIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography>{carrera.nombre}</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <Typography variant="subtitle1" color="textSecondary">
              {situacionAcademica?.carrera?.nombre || 'Sin carrera asignada'}
            </Typography>
          )}
        </Box>

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={importLoading ? <CircularProgress size={16} /> : <UploadFileIcon />}
            onClick={() => setDialogImport(true)}
            disabled={importLoading}
          >
            Importar Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => navigate('/asistente')}
            color="secondary"
          >
            Asistente Académico
          </Button>
        </Box>
      </Box>

      {/* Resumen estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {situacionAcademica?.resumen?.aprobadas || 0}
              </Typography>
              <Typography variant="caption">Aprobadas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {situacionAcademica?.resumen?.regularizadas || 0}
              </Typography>
              <Typography variant="caption">Regularizadas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {situacionAcademica?.resumen?.cursando || filtrarMateriasPorEstado('Cursando').length}
              </Typography>
              <Typography variant="caption">Cursando</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {situacionAcademica?.resumen?.noCursadas || 0}
              </Typography>
              <Typography variant="caption">No Cursadas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {situacionAcademica?.resumen?.disponibles || 0}
              </Typography>
              <Typography variant="caption">Disponibles</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.secondary">
                {situacionAcademica?.resumen?.total || 0}
              </Typography>
              <Typography variant="caption">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Todas (${situacionAcademica?.materias?.length || 0})`} />
            <Tab label={`Aprobadas (${filtrarMateriasPorEstado('Aprobada').length})`} />
            <Tab label={`Regularizadas (${filtrarMateriasPorEstado('Regularizada').length})`} />
            <Tab label={`Cursando (${filtrarMateriasPorEstado('Cursando').length})`} />
            <Tab label={`Disponibles (${filtrarMateriasPorEstado('Disponible').length})`} />
            <Tab label={`No Disponibles (${filtrarMateriasPorEstado('No Disponible').length})`} />
          </Tabs>
        </Box>

        <CardContent>
          {tabValue === 0 && renderTablaMaterias(situacionAcademica?.materias || [])}
          {tabValue === 1 && renderTablaMaterias(filtrarMateriasPorEstado('Aprobada'))}
          {tabValue === 2 && renderTablaMaterias(filtrarMateriasPorEstado('Regularizada'))}
          {tabValue === 3 && renderTablaMaterias(filtrarMateriasPorEstado('Cursando'))}
          {tabValue === 4 && renderTablaMaterias(filtrarMateriasPorEstado('Disponible'))}
          {tabValue === 5 && renderTablaMaterias(filtrarMateriasPorEstado('No Disponible'))}

        </CardContent>
      </Card>

      {/* Diálogo de importación desde Excel */}
      <Dialog open={dialogImport} onClose={() => { setDialogImport(false); setImportResultado(null); setImportError(null); }} maxWidth="sm" fullWidth>
        <DialogTitle display="flex" alignItems="center" gap={1}>
          <UploadFileIcon /> Importar materias desde Excel
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            El archivo debe tener columnas <strong>nombre</strong> (nombre exacto de la materia) y <strong>estado</strong> (aprobada, regularizada o cursando).
          </Alert>
          <Button variant="outlined" component="label" startIcon={importLoading ? <CircularProgress size={16} /> : <UploadFileIcon />} disabled={importLoading} fullWidth>
            {importLoading ? 'Importando...' : 'Seleccionar archivo .xlsx'}
            <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleArchivoExcel} />
          </Button>
          {importError && <Alert severity="error" sx={{ mt: 2 }}>{importError}</Alert>}
          {importResultado && (
            <Box mt={2}>
              <Alert
                severity={
                  (importResultado.data?.resumen?.importadas || 0) > 0
                    ? (importResultado.data?.resumen?.errores || 0) > 0 ||
                      (importResultado.data?.resumen?.ignoradas || 0) > 0
                      ? 'warning'
                      : 'success'
                    : 'error'
                }
                sx={{ mb: 1 }}
              >
                {importResultado.message}
              </Alert>
              {importResultado.data?.ignoradas?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  {importResultado.data.ignoradas.length} filas ignoradas (estado inválido o nombre vacío)
                </Alert>
              )}
              {importResultado.data?.errores?.length > 0 && (
                <Alert severity="error">
                  {importResultado.data.errores.length} materias no encontradas:
                  <List dense>
                    {importResultado.data.errores.map((e, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemIcon><BookIcon fontSize="small" /></ListItemIcon>
                        <ListItemText primary={`"${e.fila.nombre}" — ${e.razon}`} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogImport(false); setImportResultado(null); setImportError(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para conflictos de correlatividades */}
      <Dialog 
        open={dialogoConflicto.abierto} 
        onClose={handleCancelarCambio}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Conflicto de Correlatividades
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            {dialogoConflicto.mensaje}
          </DialogContentText>
          
          {dialogoConflicto.materiasAfectadas.length > 0 && (
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                Materias que se verían afectadas:
              </Typography>
              <List>
                {dialogoConflicto.materiasAfectadas.map((materia) => (
                  <ListItem key={materia.id}>
                    <ListItemIcon>
                      <BookIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={materia.nombre}
                      secondary={`${materia.anio}° año - ${materia.cuatrimestre}° cuatrimestre`}
                    />
                  </ListItem>
                ))}
              </List>
              <Alert severity="info" sx={{ mt: 2 }}>
                Al confirmar, estas materias también cambiarán automáticamente su estado para mantener la coherencia académica.
              </Alert>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCancelarCambio}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmarCascada}
            variant="contained" 
            color="warning"
            startIcon={<WarningIcon />}
          >
            Confirmar Cambio en Cascada
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de información para prerrequisitos incumplidos */}
      <Dialog 
        open={dialogoPrerrequisitos.abierto} 
        onClose={handleCerrarPrerrequisitos}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="error" sx={{ mr: 1 }} />
            Prerrequisitos No Cumplidos
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            ❌ No se puede <strong>{dialogoPrerrequisitos.accion}</strong> la materia "<strong>{dialogoPrerrequisitos.materiaNombre}</strong>" porque faltan las siguientes correlativas:
          </DialogContentText>
          
          <Box mt={2}>
            <List>
              {dialogoPrerrequisitos.prerequisitosIncumplidos.map((prerrequisito, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <BookIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={prerrequisito}
                    secondary="Debe estar al menos regularizada"
                  />
                </ListItem>
              ))}
            </List>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Para poder {dialogoPrerrequisitos.accion} esta materia, primero debe aprobar o regularizar todas las materias correlativas listadas arriba.
            </Alert>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleCerrarPrerrequisitos}
            variant="contained" 
            color="primary"
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default EstudianteMaterias;