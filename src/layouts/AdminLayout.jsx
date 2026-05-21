import { Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { ArrowBack, AdminPanelSettings } from '@mui/icons-material';

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <>
      <AppBar position="static" sx={{ mb: 3, bgcolor: 'warning.dark', borderRadius: 0 }}>
        <Toolbar>
          <AdminPanelSettings sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Panel de Administración
          </Typography>
          <Button
            variant="outlined"
            sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Box>
    </>
  );
}
