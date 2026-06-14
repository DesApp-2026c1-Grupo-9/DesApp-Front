import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import { Book, School } from '@mui/icons-material';
import { EstudianteMaterias } from './EstudianteMaterias';
import { CareerManagementPage } from './CareerManagementPage';

function AcademicoPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: 'Carreras', path: '/academico/carreras', icon: <School /> },
    { label: 'Mis Materias', path: '/academico/mis-materias', icon: <Book /> },
  ];

  const currentTab = tabs.findIndex((t) => location.pathname === t.path);

  return (
    <>
      <Tabs
        value={currentTab === -1 ? 0 : currentTab}
        onChange={(_, i) => navigate(tabs[i].path)}
        sx={{ mb: 3, minHeight: 10, '& .MuiTab-root': { pt: 1, pb: 1, minHeight: 10, '& .MuiTab-iconWrapper': { mb: 0 } } }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.label} icon={tab.icon} iconPosition="start" label={tab.label} />
        ))}
      </Tabs>
      <Box sx={{ display: currentTab === 0 ? '' : 'none' }}>
        <CareerManagementPage />
      </Box>
      <Box sx={{ display: currentTab === 1 ? '' : 'none' }}>
        <EstudianteMaterias />
      </Box>
    </>
  );
}

export default AcademicoPage;
