import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Card, CardContent, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip, 
  Alert, CircularProgress, Tabs, Tab, Grid, Avatar, ButtonGroup, 
  Select, MenuItem, FormControl, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle, List, ListItem, 
  ListItemText, ListItemIcon 
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Book as BookIcon
} from '@mui/icons-material';
import EstudianteService from '../services/EstudianteService';
import { useAuth } from '../context/AuthContext';

export const EstudianteMaterias = () => {
  const navigate = useNavigate();
  const { estudianteActual, loading: authLoading } = useAuth();
  const [estudiante, setEstudiante] = useState(null);
  const [situacionAcademica, setSituacionAcademica] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  useEffect(() => {
    const cargarDatos = async () => {
      if (!estudianteActual?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Cargar datos del plan de materias desde el backend
        const response = await EstudianteService.obtenerPlanEstudios(estudianteActual.id);
        
        if (response.data) {
          setEstudiante(response.data.estudiante);
          
          // Procesar las materias del backend
          const todasLasMaterias = [];
          const materiasPorAnio = response.data.materiasPorAnio || {};
          
          // Convertir la estructura del backend a la del frontend
          Object.keys(materiasPorAnio).forEach(anio => {
            const materiasDelAnio = materiasPorAnio[anio].map(materia => ({
              id: materia.id,
              nombre: materia.nombre,
              anio: parseInt(anio),
              tipo: materia.tipo || 'cuatrimestral',
              // Mapear estados del backend al frontend
              estado: materia.estado === 'aprobada' ? 'Aprobada' :
                      materia.estado === 'regularizada' ? 'Regularizada' :
                      materia.estado === 'no_cursada' ? 'Disponible' : 'Disponible',
              disponible: materia.disponible !== false, // Por defecto disponible
              prerrequisitos: materia.prerrequisitos || []
            }));
            
            todasLasMaterias.push(...materiasDelAnio);
          });
          
          setSituacionAcademica({
            materias: todasLasMaterias,
            resumen: response.data.resumen || {},
            carrera: response.data.carrera,
            planDeEstudio: response.data.planDeEstudio
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del estudiante:', error);
        setError('Error al cargar los datos del estudiante');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [estudianteActual?.id]);

  // Función para cambiar el estado de una materia
  const handleCambiarEstadoMateria = async (materiaId, nuevoEstado, confirmarCascada = false) => {
    try {
      // Mapear estados de UI a estados de base de datos
      const estadoMapeado = mapearEstadoUIaDB(nuevoEstado);
      
      await EstudianteService.actualizarEstadoMateria(
        estudianteActual.id, 
        materiaId, 
        estadoMapeado,
        confirmarCascada
      );
      
      // Recargar los datos para reflejar el cambio
      const response = await EstudianteService.obtenerPlanEstudios(estudianteActual.id);
      if (response.data) {
        const todasLasMaterias = [];
        const materiasPorAnio = response.data.materiasPorAnio || {};
        
        Object.keys(materiasPorAnio).forEach(anio => {
          const materiasDelAnio = materiasPorAnio[anio].map(materia => ({
            id: materia.id,
            nombre: materia.nombre,
            anio: parseInt(anio),
            tipo: materia.tipo || 'cuatrimestral',
            estado: materia.estado === 'aprobada' ? 'Aprobada' :
                    materia.estado === 'regularizada' ? 'Regularizada' :
                    materia.estado === 'no_cursada' ? 'Disponible' : 'Disponible',
            disponible: materia.disponible !== false,
            prerrequisitos: materia.prerrequisitos || []
          }));
          todasLasMaterias.push(...materiasDelAnio);
        });
        
        setSituacionAcademica({
          materias: todasLasMaterias,
          resumen: response.data.resumen || {},
          carrera: response.data.carrera,
          planDeEstudio: response.data.planDeEstudio
        });
        
        console.log(`Materia actualizada exitosamente: ${nuevoEstado}`);
      }
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
          accion: nuevoEstado === 'Aprobada' ? 'aprobar' : 'regularizar'
        });
      } else {
        setError('Error al actualizar el estado de la materia');
      }
    }
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'Aprobada': return 'success';
      case 'Regularizada': return 'warning';
      case 'Disponible': return 'primary';
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
  // Mapear estados de UI a estados de base de datos
  const mapearEstadoUIaDB = (estadoUI) => {
    const mapeo = {
      'Aprobada': 'aprobada',
      'Regularizada': 'regularizada', 
      'Disponible': 'no_cursada',
      'No Cursada': 'no_cursada'
    };
    return mapeo[estadoUI] || estadoUI.toLowerCase();
  };
  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'Aprobada': return <CheckCircleIcon fontSize="small" />;
      case 'Regularizada': return <ScheduleIcon fontSize="small" color="warning" />;
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
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/mi-perfil')}
          sx={{ mr: 2 }}
        >
          Mi Perfil
        </Button>
        <Box flexGrow={1}>
          <Typography variant="h4">
            Materias de {estudiante?.nombre} {estudiante?.apellido}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {situacionAcademica?.carrera?.nombre || 'Sin carrera asignada'}
          </Typography>
        </Box>
      </Box>

      {/* Resumen estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {situacionAcademica?.resumen?.aprobadas || 0}
              </Typography>
              <Typography variant="caption">Aprobadas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {situacionAcademica?.resumen?.regularizadas || 0}
              </Typography>
              <Typography variant="caption">Regularizadas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {situacionAcademica?.resumen?.noCursadas || 0}
              </Typography>
              <Typography variant="caption">No Cursadas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {situacionAcademica?.resumen?.disponibles || 0}
              </Typography>
              <Typography variant="caption">Disponibles</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={2.4}>
          <Card>
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
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`Todas (${situacionAcademica?.materias?.length || 0})`} />
            <Tab label={`Aprobadas (${filtrarMateriasPorEstado('Aprobada').length})`} />
            <Tab label={`Regularizadas (${filtrarMateriasPorEstado('Regularizada').length})`} />
            <Tab label={`Disponibles (${filtrarMateriasPorEstado('Disponible').length})`} />
            <Tab label={`No Disponibles (${filtrarMateriasPorEstado('No disponible').length})`} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Tab 0: Todas las materias */}
          {tabValue === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Materia</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {situacionAcademica?.materias?.map((materia, index) => (
                    <TableRow key={materia.id || index}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {obtenerIconoEstado(materia.estado)}
                          <Typography sx={{ ml: 1 }}>
                            {materia.nombre} ({materia.anio}° año)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={materia.estado}
                          color={obtenerColorEstado(materia.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={materia.estado}
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
                            <MenuItem value="Disponible">Disponible</MenuItem>
                            <MenuItem value="Regularizada">Regularizada</MenuItem>
                            <MenuItem value="Aprobada">Aprobada</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 1: Aprobadas */}
          {tabValue === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Materia</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrarMateriasPorEstado('Aprobada').map((materia, index) => (
                    <TableRow key={materia.id || index}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {obtenerIconoEstado(materia.estado)}
                          <Typography sx={{ ml: 1 }}>
                            {materia.nombre} ({materia.anio}° año)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={materia.estado}
                          color={obtenerColorEstado(materia.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={materia.estado}
                            onChange={(e) => {
                              const nuevoEstado = e.target.value;
                              handleCambiarEstadoMateria(materia.id, nuevoEstado);
                            }}
                            size="small"
                          >
                            <MenuItem value="Disponible">Disponible</MenuItem>
                            <MenuItem value="Regularizada">Regularizada</MenuItem>
                            <MenuItem value="Aprobada">Aprobada</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 2: Regularizadas */}
          {tabValue === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Materia</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrarMateriasPorEstado('Regularizada').map((materia, index) => (
                    <TableRow key={materia.id || index}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {obtenerIconoEstado(materia.estado)}
                          <Typography sx={{ ml: 1 }}>
                            {materia.nombre} ({materia.anio}° año)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Alert severity="warning" sx={{ py: 0 }}>
                          Regularizada - Debe rendir final
                        </Alert>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={materia.estado}
                            onChange={(e) => {
                              const nuevoEstado = e.target.value;
                              handleCambiarEstadoMateria(materia.id, nuevoEstado);
                            }}
                            size="small"
                          >
                            <MenuItem value="Disponible">Disponible</MenuItem>
                            <MenuItem value="Regularizada">Regularizada</MenuItem>
                            <MenuItem value="Aprobada">Aprobada</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 3: Disponibles */}
          {tabValue === 3 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Materia</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrarMateriasPorEstado('Disponible').map((materia, index) => (
                    <TableRow key={materia.id || index}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {obtenerIconoEstado(materia.estado)}
                          <Typography sx={{ ml: 1 }}>
                            {materia.nombre} ({materia.anio}° año)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Alert severity="success" sx={{ py: 0 }}>
                          Disponible para cursar
                        </Alert>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={materia.estado}
                            onChange={(e) => {
                              const nuevoEstado = e.target.value;
                              handleCambiarEstadoMateria(materia.id, nuevoEstado);
                            }}
                            size="small"
                          >
                            <MenuItem value="Disponible">Disponible</MenuItem>
                            <MenuItem value="Regularizada">Regularizada</MenuItem>
                            <MenuItem value="Aprobada">Aprobada</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 4: No Disponibles */}
          {tabValue === 4 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Materia</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtrarMateriasPorEstado('No disponible').map((materia, index) => (
                    <TableRow key={materia.id || index}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {obtenerIconoEstado(materia.estado)}
                          <Typography sx={{ ml: 1 }}>
                            {materia.nombre} ({materia.anio}° año)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Alert severity="info" sx={{ py: 0 }}>
                          Faltan correlativas
                        </Alert>
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={materia.estado}
                            onChange={(e) => {
                              const nuevoEstado = e.target.value;
                              handleCambiarEstadoMateria(materia.id, nuevoEstado);
                            }}
                            size="small"
                          >
                            <MenuItem value="Disponible">Disponible</MenuItem>
                            <MenuItem value="Regularizada">Regularizada</MenuItem>
                            <MenuItem value="Aprobada">Aprobada</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

        </CardContent>
      </Card>

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
    </Box>
  );
};

export default EstudianteMaterias;