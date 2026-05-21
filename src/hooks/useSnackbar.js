import { useState, useCallback } from 'react';

const useSnackbar = ({
  defaultSeverity = 'info',
  autoHideDuration = 4000,
  anchorOrigin = { vertical: 'top', horizontal: 'center' },
} = {}) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: defaultSeverity,
  });

  const showSnackbar = useCallback((message, severity = defaultSeverity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, [defaultSeverity]);

  const showSuccess = useCallback((message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success',
    });
  }, []);

  const showError = useCallback((message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error',
    });
  }, []);

  const showWarning = useCallback((message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'warning',
    });
  }, []);

  const showInfo = useCallback((message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'info',
    });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const clearSnackbar = useCallback(() => {
    setSnackbar({
      open: false,
      message: '',
      severity: defaultSeverity,
    });
  }, [defaultSeverity]);

  return {
    snackbar,
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeSnackbar,
    clearSnackbar,
    autoHideDuration,
    anchorOrigin,
  };
};

export default useSnackbar;