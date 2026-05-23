import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  School,
  MenuBook,
  LibraryBooks,
  AdminPanelSettings,
} from '@mui/icons-material';

import { CarrerasTab, MateriasTab, PlanesTab } from '../components/admin';
import { TabPanel } from '../components/ui';
import { PageContainer } from '../components/ui';

export default function AdminAcademicoPage() {
  const [subTab, setSubTab] = useState(0);
  const user = useSelector((state) => state.auth.user);
  const loadingStudents = useSelector((state) => state.auth.loadingStudents);
  const navigate = useNavigate();

  if (loadingStudents) {
    return (
      <PageContainer maxWidth={600} centered>
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Cargando...
          </Typography>
        </Box>
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
    <PageContainer maxWidth={1400}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: 0 }}>
          <Tabs value={subTab} onChange={(_, v) => setSubTab(v)}>
            <Tab icon={<School />} label="Carreras" iconPosition="start" />
            <Tab icon={<MenuBook />} label="Materias" iconPosition="start" />
            <Tab icon={<LibraryBooks />} label="Planes" iconPosition="start" />
          </Tabs>
        </CardContent>
      </Card>

      <TabPanel value={subTab} index={0}><CarrerasTab /></TabPanel>
      <TabPanel value={subTab} index={1}><MateriasTab /></TabPanel>
      <TabPanel value={subTab} index={2}><PlanesTab /></TabPanel>
    </PageContainer>
  );
}
