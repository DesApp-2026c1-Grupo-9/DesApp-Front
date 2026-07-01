import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Typography, Box, Button, Chip, CircularProgress, Alert, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText,
} from '@mui/material';
import { ArrowBack, AccessTime, LocationOn, Videocam, Public, Group, Lock, HourglassEmpty } from '@mui/icons-material';
import { getSesionById } from '../features/sesiones/service';
import { joinToSesion, leaveSesionThunk, fetchParticipantes } from '../features/sesiones/slice';
import { PageContainer, LoadingSpinner } from '../components/ui';

export default function SesionDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const estudianteId = user?.estudianteId || user?.Estudiante?.id || user?.id;

  const [sesion, setSesion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantesOpen, setParticipantesOpen] = useState(false);
  const [participantesList, setParticipantesList] = useState([]);

  useEffect(() => {
    if (!estudianteId || !id) return;
    setLoading(true);
    getSesionById(id, estudianteId)
      .then((res) => {
        setSesion(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Error al cargar la sesión');
      })
      .finally(() => setLoading(false));
  }, [id, estudianteId]);

  const handleJoin = async () => {
    await dispatch(joinToSesion({ sesionId: sesion.id, estudianteId }));
    const res = await getSesionById(id, estudianteId);
    setSesion(res.data);
  };

  const handleLeave = async () => {
    const p = sesion.participantes?.find(p => p.estudianteId === estudianteId);
    if (!p) return;
    await dispatch(leaveSesionThunk({ sesionId: sesion.id, participanteId: p.id, estudianteId }));
    const res = await getSesionById(id, estudianteId);
    setSesion(res.data);
  };

  const handleVerParticipantes = () => {
    dispatch(fetchParticipantes({ sesionId: sesion.id, estudianteId }))
      .then((res) => {
        setParticipantesList(res.payload?.participantes || []);
        setParticipantesOpen(true);
      });
  };

  if (loading) return <LoadingSpinner fullScreen message="Cargando sesión..." />;

  if (error) {
    return (
      <PageContainer>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Volver
        </Button>
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  if (!sesion) return null;

  const currentEstudianteId = estudianteId;
  const isCreator = sesion.creadorId === currentEstudianteId;
  const isCanceled = sesion.estado === 'cancelada';
  const participante = sesion.participantes?.find(p => p.estudianteId === currentEstudianteId);
  const isPending = participante?.estado === 'pendiente';
  const isApproved = participante?.estado === 'aprobado';
  const isRejected = participante?.estado === 'rechazado';
  const approvedCount = sesion.participantes?.filter(p => p.estado === 'aprobado').length || 0;

  const creadorNombre = sesion.creador
    ? `${sesion.creador.nombre} ${sesion.creador.apellido}`
    : `Usuario ${sesion.creadorId}`;

  const fecha = new Date(sesion.fechaHora).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <PageContainer >
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Volver
      </Button>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {sesion.tema}
          </Typography>

          <Typography color="textSecondary" gutterBottom>
            {sesion.materia?.nombre || `Materia ${sesion.materiaId}`} &middot; {fecha}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={sesion.tipo === 'virtual' ? <Videocam /> : <LocationOn />}
              label={sesion.tipo === 'virtual' ? 'Virtual' : 'Presencial'}
              color={sesion.tipo === 'virtual' ? 'primary' : 'secondary'}
              size="small"
            />
            <Chip icon={<AccessTime />} label={`${sesion.duracion} min`} size="small" variant="outlined" />
            <Chip
              label={sesion.cupos ? `${approvedCount}/${sesion.cupos} participantes` : `${approvedCount} participantes`}
              size="small"
              variant="outlined"
            />
            {sesion.visibilidad === 'publico' && <Chip icon={<Public />} label="Público" size="small" color="success" variant="outlined" />}
            {sesion.visibilidad === 'contacto' && <Chip icon={<Group />} label="Contacto" size="small" color="info" variant="outlined" />}
            {sesion.visibilidad === 'privado' && <Chip icon={<Lock />} label="Privado" size="small" variant="outlined" />}
            {isCanceled && <Chip label="Cancelada" size="small" color="error" />}
          </Box>

          {sesion.tipo === 'virtual' ? (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Link:</strong> {sesion.link}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Ubicación:</strong> {sesion.ubicacion}
            </Typography>
          )}

          {sesion.descripcion && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {sesion.descripcion}
            </Typography>
          )}

          <Typography variant="caption" color="textSecondary">
            Creado por: {creadorNombre}
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {!isCreator && !isCanceled && (
              <>
                {(!participante || isRejected) && (
                  <Button size="small" variant="contained" onClick={handleJoin}>
                    {sesion.necesidadAprobacion ? 'Solicitar inscribirse' : 'Inscribirse'}
                  </Button>
                )}
                {isPending && (
                  <Button size="small" variant="outlined" disabled>
                    <HourglassEmpty sx={{ mr: 0.5 }} /> Pendiente
                  </Button>
                )}
                {isApproved && (
                  <Button size="small" variant="outlined" color="error" onClick={handleLeave}>
                    Abandonar
                  </Button>
                )}
              </>
            )}
            {isCreator && !isCanceled && (
              <Button size="small" variant="contained" color="warning" onClick={handleVerParticipantes}>
                Ver Participantes ({sesion.participantes?.length || 0})
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={participantesOpen} onClose={() => setParticipantesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Participantes</DialogTitle>
        <DialogContent>
          {participantesList.length === 0 ? (
            <Typography color="text.secondary">No hay participantes.</Typography>
          ) : (
            <List disablePadding>
              {participantesList.map((p) => (
                <ListItem key={p.id} disableGutters>
                  <ListItemText
                    primary={p.estudiante?.nombre || p.estudiante?.Usuario?.nombre || `Usuario ${p.estudianteId}`}
                    secondary={`Estado: ${p.estado}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParticipantesOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
