import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { AdminAppBar } from '../components/AdminAppBar';

export default function AdminLayout() {
  return (
    <>
      <AdminAppBar />
      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Box>
    </>
  );
}
