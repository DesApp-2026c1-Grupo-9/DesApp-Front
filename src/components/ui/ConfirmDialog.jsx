import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { Warning, Error, Info, Help } from '@mui/icons-material';
import { useMemo } from 'react';

const ICONS = {
  warning: Warning,
  error: Error,
  info: Info,
  help: Help,
};

const ConfirmDialog = ({
  open = false,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que deseas continuar?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning',
  confirmButtonProps = {},
  cancelButtonProps = {},
  showIcon = true,
  loading = false,
  showCancelButton = true,
}) => {
  const IconComponent = useMemo(() => {
    return ICONS[type] || ICONS.warning;
  }, [type]);

  const iconColor = useMemo(() => {
    switch (type) {
      case 'error': return 'error.main';
      case 'warning': return 'warning.main';
      case 'info': return 'info.main';
      default: return 'text.secondary';
    }
  }, [type]);

  const confirmColor = useMemo(() => {
    switch (type) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'primary';
    }
  }, [type]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      TransitionProps={{
        timeout: 300,
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {showIcon && (
          <IconComponent color={iconColor} />
        )}
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        {showCancelButton && (
          <Button
            onClick={handleCancel}
            variant="outlined"
            {...cancelButtonProps}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          autoFocus
          {...confirmButtonProps}
        >
          {loading ? 'Procesando...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;