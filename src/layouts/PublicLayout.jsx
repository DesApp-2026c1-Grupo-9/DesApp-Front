import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { TopMenu } from '../components/TopMenu';
import { AdminAppBar } from '../components/AdminAppBar';
import { useAuth } from '../context/AuthContext';
import { PageTransition, LoadingSpinner } from '../components/ui';

export default function PublicLayout() {
  const { loading: authLoading } = useAuth();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const esAdmin = user?.rol === 'administrador';
  const routeKey = '/' + location.pathname.split('/')[1];

  if (authLoading) {
    return <LoadingSpinner fullScreen message="Inicializando sesión..." />;
  }

  if (esAdmin && location.pathname !== '/mi-perfil') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      {esAdmin ? <AdminAppBar /> : <TopMenu />}
      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <PageTransition key={routeKey}>
          <Outlet />
        </PageTransition>
      </Box>
    </>
  );
}
