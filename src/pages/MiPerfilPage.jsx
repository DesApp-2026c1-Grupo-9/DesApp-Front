import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { PageContainer, LoadingSpinner } from '../components/ui';
import { updateAvatar } from '../features/auth/slice';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../hooks';
import EstudianteService from '../services/EstudianteService';

export default function MiPerfilPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { estudianteActual } = useAuth();
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [estudiante, setEstudiante] = useState(null);
  const [situacionAcademica, setSituacionAcademica] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, snackbar, closeSnackbar } = useSnackbar();

  const usuario = user || estudianteActual?.usuario || {};

  useEffect(() => {
    const cargarDatos = async () => {
      if (!estudianteActual?.id) {
        setEstudiante(null);
        setSituacionAcademica(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await EstudianteService.obtenerEstudiante(estudianteActual.id);
        setEstudiante({
          ...data.data,
          ...data.data.usuario,
          carreras: data.data.carreras,
        });

        const carreras = data.data.carreras || [];
        const resultados = [];
        for (const carrera of carreras) {
          try {
            const materiasData = await EstudianteService.obtenerMateriasEstudiante(estudianteActual.id, carrera.id);
            resultados.push({
              carreraId: carrera.id,
              carrera: materiasData.data?.carrera?.nombre || carrera.nombre,
              estadisticas: {
                materiasAprobadas: materiasData.data?.resumen?.aprobadas || 0,
                materiasRegularizaciones: materiasData.data?.resumen?.regularizadas || 0,
                materiasCursando: materiasData.data?.resumen?.cursando || 0,
                totalMaterias: materiasData.data?.resumen?.total || 0,
              },
            });
          } catch {
            resultados.push({
              carreraId: carrera.id,
              carrera: carrera.nombre,
              estadisticas: { materiasAprobadas: 0, materiasRegularizaciones: 0, materiasCursando: 0, totalMaterias: 0 },
            });
          }
        }
        setSituacionAcademica(resultados);
      } catch {
        showError('Error al cargar datos del perfil');
      } finally {
        setLoading(false);
      }
    };
    if (estudianteActual) cargarDatos();
  }, [estudianteActual]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      await dispatch(updateAvatar({ id: user?.id, file })).unwrap();
      showSuccess('Avatar actualizado correctamente');
    } catch {
      showError('Error al subir avatar');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <LoadingSpinner message="Cargando información académica..." />;

  return (
    <PageContainer maxWidth={1000}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold">Mi Perfil</Typography>
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3, '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' } }}>
        <Box sx={{ height: 100, background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})` }} />
        <CardContent sx={{ mt: -6, textAlign: 'center' }}>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
          <Box
            sx={{ position: 'relative', width: 104, height: 104, mx: 'auto', cursor: 'pointer', '&:hover .avatar-overlay': { opacity: 1 } }}
            onClick={handleAvatarClick}
          >
            <Avatar
              src={`https://ui-avatars.com/api/?name=${usuario.nombre}+${usuario.apellido}&background=random&bold=true`}
              sx={{ width: 96, height: 96, border: '4px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            />
            <Box className="avatar-overlay" sx={{ position: 'absolute', top: 4, left: 4, width: 96, height: 96, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: avatarUploading ? 1 : 0, transition: 'opacity 0.2s' }}>
              <PhotoCamera sx={{ color: 'white', fontSize: 28 }} />
            </Box>
          </Box>
          <Typography variant="h5" fontWeight="bold" mt={1}>{usuario.nombre} {usuario.apellido}</Typography>
          {estudiante?.carreras?.length > 0 ? (
            <Box display="flex" justifyContent="center" flexWrap="wrap" gap={0.5} mt={0.5}>
              {estudiante.carreras.map((c, i) => (
                <Chip key={i} label={c.nombre} size="small" icon={<SchoolIcon sx={{ fontSize: 14 }} />} variant="outlined" color="primary" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" mt={0.5}>Estudiante</Typography>
          )}
        </CardContent>
      </Card>

      {situacionAcademica?.length > 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' } }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <SchoolIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Información Académica</Typography>
            </Box>
            {situacionAcademica.map((acad, idx) => {
              const stats = acad.estadisticas || {};
              const total = stats.materiasAprobadas + stats.materiasRegularizaciones + stats.materiasCursando || 1;
              const progreso = Math.round((stats.materiasAprobadas / total) * 100);
              return (
                <Box key={idx}>
                  {idx > 0 && <Divider sx={{ my: 3 }} />}
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>{acad.carrera}</Typography>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" color="text.secondary">Progreso general</Typography>
                      <Typography variant="caption" fontWeight="bold" color="success.main">{progreso}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progreso} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
                        <Typography variant="h4" fontWeight="bold" color="success.main">{stats.materiasAprobadas || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">Aprobadas</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50', borderRadius: 2, border: '1px solid', borderColor: 'warning.200' }}>
                        <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.materiasRegularizaciones || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">Regularizadas</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.200' }}>
                        <Typography variant="h4" fontWeight="bold" color="info.main">{stats.materiasCursando || 0}</Typography>
                        <Typography variant="caption" color="text.secondary">Cursando</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              );
            })}
            <Box mt={3} textAlign="center">
              <Button variant="contained" startIcon={<MenuBookIcon />} onClick={() => navigate('/academico/mis-materias')} size="large" sx={{ borderRadius: 2, px: 4 }}>
                Ver Detalle de Materias
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {situacionAcademica?.length === 0 && estudiante && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' } }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>Información Académica</Typography>
            <Typography variant="body2" color="text.secondary">Sin carrera asignada</Typography>
          </CardContent>
        </Card>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </PageContainer>
  );
}
