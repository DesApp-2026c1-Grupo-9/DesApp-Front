import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { Flag, Warning } from '@mui/icons-material';
import { getMotivosDenuncia, createDenuncia, verificarDenunciaExistente } from '../features/materiales/service';

const DenunciaDialog = ({ open, onClose, material, estudianteId }) => {
  const [motivos, setMotivos] = useState([]);
  const [motivoId, setMotivoId] = useState('');
  const [detalle, setDetalle] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [yaDenuncio, setYaDenuncio] = useState(false);

  useEffect(() => {
    if (open) {
      setMotivoId('');
      setDetalle('');
      setError(null);
      setSuccess(null);
      setYaDenuncio(false);
      cargarMotivos();
      verificarYaDenuncio();
    }
  }, [open]);

  const verificarYaDenuncio = async () => {
    try {
      const result = await verificarDenunciaExistente(material.id, estudianteId);
      setYaDenuncio(result);
    } catch {
    }
  };

  const cargarMotivos = async () => {
    setLoading(true);
    try {
      const data = await getMotivosDenuncia();
      setMotivos(data || []);
    } catch {
      setError('Error al cargar motivos de denuncia');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!motivoId) {
      setError('Debes seleccionar un motivo');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await createDenuncia({
        materialId: material.id,
        motivoId,
        detalle: detalle.trim() || undefined,
        estudianteId,
      });
      setSuccess(result.message || 'Denuncia creada exitosamente');
      setTimeout(() => {
        onClose(true);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la denuncia');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !saving && onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Flag color="error" />
        Denunciar Material
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" gutterBottom>
          Material: <strong>{material.titulo}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Seleccioná el motivo por el cual considerás que este material debería ser revisado.
        </Typography>

        {yaDenuncio && (
          <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
            Ya denunciaste este material anteriormente. Tu denuncia está pendiente de revisión.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 2 }} required>
              <InputLabel>Motivo</InputLabel>
              <Select
                value={motivoId}
                label="Motivo"
                onChange={(e) => setMotivoId(e.target.value)}
                disabled={saving}
              >
                {motivos.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Detalle (opcional)"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              multiline
              rows={3}
              disabled={saving}
              placeholder="Añadí información adicional sobre la denuncia..."
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<Flag />}
          onClick={handleSubmit}
          disabled={loading || saving || !motivoId || yaDenuncio}
        >
          {saving ? 'Enviando...' : yaDenuncio ? 'Ya denunciado' : 'Denunciar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DenunciaDialog;
