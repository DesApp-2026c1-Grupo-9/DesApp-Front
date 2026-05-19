import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const ConnectionCard = ({ conexion, onDelete }) => {
  const contacto = conexion.contacto;

  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
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
              src={contacto?.avatarUrl}
              sx={{ width: 50, height: 50 }}
            >
              {contacto?.nombre?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {contacto?.nombre} {contacto?.apellido}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {contacto?.email}
              </Typography>
              <Chip
                label="Conectado"
                size="small"
                color="success"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Box>
          <IconButton
            onClick={() => onDelete(conexion.id, contacto)}
            color="error"
            title="Eliminar conexión"
          >
            <Delete />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConnectionCard;