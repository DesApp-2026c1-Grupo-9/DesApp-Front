import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, Card, CardContent, Box, Grid, Chip, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Button, Divider, List, ListItem, ListItemText, ListItemIcon, IconButton} from '@mui/material';
import { School, CheckCircle, Schedule, Assignment, Grade, Refresh, AccountCircle, Email,} from '@mui/icons-material';

import {
  fetchDatosAcademicos,
  clearError,
  selectDatosAcademicos,
  selectAcademicoLoading,
  selectAcademicoError,
} from '../features/academico/slice';

const DashboardAcademicoCompleto = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const datosCompletos = useSelector(selectDatosAcademicos);
  const loading = useSelector(selectAcademicoLoading);
  const error = useSelector(selectAcademicoError);

  // Usar el usuario autenticado como estudiante actual
  const estudianteId = user?.id;

  useEffect(() => {
    if (estudianteId) {
      dispatch(fetchDatosAcademicos(estudianteId));
    }
  }, [dispatch, estudianteId]);

  const handleRefresh = () => {
    if (estudianteId) {
      dispatch(clearError());
      dispatch(fetchDatosAcademicos(estudianteId));
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 6 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando información académica...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Reintentar
            </Button>
          }
        >
          <Typography variant="subtitle1">Error de Conexión</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Container>
    );
  }

  if (!datosCompletos) {
    return (
      <Container sx={{ py: 6 }}>
        <Box textAlign="center">
          <Typography variant="h6" color="text.secondary">
            No se encontraron datos del estudiante
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleRefresh}
            startIcon={<Refresh />}
            sx={{ mt: 2 }}
          >
            Cargar datos
          </Button>
        </Box>
      </Container>
    );
  }

  const { dashboard, situacion, finales, creditos, resumen } = datosCompletos;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header del Dashboard */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
            Dashboard Académico Completo
          </Typography>
          
          {dashboard?.estudiante && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <AccountCircle />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2" fontWeight="600">
                  {dashboard.estudiante.nombre} {dashboard.estudiante.apellido}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Email sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {dashboard.estudiante.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Resumen Rápido */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Aprobadas
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {resumen?.materiasAprobadas || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Grade sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Regularizadas
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {resumen?.materiasRegularizadas || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Cursando
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {resumen?.materiasCursando || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Créditos Totales
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {resumen?.totalCreditos || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Situación Académica */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
            📚 Situación Académica por Materia
          </Typography>
          
          {situacion?.situaciones?.length > 0 ? (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Materia</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Nota</strong></TableCell>
                    <TableCell><strong>Fecha</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {situacion.situaciones.map((materia, index) => (
                    <TableRow key={index} hover>
                      <TableCell component="th" scope="row">
                        <Typography fontWeight="500">{materia.materia}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={materia.estado}
                          size="small"
                          color={
                            materia.estado === 'aprobada' ? 'success' :
                            materia.estado === 'regularizada' ? 'warning' :
                            materia.estado === 'cursada' ? 'info' :
                            'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{materia.nota || 'N/A'}</TableCell>
                      <TableCell>
                        {materia.fechaAprobacion || materia.fechaRegularidad || materia.fechaCursada || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={6}>
              <Typography variant="body1" color="text.secondary">
                No hay situaciones académicas registradas
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Historial de Finales */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
            📝 Historial de Finales ({resumen?.totalFinales || 0} intentos)
          </Typography>
          
          {finales?.intentos?.length > 0 ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {finales.intentos.map((intento, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h3" fontWeight="600">
                          {intento.materia}
                        </Typography>
                        <Chip
                          label={intento.resultado}
                          size="small"
                          color={
                            intento.resultado === 'aprobado' ? 'success' :
                            intento.resultado === 'desaprobado' ? 'error' :
                            'default'
                          }
                          variant="filled"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Fecha:</strong> {intento.fecha}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Nota:</strong> {intento.nota || 'N/A'}
                      </Typography>
                      {intento.observaciones && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                          {intento.observaciones}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={6}>
              <Typography variant="body1" color="text.secondary">
                No hay intentos de finales registrados
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Actividades de Créditos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
            🏆 Actividades de Créditos ({creditos?.resumen?.total || 0} actividades)
          </Typography>
          
          {creditos?.resumen && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="body1" gutterBottom>
                <strong>Créditos Totales:</strong> {creditos.resumen.totalCreditos || 0}
              </Typography>
              <Typography variant="body1">
                <strong>Actividades Aprobadas:</strong> {creditos.resumen.aprobadas || 0}
              </Typography>
            </Paper>
          )}
          
          {creditos?.actividades?.length > 0 ? (
            <List>
              {creditos.actividades.map((actividad, index) => (
                <Box key={index}>
                  <ListItem
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 2,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Assignment color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" component="h3" fontWeight="600">
                            {actividad.nombre}
                          </Typography>
                          <Chip
                            label={actividad.estado}
                            size="small"
                            color={
                              actividad.estado === 'aprobado' ? 'success' :
                              actividad.estado === 'pendiente' ? 'warning' :
                              'error'
                            }
                            variant="filled"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {actividad.descripcion}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Tipo:</strong> {actividad.tipo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Créditos:</strong> {actividad.creditosOtorgados || 0}
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={6}>
              <Typography variant="body1" color="text.secondary">
                No hay actividades de créditos registradas
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Botón de Actualizar */}
      <Box textAlign="center" sx={{ mt: 4 }}>
        <Button 
          variant="contained" 
          size="large"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          sx={{ px: 4, py: 1.5 }}
        >
          Actualizar Datos
        </Button>
      </Box>
    </Container>
  );
};

export default DashboardAcademicoCompleto;