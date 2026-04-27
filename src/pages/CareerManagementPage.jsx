import React, { useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Accordion, AccordionSummary,  AccordionDetails, List, ListItem, ListItemText, Divider} from '@mui/material';
import { School, ExpandMore, Business, Schedule, Assignment } from '@mui/icons-material';

export function CareerManagementPage() {
  // Mock data de carreras y planes de estudio
  const carreras = [
    {
      id: 1,
      nombre: 'Licenciatura en Informática',
      titulo: 'Licenciado/a en Informática',
      instituto: 'Instituto de Tecnología',
      duracionEstimada: 5,
      cargaHorariaTotal: 3520,
      planesEstudio: [
        {
          id: 1,
          nombre: 'Plan 2026',
          estado: 'Vigente',
          materias: 45,
          cargaHoraria: 3520
        }
      ]
    },
    {
      id: 2,
      nombre: 'Tecnicatura en Programación',
      titulo: 'Técnico/a Superior en Programación',
      instituto: 'Instituto de Tecnología',
      duracionEstimada: 2.5,
      creditosRequeridos: 35,
      cargaHorariaTotal: 1408,
      planesEstudio: [
        {
          id: 2,
          nombre: 'Plan 2026',
          estado: 'Vigente',
          materias: 19,
          cargaHoraria: 1408
        }
      ]
    },
    {
      id: 3,
      nombre: 'Tecnicatura en Inteligencia Artificial',
      titulo: 'Técnico/a Superior en Inteligencia Artificial',
      instituto: 'Instituto de Tecnología',
      duracionEstimada: 2.5,
      creditosRequeridos: 80,
      cargaHorariaTotal: 1472,
      planesEstudio: [
        {
          id: 3,
          nombre: 'Plan 2026',
          estado: 'Vigente',
          materias: 22,
          cargaHoraria: 1472
        }
      ]
    }
  ];

  const getEstadoPlanColor = (estado) => {
    switch (estado) {
      case 'Vigente': return 'success';
      case 'En transición': return 'warning';
      case 'Discontinuado': return 'error';
      default: return 'default';
    }
  };

  const totalCarreras = carreras.length;
  const totalPlanes = carreras.reduce((total, carrera) => total + carrera.planesEstudio.length, 0);
  const planesVigentes = carreras.reduce((total, carrera) => 
    total + carrera.planesEstudio.filter(plan => plan.estado === 'Vigente').length, 0
  );

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        <School sx={{ mr: 1, verticalAlign: 'middle' }} />
        Gestión de Carreras y Planes de Estudio
      </Typography>

      {/* Resumen General */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <School sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{totalCarreras}</Typography>
              <Typography variant="body1">Carreras Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{totalPlanes}</Typography>
              <Typography variant="body1">Planes de Estudio</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{planesVigentes}</Typography>
              <Typography variant="body1">Planes Vigentes</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de Carreras */}
      <Card>
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
                    {carrera.instituto} • Duración: {carrera.duracionEstimada} años
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
                          secondary={`${carrera.duracionEstimada} años`}
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
                          {carrera.planesEstudio.map((plan) => (
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
                              <TableCell align="center">{plan.materias}</TableCell>
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
    </Box>
  );
}