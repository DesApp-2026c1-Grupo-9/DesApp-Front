import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Alert, AlertTitle } from '@mui/material';
import { useSelector } from 'react-redux';
import { Sidebar } from '../components/Sidebar';
import { AdminAppBar } from '../components/AdminAppBar';
import { useAuth } from '../context/AuthContext';
import { PageTransition, LoadingSpinner } from '../components/ui';
import AppErrorBoundary from '../components/AppErrorBoundary';

const GENERAL_ERROR_EVENT = 'app-general-error';

const MENSAJE_ERROR_GENERAL =
  'Ocurrió un error inesperado. Podés continuar navegando y reintentar la última acción.';

export default function PublicLayout() {
  const { loading: authLoading } = useAuth();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const esAdmin = user?.rol === 'administrador';
  const routeKey = '/' + location.pathname.split('/')[1];
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (esAdmin && location.pathname !== '/configuracion') {
    return <Navigate to="/admin" replace />;
  }

  if (esAdmin) {
    return (
      <>
        <AdminAppBar />
        {errorGeneral && (
          <Alert severity="error" sx={{ borderRadius: 0 }} onClose={() => setErrorGeneral(null)}>
            <AlertTitle>Error general</AlertTitle>
            {MENSAJE_ERROR_GENERAL}
          </Alert>
        )}
        <Box sx={{ p: { xs: 2, md: 3 }, minHeight: 'calc(100vh - 64px)' }}>
          <PageTransition key={routeKey}>
            <AppErrorBoundary
              fallback={(
                <Box sx={{ p: 3 }}>
                  <Alert severity="error"><AlertTitle>Error general</AlertTitle>{MENSAJE_ERROR_GENERAL}</Alert>
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Sidebar />

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {errorGeneral && (
          <Alert severity="error" sx={{ borderRadius: 0 }} onClose={() => setErrorGeneral(null)}>
            <AlertTitle>Error general</AlertTitle>
            {MENSAJE_ERROR_GENERAL}
          </Alert>
        )}

        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
          <PageTransition key={routeKey}>
            <AppErrorBoundary
              fallback={(
                <Box sx={{ p: 3 }}>
                  <Alert severity="error"><AlertTitle>Error general</AlertTitle>{MENSAJE_ERROR_GENERAL}</Alert>
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
