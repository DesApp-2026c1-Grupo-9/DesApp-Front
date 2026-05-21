import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';

const LoadingSpinner = ({
  loading = true,
  message = 'Cargando...',
  size = 40,
  timeout = 30000,
  onTimeout,
  timeoutMessage = 'La operación está tomando más tiempo del esperado.',
  showTimeoutButton = true,
  fullScreen = false,
  overlay = false,
  overlayColor = 'rgba(255, 255, 255, 0.8)',
}) => {
  const [showTimeout, setShowTimeout] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading) {
      setShowTimeout(false);
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed(prev => prev + 100);
    }, 100);

    if (timeout && elapsed >= timeout && !showTimeout) {
      setShowTimeout(true);
      if (onTimeout) {
        onTimeout();
      }
    }

    return () => clearInterval(interval);
  }, [loading, timeout, elapsed, showTimeout, onTimeout]);

  const handleRetry = useCallback(() => {
    setShowTimeout(false);
    setElapsed(0);
    if (onTimeout) {
      onTimeout(true);
    }
  }, [onTimeout]);

  if (!loading && !showTimeout) {
    return null;
  }

  const spinnerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
        textAlign: 'center',
      }}
    >
      <CircularProgress size={size} color="primary" />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
      {showTimeout && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
            {timeoutMessage}
          </Typography>
          {showTimeoutButton && (
            <Button variant="outlined" onClick={handleRetry}>
              Reintentar
            </Button>
          )}
        </Box>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: overlayColor,
          zIndex: 9999,
        }}
      >
        {spinnerContent}
      </Box>
    );
  }

  if (overlay) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: overlayColor,
          zIndex: 1,
        }}
      >
        {spinnerContent}
      </Box>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;