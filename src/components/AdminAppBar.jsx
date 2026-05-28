import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Tabs, Tab } from '@mui/material';
import { Person, AdminPanelSettings, PersonAdd, School, Gavel } from '@mui/icons-material';
import { UserSelector } from './UserSelector';

export function AdminAppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const tab = location.pathname.includes('/academico') ? 1 : location.pathname.includes('/moderacion') ? 2 : location.pathname === '/mi-perfil' ? 3 : 0;

  return (
    <AppBar position="static" sx={{ mb: 3, bgcolor: 'warning.dark', borderRadius: 0 }}>
      <Toolbar>
        <Box
          component="a"
          href="/admin"
          onClick={(e) => { e.preventDefault(); navigate('/admin'); }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'inherit',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': { color: 'inherit' },
            mr: 3,
            whiteSpace: 'nowrap',
          }}
        >
          <AdminPanelSettings sx={{ mr: 1 }} />
          <Typography variant="h6">
            Panel de Administración
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Tabs
          value={tab}
          onChange={(_, v) => navigate(v === 0 ? '/admin/usuarios' : v === 1 ? '/admin/academico' : v === 2 ? '/admin/moderacion' : '/mi-perfil')}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab icon={<PersonAdd />} label="Usuarios" iconPosition="start" />
          <Tab icon={<School />} label="Académico" iconPosition="start" />
          <Tab icon={<Gavel />} label="Moderación" iconPosition="start" />
          <Tab icon={<Person />} label="Mi Perfil" iconPosition="start" />
        </Tabs>
        <Box sx={{ ml: 2 }}>
          <UserSelector />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
