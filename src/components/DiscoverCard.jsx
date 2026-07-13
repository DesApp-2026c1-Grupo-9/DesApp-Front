import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Button,
} from '@mui/material';
import { PersonAdd, HourglassEmpty } from '@mui/icons-material';

const DiscoverCard = ({ student, onInvite, isInviting, isPending }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', borderRadius: 2, '&:hover': { boxShadow: theme => theme.shadows[2] }, overflow: 'hidden', minWidth: 0 }}>
      <CardContent sx={{ overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
              <Avatar
                src={student.avatarUrl || `https://ui-avatars.com/api/?name=${student.nombre}+${student.apellido}&background=random`}
                sx={{ width: 45, height: 45, cursor: 'pointer', flexShrink: 0 }}
                onClick={() => navigate('/perfil/' + student.usuarioId)}
              />
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, overflowWrap: 'break-word', minWidth: 0 }}
                onClick={() => navigate('/perfil/' + student.usuarioId)}
              >
                {student.nombre} {student.apellido}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, overflowWrap: 'anywhere', ml: { xs: 0, sm: 6.5 }, mt: { xs: 0, sm: 0.25 } }}>
              {student.email}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
            <Button
              size="small"
              startIcon={isPending ? <HourglassEmpty /> : isInviting ? null : <PersonAdd />}
              onClick={() => onInvite(student.id)}
              disabled={isInviting || isPending}
              color={isPending ? 'warning' : 'primary'}
              variant={isPending ? 'outlined' : 'contained'}
              sx={{ flexShrink: 0 }}
            >
              {isInviting ? 'Enviando...' : isPending ? 'Pendiente' : 'Agregar'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DiscoverCard;