import { Outlet } from 'react-router-dom';
import { Box, Alert, AlertTitle } from '@mui/material';
import { Block } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { AdminAppBar } from '../components/AdminAppBar';

export default function AdminLayout() {
  const { estudianteActual } = useAuth();

  return (
    <>
      <AdminAppBar />
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
