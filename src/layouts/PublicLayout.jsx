import { useState, createContext, useContext } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Box, Alert, AlertTitle, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Sidebar } from '../components/Sidebar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { PageTransition, LoadingSpinner } from '../components/ui';
import AppErrorBoundary from '../components/AppErrorBoundary';

export const MobileHeaderActionContext = createContext(null);

const MENSAJE_ERROR_GENERAL =
  'Ocurrió un error inesperado. Podés continuar navegando y reintentar la última acción.';

export default function PublicLayout() {
  const { loading: authLoading } = useAuth();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileHeaderAction, setMobileHeaderAction] = useState(null);
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <SidebarComponent mobileOpen={mobileDrawerOpen} onToggle={() => setMobileDrawerOpen(!mobileDrawerOpen)} />

      <MobileHeaderActionContext.Provider value={setMobileHeaderAction}>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            minWidth: 0,
            overflowX: 'auto',
          }}
        >
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, pt: 0.5 }}>
              <IconButton onClick={() => setMobileDrawerOpen(true)} size="large">
                <MenuIcon />
              </IconButton>
              {mobileHeaderAction}
            </Box>
          )}

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
      </MobileHeaderActionContext.Provider>
    </Box>
  );
}
