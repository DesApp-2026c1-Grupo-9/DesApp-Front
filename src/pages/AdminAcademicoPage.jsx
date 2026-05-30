import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  School,
  MenuBook,
  LibraryBooks,
  AdminPanelSettings,
} from '@mui/icons-material';

import { CarrerasTab, MateriasTab, PlanesTab } from '../components/admin';
import { TabPanel } from '../components/ui';
import { PageContainer, LoadingSpinner } from '../components/ui';

export default function AdminAcademicoPage() {
  const [subTab, setSubTab] = useState(0);
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
      <Tabs value={subTab} onChange={(_, v) => setSubTab(v)} sx={{ mb: 3, minHeight: 10, '& .MuiTab-root': { pt: 1, pb: 1, minHeight: 10, '& .MuiTab-iconWrapper': { mb: 0 } } }}>
            <Tab icon={<School />} label="Carreras" iconPosition="start" />
            <Tab icon={<MenuBook />} label="Materias" iconPosition="start" />
            <Tab icon={<LibraryBooks />} label="Planes" iconPosition="start" />
          </Tabs>

      <TabPanel value={subTab} index={0}><CarrerasTab /></TabPanel>
      <TabPanel value={subTab} index={1}><MateriasTab /></TabPanel>
      <TabPanel value={subTab} index={2}><PlanesTab /></TabPanel>
    </PageContainer>
  );
}
