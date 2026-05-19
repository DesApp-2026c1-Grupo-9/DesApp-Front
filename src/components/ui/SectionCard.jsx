import { Card, CardHeader, CardContent, CardActions, Typography, Box, Divider } from '@mui/material';
import { useMemo } from 'react';

const SectionCard = ({
  title,
  subtitle,
  action,
  children,
  headerColor = 'transparent',
  elevation = 2,
  hoverable = true,
  bordered = false,
  noPadding = false,
  noHeaderPadding = false,
  showDivider = true,
  headerProps = {},
  contentProps = {},
  actionPosition = 'right',
}) => {
  const cardStyles = useMemo(() => ({
    elevation: elevation,
    border: bordered ? '1px solid' : 'none',
    borderColor: 'divider',
    transition: 'box-shadow 0.3s ease-in-out',
    ...(hoverable && {
      '&:hover': {
        boxShadow: '0px 8px 16px -4px rgba(0,0,0,0.2),0px 12px 24px -4px rgba(0,0,0,0.14)',
      },
    }),
  }), [elevation, bordered, hoverable]);

  const headerStyles = useMemo(() => ({
    backgroundColor: headerColor,
    py: noHeaderPadding ? 1 : 2,
    px: noHeaderPadding ? 2 : 3,
    ...(actionPosition === 'bottom' && {
      pb: 0,
    }),
  }), [headerColor, noHeaderPadding, actionPosition]);

  const contentStyles = useMemo(() => ({
    p: noPadding ? 0 : 3,
  }), [noPadding]);

  return (
    <Card sx={cardStyles}>
      {(title || action) && (
        <Box sx={headerStyles}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Box>
              {title && (
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {action && (
              <Box sx={{ ml: 2 }}>
                {action}
              </Box>
            )}
          </Box>
        </Box>
      )}
      {showDivider && (title || action) && <Divider />}
      {actionPosition === 'bottom' ? (
        <>
          <CardContent sx={contentStyles} {...contentProps}>
            {children}
          </CardContent>
          {action && (
            <>
              <Divider />
              <CardActions sx={{ px: 3, py: 2 }}>
                {action}
              </CardActions>
            </>
          )}
        </>
      ) : (
        action ? (
          <>
            <CardContent sx={contentStyles} {...contentProps}>
              {children}
            </CardContent>
            <Divider />
            <CardActions sx={{ px: 3, py: 2 }}>
              {action}
            </CardActions>
          </>
        ) : (
          <CardContent sx={contentStyles} {...contentProps}>
            {children}
          </CardContent>
        )
      )}
    </Card>
  );
};

export default SectionCard;