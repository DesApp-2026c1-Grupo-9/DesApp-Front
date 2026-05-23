import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Person, AdminPanelSettings } from '@mui/icons-material';
import { UserSelector } from './UserSelector';

export function AdminAppBar() {
  const navigate = useNavigate();

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
            flexGrow: 1,
            color: 'inherit',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': { color: 'inherit' },
          }}
        >
          <AdminPanelSettings sx={{ mr: 1 }} />
          <Typography variant="h6">
            Panel de Administración
          </Typography>
        </Box>

        <Box sx={{ mr: 2 }}>
          <UserSelector />
        </Box>

        <Button
          variant="outlined"
          sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
          startIcon={<Person />}
          onClick={() => navigate('/mi-perfil')}
        >
          Mi Perfil
        </Button>
      </Toolbar>
    </AppBar>
  );
}
