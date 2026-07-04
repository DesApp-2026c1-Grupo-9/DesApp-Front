import { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Box, Alert, AlertTitle, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Block, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { PageTransition, LoadingSpinner } from '../components/ui';
import AppErrorBoundary from '../components/AppErrorBoundary';

const MENSAJE_ERROR_GENERAL =
  'Ocurrió un error inesperado. Podés continuar navegando y reintentar la última acción.';

export default function AdminLayout() {
  const { estudianteActual, loading: authLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  if (authLoading) {
    return <LoadingSpinner fullScreen message="Inicializando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AdminSidebar mobileOpen={mobileDrawerOpen} onToggle={() => setMobileDrawerOpen(!mobileDrawerOpen)} />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0, overflowX: 'auto' }}>
        {isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', px: 1, pt: 0.5 }}>
            <IconButton onClick={() => setMobileDrawerOpen(true)} size="large">
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        {estudianteActual?.usuario?.activo === false && (
          <Alert severity="warning" sx={{ borderRadius: 0, justifyContent: 'center', '& .MuiAlert-message': { textAlign: 'center', width: '100%' } }} icon={false}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Block />
              <AlertTitle sx={{ mb: 0 }}>Cuenta desactivada</AlertTitle>
            </Box>
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