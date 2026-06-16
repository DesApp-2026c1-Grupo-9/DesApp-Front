import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Alert, AlertTitle } from '@mui/material';
import { useSelector } from 'react-redux';
import { TopMenu } from '../components/TopMenu';
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

  if (esAdmin && location.pathname !== '/mi-perfil') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      {esAdmin ? <AdminAppBar /> : <TopMenu />}

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
        <PageTransition key={routeKey}>
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
