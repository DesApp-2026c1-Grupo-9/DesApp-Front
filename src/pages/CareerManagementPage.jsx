import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import { School, ExpandMore, Business, Schedule, Assignment } from '@mui/icons-material';
import { PageContainer } from '../components/ui';
import api from '../api/axiosConfig';

export function CareerManagementPage() {
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/api/carreras', { params: { limit: 100 } });
        setCarreras(res.data.data || []);
      } catch (err) {
        console.error('Error al cargar carreras:', err);
        setError('No se pudieron cargar las carreras. Verifique la conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchCarreras();
  }, []);

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
    </PageContainer>
  );
}
