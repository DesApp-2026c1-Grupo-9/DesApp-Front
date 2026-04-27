import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, Divider, Alert, Grid, Accordion, AccordionSummary, AccordionDetails} from '@mui/material';
import { Psychology, School, CheckCircle, PlayArrow, ExpandMore, Timeline, TrendingUp} from '@mui/icons-material';
import { calcularMateriasDisponibles, simularEscenario, calcularEstadisticasProgreso, verificarCorrelatividades, ESTADOS_MATERIA} from '../services/AcademicService';

export function AcademicAnalysisComponent({ situacionAcademica, carrera }) {
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [dialogSimulacion, setDialogSimulacion] = useState(false);
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [resultadoSimulacion, setResultadoSimulacion] = useState(null);

  // Calcular datos al cargar el componente o cambiar la situación académica
  useEffect(() => {
    if (situacionAcademica && carrera) {
      const disponibles = calcularMateriasDisponibles(situacionAcademica, carrera);
      const stats = calcularEstadisticasProgreso(situacionAcademica, carrera);
      
      setMateriasDisponibles(disponibles);
      setEstadisticas(stats);
    }
  }, [situacionAcademica, carrera]);

  const handleSimulacion = () => {
    if (materiasSeleccionadas.length === 0) return;
    
    const resultado = simularEscenario(situacionAcademica, materiasSeleccionadas, carrera);
    setResultadoSimulacion(resultado);
  };

  const materiasEnCurso = situacionAcademica?.filter(m => m.estado === ESTADOS_MATERIA.CURSANDO) || [];

  return (
    <Box sx={{ mt: 3 }}>
      {/* Análisis de Situación Actual */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
            Análisis de Situación Académica
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Resumen General
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary={`Materias Aprobadas: ${estadisticas.aprobadas || 0}`}
                    secondary={`de ${estadisticas.totalMaterias || 0} total`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`Materias Regularizadas: ${estadisticas.regularizadas || 0}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`Cursando Actualmente: ${estadisticas.cursando || 0}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`Progreso de Carrera: ${Math.round(estadisticas.porcentajeAvance || 0)}%`}
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Materias Disponibles para Cursar
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Tienes <strong>{materiasDisponibles.length}</strong> materias disponibles para cursar
              </Alert>
              {materiasEnCurso.length > 0 && (
                <Alert severity="warning">
                  Estás cursando {materiasEnCurso.length} materia{materiasEnCurso.length > 1 ? 's' : ''}
                </Alert>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Materias Disponibles para Cursar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              <School sx={{ mr: 1, verticalAlign: 'middle' }} />
              Materias Disponibles ({materiasDisponibles.length})
            </Typography>
            {materiasDisponibles.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<Psychology />}
                onClick={() => setDialogSimulacion(true)}
              >
                Simular Escenario
              </Button>
            )}
          </Box>

          {materiasDisponibles.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Materia</TableCell>
                    <TableCell>Año</TableCell>
                    <TableCell>Cuatrimestre</TableCell>
                    <TableCell>Carga Horaria</TableCell>
                    <TableCell>Correlatividades</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materiasDisponibles.map((materia) => (
                    <TableRow key={materia.id}>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {materia.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>{materia.año}°</TableCell>
                      <TableCell>{materia.cuatrimestre}°</TableCell>
                      <TableCell>{materia.cargaHoraria}hs</TableCell>
                      <TableCell>
                        {materia.correlativas.length > 0 ? (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {materia.correlativas.map((correlativa, index) => (
                              <Chip
                                key={index}
                                label={correlativa}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Sin correlatividades
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              No hay materias disponibles para cursar en este momento. 
              Revisa tu situación académica o completa las correlatividades pendientes.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Progreso por Año */}
      {estadisticas.progresoPorAño && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Progreso por Año de Carrera
            </Typography>
            
            {Object.entries(estadisticas.progresoPorAño).map(([año, progreso]) => (
              <Accordion key={año} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      {año}° Año - {Math.round(progreso.porcentaje)}% completado
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {progreso.aprobadas + progreso.regularizadas} de {progreso.total}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="success.main">
                        ✓ Aprobadas: {progreso.aprobadas}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="warning.main">
                        Regularizadas: {progreso.regularizadas}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="error.main">
                        Faltantes: {progreso.faltantes}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total: {progreso.total}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dialog de Simulación */}
      <Dialog open={dialogSimulacion} onClose={() => setDialogSimulacion(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
          Simulador: "¿Qué pasa si...?"
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Selecciona las materias que regularizarías para ver qué materias se desbloquearían:
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Materias a regularizar</InputLabel>
            <Select
              multiple
              value={materiasSeleccionadas}
              label="Materias a regularizar"
              onChange={(e) => setMateriasSeleccionadas(e.target.value)}
            >
              {materiasEnCurso.map((materia) => (
                <MenuItem key={materia.nombre} value={materia.nombre}>
                  {materia.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={handleSimulacion}
            disabled={materiasSeleccionadas.length === 0}
            sx={{ mb: 3 }}
          >
            Ejecutar Simulación
          </Button>

          {resultadoSimulacion && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Resultado de la Simulación
              </Typography>
              
              <Alert severity={resultadoSimulacion.beneficio > 0 ? "success" : "info"} sx={{ mb: 2 }}>
                Se desbloquearían <strong>{resultadoSimulacion.beneficio}</strong> nuevas materias
              </Alert>

              {resultadoSimulacion.materiasDesbloqueadas.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Materias Desbloqueadas:
                  </Typography>
                  <List dense>
                    {resultadoSimulacion.materiasDesbloqueadas.map((materia, index) => (
                      <ListItem key={index}>
                        <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                        <ListItemText
                          primary={materia.nombre}
                          secondary={`${materia.año}° Año - ${materia.cuatrimestre}° Cuatrimestre`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogSimulacion(false);
            setResultadoSimulacion(null);
            setMateriasSeleccionadas([]);
          }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}