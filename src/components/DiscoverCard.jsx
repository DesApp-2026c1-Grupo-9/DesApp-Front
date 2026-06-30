import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Button,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

const DiscoverCard = ({ student, onInvite, isInviting, isInvited }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', borderRadius: 2, '&:hover': { boxShadow: theme => theme.shadows[2] } }}>
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
              src={student.avatar || `https://ui-avatars.com/api/?name=${student.nombre}+${student.apellido}&background=random`}
              sx={{ width: 45, height: 45, cursor: 'pointer' }}
              onClick={() => navigate('/perfil/' + student.id)}
            />
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => navigate('/perfil/' + student.id)}
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
            startIcon={isInvited ? null : <PersonAdd />}
            onClick={() => onInvite(student.id)}
            disabled={isInviting || isInvited}
            color={isInvited ? 'success' : 'primary'}
            variant={isInvited ? 'outlined' : 'contained'}
          >
            {isInviting ? 'Enviando...' : isInvited ? 'Pendiente' : 'Agregar'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DiscoverCard;