import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Alert, AlertTitle } from '@mui/material';
import { Block } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { AdminAppBar } from '../components/AdminAppBar';
import { PageTransition, LoadingSpinner } from '../components/ui';
import AppErrorBoundary from '../components/AppErrorBoundary';

const GENERAL_ERROR_EVENT = 'app-general-error';

const MENSAJE_ERROR_GENERAL =
  'Ocurrió un error inesperado. Podés continuar navegando y reintentar la última acción.';

export default function AdminLayout() {
  const { estudianteActual, loading: authLoading } = useAuth();
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

      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
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
    </>
  );
}
