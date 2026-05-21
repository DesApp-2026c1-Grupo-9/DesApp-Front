import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  PersonAdd,
  School,
  MenuBook,
  AdminPanelSettings,
} from '@mui/icons-material';

import { PersonasTab, CarrerasTab, MateriasTab } from '../components/admin';
import { TabPanel } from '../components/ui';
import { PageContainer } from '../components/ui';

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

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
        <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab icon={<PersonAdd />} label="Personas" iconPosition="start" />
            <Tab icon={<School />} label="Carreras" iconPosition="start" />
            <Tab icon={<MenuBook />} label="Materias" iconPosition="start" />
          </Tabs>
        </CardContent>
      </Card>

      <TabPanel value={tab} index={0}><PersonasTab /></TabPanel>
      <TabPanel value={tab} index={1}><CarrerasTab /></TabPanel>
      <TabPanel value={tab} index={2}><MateriasTab /></TabPanel>
    </PageContainer>
  );
}