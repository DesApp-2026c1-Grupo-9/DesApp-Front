import { Box } from '@mui/material';
import { useMemo } from 'react';

const PageContainer = ({
  children,
  maxWidth = 1200,
  padding = 3,
  centered = false,
  backgroundColor = 'transparent',
  minHeight = 'auto',
  disablePadding = false,
}) => {
  const containerStyles = useMemo(() => ({
    p: disablePadding ? 0 : padding,
    maxWidth: maxWidth === false ? 'none' : maxWidth,
    margin: centered ? '0 auto' : '0 auto',
    backgroundColor,
    minHeight,
    width: '100%',
  }), [maxWidth, padding, centered, backgroundColor, minHeight, disablePadding]);

  return (
    <Box sx={containerStyles}>
      {children}
    </Box>
  );
};

export default PageContainer;