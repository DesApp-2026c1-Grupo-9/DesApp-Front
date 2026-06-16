import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import { Delete, Block } from '@mui/icons-material';

const ConnectionCard = ({ conexion, onDelete }) => {
  const navigate = useNavigate();
  const contacto = conexion.contacto;
  const inactivo = contacto?.activo === false;

  return (
    <Card sx={{ mb: 2, borderRadius: 2, opacity: inactivo ? 0.6 : 1, '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
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
              src={contacto?.avatarUrl || `https://ui-avatars.com/api/?name=${contacto?.nombre}+${contacto?.apellido}&background=random`}
              sx={{ width: 45, height: 45, cursor: 'pointer' }}
              onClick={() => navigate('/perfil/' + contacto?.id)}
            />
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => navigate('/perfil/' + contacto?.id)}
              >
                {contacto?.nombre} {contacto?.apellido}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {contacto?.email}
              </Typography>
              {inactivo ? (
                <Chip icon={<Block />} label="Cuenta desactivada" size="small" color="default" sx={{ mt: 0.5 }} />
              ) : (
                <Chip label="Conectado" size="small" color="success" sx={{ mt: 0.5 }} />
              )}
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