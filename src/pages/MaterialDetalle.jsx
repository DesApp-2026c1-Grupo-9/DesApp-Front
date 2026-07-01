import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography, Box, Button, Chip, CircularProgress, Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { getMaterialById } from '../features/materiales/service';
import { rateMaterialThunk } from '../features/materiales/slice';
import { PageContainer } from '../components/ui';
import MaterialCard from '../components/MaterialCard';

export default function MaterialDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const estudianteId = user?.estudianteId || user?.Estudiante?.id || user?.id;
  const denunciaId = location.state?.denunciaId;

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMaterialById(id)
      .then((data) => {
        setMaterial(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Error al cargar el material');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRate = useCallback((materialId, value) => {
    if (estudianteId) {
      dispatch(rateMaterialThunk({ id: materialId, value, estudianteId }));
    }
  }, [dispatch, estudianteId]);

  if (loading) {
    return (
      <PageContainer >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer >
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Volver
        </Button>
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  if (!material) return null;

  const denunciasPendientes = material.denunciasPendientes || 0;
  const denunciasConfirmadas = material.denunciasConfirmadas || 0;
  const totalDenuncias = denunciasPendientes + denunciasConfirmadas;

  return (
    <PageContainer >
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Volver
      </Button>

      <MaterialCard
        material={material}
        currentUserId={estudianteId}
        isActive={!material.suspendido}
        onRate={handleRate}
      />

      {totalDenuncias > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Información de denuncias
          </Typography>
          <Typography variant="body2">
            Este material tiene {denunciasPendientes} denuncia(s) pendiente(s) y {denunciasConfirmadas} confirmada(s).
          </Typography>
          {denunciaId && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Denuncia específica ID: {denunciaId}
            </Typography>
          )}
        </Alert>
      )}
    </PageContainer>
  );
}
