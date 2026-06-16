import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Public,
  Lock,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
} from '@mui/icons-material';

const ProfileViewCard = ({
  nombre,
  apellido,
  avatarUrl,
  email,
  mostrarEmail,
  carrera,
  estadisticas,
  mostrarSituacionAcademica,
  isOwnProfile,
  onSettingsClick,
  loading,
  error,
  fechaNacimiento,
  edad,
}) => {
  const navigate = useNavigate();

  if (loading) return null;
  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ '&:hover': { boxShadow: (theme) => theme.shadows[2] } }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={
              avatarUrl ||
              `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=random`
            }
            sx={{ width: 80, height: 80, mr: 2 }}
          />
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h5" fontWeight="bold">
                {nombre} {apellido}
              </Typography>
              {isOwnProfile && (
                <Tooltip title="Configuración del perfil">
                  <IconButton
                    size="small"
                    onClick={onSettingsClick || (() => navigate('/configuracion'))}
                    sx={{ ml: 'auto' }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Estudiante
            </Typography>
          </Box>
        </Box>

        {mostrarEmail && email && (
          <Typography variant="body2" gutterBottom>
            <EmailIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 16 }} />
            {email}
          </Typography>
        )}

        {fechaNacimiento && (
          <Typography variant="body2" gutterBottom>
            <CakeIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 16 }} />
            {fechaNacimiento}
            {edad ? ` (${edad} años)` : ''}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {mostrarSituacionAcademica && carrera && (
          <>
            <Box display="flex" alignItems="center" mb={2}>
              <SchoolIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Información Académica</Typography>
            </Box>

            <Typography variant="h6" gutterBottom color="primary">
              {carrera}
            </Typography>

            {estadisticas && (
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {estadisticas.aprobadas ?? 0}
                    </Typography>
                    <Typography variant="caption">Aprobadas</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {estadisticas.regularizadas ?? 0}
                    </Typography>
                    <Typography variant="caption">Regularizadas</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {estadisticas.cursando ?? 0}
                    </Typography>
                    <Typography variant="caption">Cursando</Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileViewCard;
