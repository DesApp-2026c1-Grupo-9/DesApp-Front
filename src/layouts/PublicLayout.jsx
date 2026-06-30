import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Box, Alert, AlertTitle } from '@mui/material';
import { useSelector } from 'react-redux';
import { Sidebar } from '../components/Sidebar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { PageTransition, LoadingSpinner } from '../components/ui';
import AppErrorBoundary from '../components/AppErrorBoundary';

const MENSAJE_ERROR_GENERAL =
  'Ocurrió un error inesperado. Podés continuar navegando y reintentar la última acción.';

export default function PublicLayout() {
  const { loading: authLoading } = useAuth();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const esAdmin = user?.rol === 'administrador';
  const routeKey = '/' + location.pathname.split('/')[1];

  if (authLoading) {
    return <LoadingSpinner fullScreen message="Inicializando sesión..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (esAdmin && location.pathname !== '/configuracion') {
    return <Navigate to="/admin" replace />;
  }

  const SidebarComponent = esAdmin ? AdminSidebar : Sidebar;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50', overflowX: 'hidden' }}>
      <SidebarComponent />

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: '100%', boxSizing: 'border-box' }}>
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