import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Alert, AlertTitle } from '@mui/material';
import { Block } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { PageTransition, LoadingSpinner } from '../components/ui';
import AppErrorBoundary from '../components/AppErrorBoundary';

const GENERAL_ERROR_EVENT = 'app-general-error';

const MENSAJE_ERROR_GENERAL =
  'Ocurrió un error inesperado. Podés continuar navegando y reintentar la última acción.';

export default function AdminLayout() {
  const { estudianteActual, loading: authLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [errorGeneral, setErrorGeneral] = useState(null);

  useEffect(() => {
    const onGeneralError = (event) => {
      const message = event?.detail?.message || MENSAJE_ERROR_GENERAL;
      setErrorGeneral(message);
    };

    window.addEventListener(GENERAL_ERROR_EVENT, onGeneralError);
    return () => window.removeEventListener(GENERAL_ERROR_EVENT, onGeneralError);
  }, []);

  if (authLoading) {
    return <LoadingSpinner fullScreen message="Inicializando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50', overflowX: 'hidden' }}>
      <AdminSidebar />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {estudianteActual?.usuario?.activo === false && (
          <Alert severity="warning" sx={{ borderRadius: 0, justifyContent: 'center', '& .MuiAlert-message': { textAlign: 'center', width: '100%' } }} icon={false}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Block />
              <AlertTitle sx={{ mb: 0 }}>Cuenta desactivada</AlertTitle>
            </Box>
          </Alert>
        )}

        {errorGeneral && (
          <Alert
            severity="error"
            sx={{ borderRadius: 0 }}
            onClose={() => setErrorGeneral(null)}
          >
            <AlertTitle>Error general</AlertTitle>
            {MENSAJE_ERROR_GENERAL}
          </Alert>
        )}

        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: '100%', boxSizing: 'border-box' }}>
          <PageTransition key={location.pathname}>
            <AppErrorBoundary
              fallback={(
                <Box sx={{ p: 3 }}>
                  <Alert severity="error">
                    <AlertTitle>Error general</AlertTitle>
                    {MENSAJE_ERROR_GENERAL}
                  </Alert>
                </Box>
              )}
            >
              <Outlet />
            </AppErrorBoundary>
          </PageTransition>
        </Box>
      </Box>
    </Box>
  );
}
