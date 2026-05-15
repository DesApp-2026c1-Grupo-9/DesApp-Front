import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { TopMenu } from '../components/TopMenu';

export default function PublicLayout() {
  return (
    <>
      <TopMenu />
      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Box>
    </>
  );
}
