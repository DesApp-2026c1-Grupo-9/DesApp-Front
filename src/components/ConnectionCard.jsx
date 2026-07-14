import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import { Delete, Block } from '@mui/icons-material';

const ConnectionCard = ({ conexion, onDelete }) => {
  const navigate = useNavigate();
  const contacto = conexion.contacto;
  const inactivo = contacto?.activo === false;

  return (
    <Card sx={{ height: '100%', borderRadius: 2, opacity: inactivo ? 0.6 : 1, '&:hover': { boxShadow: theme => theme.shadows[2] }, overflow: 'hidden', minWidth: 0, transition: 'box-shadow 0.2s' }}>
      <CardContent sx={{ overflow: 'hidden', p: { xs: 2, sm: 1.5 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
              <Avatar
                src={contacto?.avatarUrl || `https://ui-avatars.com/api/?name=${contacto?.nombre}+${contacto?.apellido}&background=random`}
                sx={{ width: 45, height: 45, cursor: 'pointer', flexShrink: 0 }}
                onClick={() => navigate('/perfil/' + contacto?.id)}
              />
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, overflowWrap: 'break-word', minWidth: 0, transition: 'all 0.2s' }}
                onClick={() => navigate('/perfil/' + contacto?.id)}
              >
                {contacto?.nombre} {contacto?.apellido}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, overflowWrap: 'anywhere', textAlign: { xs: 'center', sm: 'left' }, ml: { xs: 0, sm: 6.5 }, mt: { xs: 0, sm: 0.25 } }}>
              {contacto?.email}
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.5 }}>
              {inactivo ? (
                <Chip icon={<Block />} label="Cuenta desactivada" size="small" color="default" />
              ) : (
                <Chip label="Conectado" size="small" color="success" />
              )}
            </Box>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' }, borderColor: 'grey.300' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 1, flexShrink: 0, pl: { sm: 1 } }}>
            <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 1 }}>
              {inactivo ? (
                <Chip icon={<Block />} label="Cuenta desactivada" size="small" color="default" />
              ) : (
                <Chip label="Conectado" size="small" color="success" />
              )}
            </Box>
            <IconButton
              onClick={() => onDelete(conexion.id, contacto)}
              color="error"
              title="Eliminar conexión"
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConnectionCard;