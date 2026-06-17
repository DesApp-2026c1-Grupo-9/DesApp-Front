import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Alert, Grid, Divider, Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Lock,
} from '@mui/icons-material';
import { PageContainer, LoadingSpinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import EstudianteService from '../services/EstudianteService';

export const MateriasVisitante = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { estudiantesDisponibles } = useAuth();
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noAuth, setNoAuth] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        setNoAuth(false);

        const estudianteMatch = estudiantesDisponibles.find(
          e => Number(e.usuario?.id) === Number(id)
        );
        if (!estudianteMatch) {
          setError('No se encontró el usuario solicitado');
          return;
        }

        const perfilData = await EstudianteService.obtenerEstudiante(estudianteMatch.id);
        const perfil = perfilData.data;
        setProfile(perfil);

        const situacion = await EstudianteService.obtenerMateriasEstudiante(estudianteMatch.id);
        setData({
          estudiante: estudianteMatch.usuario,
          carrera: situacion.data?.carrera,
          planDeEstudio: situacion.data?.planDeEstudio,
          materiasPorAnio: situacion.data?.materiasPorAnio || {},
          resumen: situacion.data?.resumen || {},
        });
      } catch (err) {
        if (err?.response?.status === 403) {
          setNoAuth(true);
        } else {
          setError('Error al cargar las materias');
        }
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id, estudiantesDisponibles]);

  if (loading) return <PageContainer centered padding={3}><LoadingSpinner message="Cargando materias..." /></PageContainer>;
  if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;

  if (noAuth) {
    return (
      <PageContainer maxWidth={600}>
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mt: 4 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Lock sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Información no disponible
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {profile?.perfilPublico === false
                ? 'Este perfil es privado. Tenés que conectarte con este estudiante para ver su situación académica.'
                : 'Este estudiante eligió no mostrar su situación académica en su perfil público.'}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/perfil/' + id)} size="large">
              Volver al perfil
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (!data) return null;

  const { estudiante, carrera, materiasPorAnio, resumen } = data;
  const anios = Object.keys(materiasPorAnio).sort((a, b) => parseInt(a) - parseInt(b));
  const nombreCompleto = `${estudiante?.nombre || ''} ${estudiante?.apellido || ''}`.trim();

  if (anios.length === 0) {
    return (
      <PageContainer maxWidth={900}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              src={estudiante?.avatarUrl || `https://ui-avatars.com/api/?name=${estudiante?.nombre}+${estudiante?.apellido}&background=1976d2&color=fff`}
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary">Materias de {nombreCompleto}</Typography>
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
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            src={estudiante?.avatarUrl || `https://ui-avatars.com/api/?name=${estudiante?.nombre}+${estudiante?.apellido}&background=1976d2&color=fff`}
            sx={{ width: 44, height: 44 }}
          />
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Materias de {nombreCompleto}
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
                    <TableCell align="center" sx={{ bgcolor: '#e8f5e9', fontWeight: 'bold', width: '33%' }}>Aprobadas</TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#fff3e0', fontWeight: 'bold', width: '33%' }}>Regularizadas</TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#e3f2fd', fontWeight: 'bold', width: '34%' }}>Cursando</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    const agrupadas = { aprobada: [], regularizada: [], cursando: [] };
                    materiasPorAnio[anio].forEach((m) => {
                      if (agrupadas[m.estado]) agrupadas[m.estado].push(m.nombre);
                    });
                    return (
                      <TableRow>
                        <TableCell align="center" sx={{ verticalAlign: 'top' }}>
                          {agrupadas.aprobada.length > 0 ? agrupadas.aprobada.map((n, i) => (
                            <Typography key={i} variant="body2">{n}</Typography>
                          )) : <Typography variant="body2" color="text.disabled">-</Typography>}
                        </TableCell>
                        <TableCell align="center" sx={{ verticalAlign: 'top' }}>
                          {agrupadas.regularizada.length > 0 ? agrupadas.regularizada.map((n, i) => (
                            <Typography key={i} variant="body2">{n}</Typography>
                          )) : <Typography variant="body2" color="text.disabled">-</Typography>}
                        </TableCell>
                        <TableCell align="center" sx={{ verticalAlign: 'top' }}>
                          {agrupadas.cursando.length > 0 ? agrupadas.cursando.map((n, i) => (
                            <Typography key={i} variant="body2">{n}</Typography>
                          )) : <Typography variant="body2" color="text.disabled">-</Typography>}
                        </TableCell>
                      </TableRow>
                    );
                  })()}
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
