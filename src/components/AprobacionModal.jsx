import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction,
  Button, Typography, Box, Avatar, Chip
} from '@mui/material';
import { CheckCircle, Cancel, Person, HourglassEmpty } from '@mui/icons-material';

const AprobacionModal = ({ open, sesion, onApprove, onReject, onClose }) => {
  if (!sesion) return null;

  const pending = sesion.participantes?.filter(p => p.estado === 'pendiente') || [];
  const approved = sesion.participantes?.filter(p => p.estado === 'aprobado') || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Person />
          Gestionar Participantes - {sesion.tema}
        </Box>
      </DialogTitle>
      <DialogContent>
        {pending.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom color="warning.main">
              Pendientes de Aprobación ({pending.length})
            </Typography>
            <List>
              {pending.map(p => (
                <ListItem key={p.id} divider>
                  <ListItemAvatar>
                    <Avatar>{p.estudiante?.nombre?.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${p.estudiante?.nombre} ${p.estudiante?.apellido}`}
                    secondary="Pendiente de aprobación"
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => onApprove(sesion.id, p.id)}
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => onReject(sesion.id, p.id)}
                      >
                        Rechazar
                      </Button>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {pending.length === 0 && (
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            No hay participantes pendientes de aprobación.
          </Typography>
        )}

        {approved.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom color="success.main" sx={{ mt: 2 }}>
              Participantes Aprobados ({approved.length})
            </Typography>
            <List>
              {approved.map(p => (
                <ListItem key={p.id} divider>
                  <ListItemAvatar>
                    <Avatar>{p.estudiante?.nombre?.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${p.estudiante?.nombre} ${p.estudiante?.apellido}`}
                    secondary="Aprobado"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Aprobado" color="success" size="small" icon={<CheckCircle />} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AprobacionModal;
