import { useLocation, Outlet } from 'react-router-dom';
import { PageTransition } from '../components/ui';

function AcademicoPage() {
  const location = useLocation();

  return (
    <PageTransition key={location.pathname}>
      <Outlet />
    </PageTransition>
  );
}

export default AcademicoPage;
