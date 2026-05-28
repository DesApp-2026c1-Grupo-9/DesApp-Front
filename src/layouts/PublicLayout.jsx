import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { TopMenu } from '../components/TopMenu';
import { AdminAppBar } from '../components/AdminAppBar';

export default function PublicLayout() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const esAdmin = user?.rol === 'administrador';

  if (esAdmin && location.pathname !== '/mi-perfil') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      {esAdmin ? <AdminAppBar /> : <TopMenu />}
      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Box>
    </>
  );
}
