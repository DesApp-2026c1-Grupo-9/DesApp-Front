import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import { DynamicFeed, Groups } from '@mui/icons-material';
import { PageTransition } from '../components/ui';

function SocialPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: 'Feed', path: '/social/feed', icon: <DynamicFeed /> },
    { label: 'Conexiones', path: '/social/conexiones', icon: <Groups /> },
  ];

  const currentTab = tabs.findIndex((t) => location.pathname === t.path);

  return (
    <>
      <Tabs
        value={currentTab === -1 ? 0 : currentTab}
        onChange={(_, i) => navigate(tabs[i].path)}
        sx={{ mb: 3, minHeight: 10, '& .MuiTab-root': { pt: 1, pb: 1, minHeight: 10, '& .MuiTab-iconWrapper': { mb: 0 } } }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.label} icon={tab.icon} iconPosition="start" label={tab.label} />
        ))}
      </Tabs>
      <PageTransition key={location.pathname}>
        <Outlet />
      </PageTransition>
    </>
  );
}

export default SocialPage;
