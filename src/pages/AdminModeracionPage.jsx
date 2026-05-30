import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  AdminPanelSettings,
} from '@mui/icons-material';

import { ModeracionTab } from '../components/admin';
import { PageContainer, LoadingSpinner } from '../components/ui';

export default function AdminModeracionPage() {
  const user = useSelector((state) => state.auth.user);
  const loadingStudents = useSelector((state) => state.auth.loadingStudents);
  const navigate = useNavigate();

  if (loadingStudents) {
    return (
      <PageContainer centered padding={3}>
        <LoadingSpinner message="Cargando panel de administración..." />
      </PageContainer>
    );
  }

  if (!user || user.rol !== 'administrador') {
    return (
      <PageContainer maxWidth={600} centered>
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <AdminPanelSettings sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Acceso Denegado</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Solo los usuarios administradores pueden acceder al panel de administración.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1400} padding={0}>
      <ModeracionTab />
    </PageContainer>
  );
}
