import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const RequestCard = ({ request, onAccept, onReject }) => {
  const usuario = request.usuario;

  return (
    <Card sx={{ mb: 2, borderRadius: 2, '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={usuario?.avatarUrl}
              sx={{ width: 50, height: 50 }}
            >
              {usuario?.nombre?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {usuario?.nombre} {usuario?.apellido}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {usuario?.email}
              </Typography>
              <Chip
                label="Pendiente"
                size="small"
                color="warning"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => onAccept(request.id)}
              color="success"
              title="Aceptar"
            >
              <CheckCircle />
            </IconButton>
            <IconButton
              onClick={() => onReject(request.id)}
              color="error"
              title="Rechazar"
            >
              <Cancel />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RequestCard;