import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Button, Alert, Grid, Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { PageContainer, LoadingSpinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import EstudianteService from '../services/EstudianteService';

const estadoConfig = {
  aprobada: { label: 'Aprobada', color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
  regularizada: { label: 'Regularizada', color: 'warning', icon: <ScheduleIcon fontSize="small" /> },
  cursando: { label: 'Cursando', color: 'info', icon: <SchoolIcon fontSize="small" /> },
  no_cursada: { label: 'No cursada', color: 'default', icon: null },
};

export const MateriasVisitante = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { estudiantesDisponibles } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const estudianteMatch = estudiantesDisponibles.find(
          e => Number(e.usuario?.id) === Number(id)
        );
        if (!estudianteMatch) {
          setError('No se encontró el usuario solicitado');
          return;
        }
        const situacion = await EstudianteService.obtenerMateriasEstudiante(estudianteMatch.id);
        setData({
          estudiante: estudianteMatch.usuario,
          carrera: situacion.data?.carrera,
          planDeEstudio: situacion.data?.planDeEstudio,
          materiasPorAnio: situacion.data?.materiasPorAnio || {},
          resumen: situacion.data?.resumen || {},
        });
      } catch (err) {
        setError('Error al cargar las materias');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id, estudiantesDisponibles]);

  if (loading) return <PageContainer centered padding={3}><LoadingSpinner message="Cargando materias..." /></PageContainer>;
  if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;
  if (!data) return null;

  const { estudiante, carrera, materiasPorAnio, resumen } = data;
  const anios = Object.keys(materiasPorAnio).sort((a, b) => parseInt(a) - parseInt(b));

  if (anios.length === 0) {
    return (
      <PageContainer maxWidth={900}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {estudiante?.nombre} {estudiante?.apellido}
              </Typography>
              {carrera && <Typography variant="body2" color="text.secondary">{carrera.nombre}</Typography>}
            </Box>
          </Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/perfil/' + id)} size="small">
            Volver al perfil
          </Button>
        </Box>
        <Alert severity="info">No hay materias registradas para mostrar.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={900}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {estudiante?.nombre} {estudiante?.apellido}
            </Typography>
            {carrera && (
              <Typography variant="body2" color="text.secondary">
                {carrera.nombre}
              </Typography>
            )}
          </Box>
        </Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/perfil/' + id)} size="small">
          Volver al perfil
        </Button>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}>
          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="h4" fontWeight="bold">{resumen.aprobadas || 0}</Typography>
            <Typography variant="caption">Aprobadas</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
            <Typography variant="h4" fontWeight="bold">{resumen.regularizadas || 0}</Typography>
            <Typography variant="caption">Regularizadas</Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
            <Typography variant="h4" fontWeight="bold">{resumen.cursando || 0}</Typography>
            <Typography variant="caption">Cursando</Typography>
          </Paper>
        </Grid>
      </Grid>

      {anios.map((anio) => (
        <Card key={anio} elevation={0} sx={{ mb: 3, border: 1, borderColor: 'divider', transition: 'none', '&:hover': { boxShadow: 'none' } }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
              {anio}° Año
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small" sx={{ '& .MuiTableRow-root:hover': { backgroundColor: 'transparent' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Materia</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materiasPorAnio[anio]
                    .filter((m) => m.estado !== 'no_cursada')
                    .sort((a, b) => {
                      const order = { aprobada: 0, regularizada: 1, cursando: 2 };
                      return (order[a.estado] || 99) - (order[b.estado] || 99);
                    })
                    .map((materia) => {
                      const config = estadoConfig[materia.estado] || estadoConfig.no_cursada;
                      return (
                        <TableRow key={materia.id}>
                          <TableCell component="th" scope="row">
                            <Typography fontWeight="500">{materia.nombre}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={config.icon}
                              label={config.label}
                              size="small"
                              color={config.color}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}
    </PageContainer>
  );
};

export default MateriasVisitante;
