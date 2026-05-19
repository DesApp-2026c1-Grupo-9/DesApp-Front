import { Box, Typography, Button } from '@mui/material';
import { Search, ErrorOutline, FolderOpen, Inbox } from '@mui/icons-material';
import { useMemo } from 'react';

const ICONS = {
  search: Search,
  error: ErrorOutline,
  folder: FolderOpen,
  inbox: Inbox,
  default: Inbox,
};

const EmptyState = ({
  title = 'No hay elementos',
  message = 'No se encontró información para mostrar.',
  icon = 'inbox',
  actionLabel,
  onAction,
  actionDisabled = false,
  secondaryActionLabel,
  onSecondaryAction,
  centered = true,
  illustration = null,
}) => {
  const IconComponent = useMemo(() => {
    if (typeof icon === 'string') {
      return ICONS[icon] || ICONS.default;
    }
    return icon || ICONS.default;
  }, [icon]);

  const containerStyles = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: centered ? 'center' : 'flex-start',
    justifyContent: 'center',
    py: 6,
    px: 3,
    textAlign: centered ? 'center' : 'left',
  }), [centered]);

  const iconStyles = useMemo(() => ({
    fontSize: 64,
    color: 'text.disabled',
    mb: 2,
  }), []);

  return (
    <Box sx={containerStyles}>
      {illustration ? (
        <Box sx={{ mb: 3, maxWidth: 200 }}>{illustration}</Box>
      ) : (
        <IconComponent sx={iconStyles} />
      )}
      <Typography variant="h6" color="text.primary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {message}
      </Typography>
      {actionLabel && (
        <Button
          variant="contained"
          onClick={onAction}
          disabled={actionDisabled}
          sx={{ mb: secondaryActionLabel ? 1 : 0 }}
        >
          {actionLabel}
        </Button>
      )}
      {secondaryActionLabel && (
        <Button
          variant="text"
          onClick={onSecondaryAction}
          sx={{ mt: 1 }}
        >
          {secondaryActionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;