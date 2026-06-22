import React from 'react';
import { Card, CardContent, Typography, Chip, Button, Box, CircularProgress } from '@mui/material';
import { AccessTime, LocationOn, Videocam, HourglassEmpty, Public, Group, Lock } from '@mui/icons-material';

const SesionCard = ({ sesion, currentUser, materias, operationLoading, visibilidad, onEdit, onJoin, onLeave, onViewParticipantes, onDelete }) => {
  const currentUserId = currentUser?.id;

  const isThisOperationLoading = operationLoading && 
    operationLoading.sesionId === sesion.id && 
    ['joining', 'leaving'].includes(operationLoading.action);
  
  const participante = sesion.participantes?.find(p => 
    p.estudianteId === currentUserId || p.estudiante?.id === currentUserId
  );
  
  const isCanceled = sesion.estado === 'cancelada';
  const isCreator = sesion.creadorId === currentUserId;
  const isJoined = !!participante;
  const isPending = participante?.estado === 'pendiente';
  const isApproved = participante?.estado === 'aprobado';
  const isRejected = participante?.estado === 'rechazado';
  const approvedCount = sesion.participantes?.filter(p => p.estado === 'aprobado').length || 0;
  const pendingCount = sesion.participantes?.filter(p => p.estado === 'pendiente').length || 0;

  // Get materia name from prop or fallback to ID
  const materiaNombre = materias?.find(m => m.id === sesion.materiaId)?.nombre || `Materia ${sesion.materiaId}`;

  // Get creator display name
  const creador = sesion.creador;
  const creadorNombre = creador 
    ? `${creador.nombre} ${creador.apellido}`
    : (sesion.creadorId ? `Usuario ${sesion.creadorId}` : 'Usuario eliminado');

  const fecha = new Date(sesion.fechaHora).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Card sx={{ transition: 'none', boxShadow: theme => theme.shadows[2], '&:hover': { boxShadow: theme => theme.shadows[2] }, opacity: isCanceled ? 0.55 : 1, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {sesion.tema}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {materiaNombre} • {fecha}
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
              {visibilidad === 'publico' && (
                <Chip icon={<Public />} label="Público" size="small" color="success" variant="outlined" />
              )}
              {visibilidad === 'contacto' && (
                <Chip icon={<Group />} label="Contacto" size="small" color="info" variant="outlined" />
              )}
              {visibilidad === 'privado' && (
                <Chip icon={<Lock />} label="Privado" size="small" color="default" variant="outlined" />
              )}
              {isCanceled && (
                <Chip label="Cancelada" size="small" color="error" />
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
              <Button size="small" variant="outlined" onClick={() => onEdit(sesion)} disabled={isCanceled}>
                Editar
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onDelete(sesion.id)}
                disabled={isCanceled}
              >
                Cancelar
              </Button>
              <Button
                size="small"
                variant="contained"
                color="warning"
                onClick={() => onViewParticipantes(sesion)}
              >
                {sesion.necesidadAprobacion && pendingCount > 0 
                  ? `Ver Participantes (${pendingCount} pendientes)` 
                  : 'Ver Participantes'}
              </Button>
            </>
          ) : (
            <>
              {!isCanceled && (
                <>
                  {(!isJoined || isRejected) && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => onJoin(sesion.id)}
                      disabled={isThisOperationLoading}
                    >
                      {isThisOperationLoading && operationLoading.action === 'joining' ? (
                        <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                      ) : null}
                      {sesion.necesidadAprobacion ? 'Solicitar inscribirse' : 'Inscribirse'}
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
                      disabled={isThisOperationLoading}
                    >
                      {isThisOperationLoading && operationLoading.action === 'leaving' ? (
                        <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                      ) : null}
                      Abandonar
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SesionCard;