import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
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

  const viewType = location.pathname === '/error' ? 'api-error' : 'not-found';

  const content = useMemo(() => {
    if (viewType === 'not-found') {
      return {
        title: 'No encontramos esa página',
        description:
          'La ruta que intentaste abrir no existe o ya no está disponible. Esto suele pasar cuando un enlace está roto o el contenido fue eliminado.',
        actionLabel: 'Volver al inicio',
      };
    }

    const status = errorData?.status;

    if (status === 403) {
      return {
        title: 'No tenés permiso para ver esto',
        description:
          'Este contenido está restringido por permisos o privacidad. Probá volver atrás o cambiar de cuenta.',
        actionLabel: 'Ir al inicio',
      };
    }

    if (status === 404) {
      return {
        title: 'No pudimos encontrar el recurso',
        description:
          'El elemento que pedimos al servidor ya no existe o fue movido. En una app social esto pasa si un post, perfil o comentario fue eliminado.',
        actionLabel: 'Ir al inicio',
      };
    }

    if (status === 429) {
      return {
        title: 'Demasiadas solicitudes',
        description:
          'La app recibió más pedidos de los que puede procesar ahora. Esperá unos segundos y reintentá.',
        actionLabel: 'Reintentar',
      };
    }

    if (status >= 500 || errorData?.kind === 'server' || errorData?.kind === 'network') {
      return {
        title: 'No pudimos completar la operación',
        description:
          'Hubo un problema con el servidor o con tu conexión. La app se mantiene en una pantalla segura para evitar que la interfaz quede rota.',
        actionLabel: 'Reintentar',
      };
    }

    return {
      title: 'Ocurrió un error inesperado',
      description:
        'No pudimos procesar la operación por un problema inesperado. Podés reintentar o volver al inicio.',
      actionLabel: 'Reintentar',
    };
  }, [errorData, viewType]);

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
            {content.title}
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {content.description}
        </Typography>

        {errorData && viewType === 'api-error' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="bold">
              {errorData.message || 'Se recibió una respuesta inesperada del servidor'}
            </Typography>
            {errorData.status && (
              <Typography variant="caption" display="block">
                Código HTTP: {errorData.status}
              </Typography>
            )}
            {errorData.kind && (
              <Typography variant="caption" display="block">
                Tipo: {errorData.kind}
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
            {content.actionLabel}
          </Button>
          <Button variant="outlined" startIcon={<Home />} onClick={handleVolverInicio}>
            Ir al inicio
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
