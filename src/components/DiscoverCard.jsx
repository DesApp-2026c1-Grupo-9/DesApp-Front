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
              src={student.avatarUrl || `https://ui-avatars.com/api/?name=${student.nombre}+${student.apellido}&background=random`}
              sx={{ width: 45, height: 45, cursor: 'pointer' }}
              onClick={() => navigate('/perfil/' + student.usuarioId)}
            />
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => navigate('/perfil/' + student.usuarioId)}
              >
                {student.nombre} {student.apellido}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {student.email}
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            startIcon={isPending ? <HourglassEmpty /> : isInviting ? null : <PersonAdd />}
            onClick={() => onInvite(student.id)}
            disabled={isInviting || isPending}
            color={isPending ? 'warning' : 'primary'}
            variant={isPending ? 'outlined' : 'contained'}
          >
            {isInviting ? 'Enviando...' : isPending ? 'Pendiente' : 'Agregar'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DiscoverCard;