import React from 'react';
import { Card, CardContent, Typography, Chip, Button, Box } from '@mui/material';
import { AccessTime, LocationOn, Videocam, HourglassEmpty } from '@mui/icons-material';

const SesionCard = ({ sesion, currentUser, onEdit, onJoin, onLeave, onViewParticipantes, onDelete }) => {
  const currentUserId = currentUser?.id;
  
  const participante = sesion.participantes?.find(p => 
    p.estudianteId === currentUserId || p.estudiante?.id === currentUserId
  );
  
  const isCreator = sesion.creadorId === currentUserId;
  const isJoined = !!participante;
  const isPending = participante?.estado === 'pendiente';
  const isApproved = participante?.estado === 'aprobado';
  const approvedCount = sesion.participantes?.filter(p => p.estado === 'aprobado').length || 0;
  const pendingCount = sesion.participantes?.filter(p => p.estado === 'pendiente').length || 0;

  // Get creator display name
  const creador = sesion.creador;
  const creadorNombre = creador 
    ? `${creador.nombre} ${creador.apellido}`
    : (sesion.creadorId ? `Usuario ${sesion.creadorId}` : 'Usuario');

  const fecha = new Date(sesion.fechaHora).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Card sx={{ mb: 2, transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {sesion.tema}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {sesion.materia?.nombre || sesion.materiaId} • {fecha}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={sesion.tipo === 'virtual' ? <Videocam /> : <LocationOn />}
                label={sesion.tipo === 'virtual' ? 'Virtual' : 'Presencial'}
                color={sesion.tipo === 'virtual' ? 'primary' : 'secondary'}
                size="small"
              />
              <Chip
                icon={<AccessTime />}
                label={`${sesion.duracion} min`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={sesion.cupos ? `${approvedCount}/${sesion.cupos} participantes` : `${approvedCount} participantes`}
                size="small"
                variant="outlined"
                color={sesion.cupos && approvedCount >= sesion.cupos ? 'error' : 'default'}
              />
              {sesion.necesidadAprobacion && (
                <Chip label="Requiere aprobación" size="small" color="warning" variant="outlined" />
              )}
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
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {isCreator ? (
            <>
              <Button size="small" variant="outlined" onClick={() => onEdit(sesion)}>
                Editar
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onDelete(sesion.id)}
              >
                Eliminar
              </Button>
              {pendingCount > 0 && (
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  onClick={() => onViewParticipantes(sesion)}
                >
                  Ver Participantes ({pendingCount} pendientes)
                </Button>
              )}
            </>
          ) : (
            <>
              {!isJoined && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onJoin(sesion.id)}
                >
                  Inscribirse
                </Button>
              )}
              {isPending && (
                <Button size="small" variant="outlined" disabled>
                  <HourglassEmpty sx={{ mr: 0.5 }} /> Pendiente
                </Button>
              )}
              {isApproved && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => onLeave(sesion.id)}
                >
                  Abandonar
                </Button>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SesionCard;