import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Tabs, Tab, Alert, AlertTitle } from '@mui/material';
import { ArrowBack, AdminPanelSettings, PersonAdd, School, Gavel, Block } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents } from '../features/auth/slice';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const students = useSelector((state) => state.auth.students);
  const { estudianteActual } = useAuth();
  const tab = location.pathname.includes('/academico') ? 1 : location.pathname.includes('/moderacion') ? 2 : 0;

  useEffect(() => {
    if (!students?.length) {
      dispatch(fetchStudents());
    }
  }, [dispatch, students?.length]);

  return (
    <>
      <AppBar position="static" sx={{ mb: 3, bgcolor: 'warning.dark', borderRadius: 0 }}>
        <Toolbar>
          <AdminPanelSettings sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ mr: 3, whiteSpace: 'nowrap' }}>
            Panel de Administración
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tabs
            value={tab}
            onChange={(_, v) => navigate(v === 0 ? '/admin/usuarios' : v === 1 ? '/admin/academico' : '/admin/moderacion')}
            textColor="inherit"
            indicatorColor="secondary"
          >
            <Tab icon={<PersonAdd />} label="Usuarios" iconPosition="start" />
            <Tab icon={<School />} label="Académico" iconPosition="start" />
            <Tab icon={<Gavel />} label="Moderación" iconPosition="start" />
          </Tabs>
          <Button
            variant="outlined"
            sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', ml: 2, whiteSpace: 'nowrap' }}
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      {estudianteActual?.usuario?.activo === false && (
        <Alert severity="warning" sx={{ borderRadius: 0, justifyContent: 'center', '& .MuiAlert-message': { textAlign: 'center', width: '100%' } }} icon={false}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Block />
            <AlertTitle sx={{ mb: 0 }}>Cuenta desactivada</AlertTitle>
          </Box>
        </Alert>
      )}
      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Box>
    </>
  );
}
