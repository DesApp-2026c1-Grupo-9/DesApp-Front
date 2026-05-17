import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
} from '@mui/material';
import { ErrorOutline, Home, Refresh } from '@mui/icons-material';

const ERROR_STORAGE_KEY = 'app_unexpected_error';

export default function AppErrorPage() {
  const navigate = useNavigate();

  const errorData = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(ERROR_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }, []);

  const handleVolverInicio = () => {
    navigate('/');
  };

  const handleReintentar = () => {
    window.location.reload();
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <ErrorOutline color="error" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">
            Ocurrio un error inesperado
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          No pudimos procesar la operacion por un problema inesperado.
          Podes reintentar o volver al inicio.
        </Typography>

        {errorData && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="bold">
              {errorData.message || 'Se recibio una respuesta inesperada del servidor'}
            </Typography>
            {errorData.status && (
              <Typography variant="caption" display="block">
                Codigo HTTP: {errorData.status}
              </Typography>
            )}
            {errorData.endpoint && (
              <Typography variant="caption" display="block">
                Endpoint: {errorData.endpoint}
              </Typography>
            )}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<Refresh />} onClick={handleReintentar}>
            Reintentar
          </Button>
          <Button variant="outlined" startIcon={<Home />} onClick={handleVolverInicio}>
            Ir al inicio
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
