import { Fade, Box } from '@mui/material';

const PageTransition = ({ children }) => (
  <Fade in={true} timeout={300}>
    <Box sx={{ width: '100%' }}>
      {children}
    </Box>
  </Fade>
);

export default PageTransition;
