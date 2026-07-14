import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  Alert,
  Typography,
} from '@mui/material';
import {
  formatFileSize,
  isDiscordLink,
  isValidUrl,
  MAX_FILE_SIZE,
  validateMagicBytes,
  parseDiscordInvite,
} from '../utils';

const MaterialUploadDialog = ({
  open,
  onClose,
  onSave,
  materias,
  defaultMateriaId,
  material,
}) => {
  const isEdit = !!material;

  const [formData, setFormData] = useState({
    tipo: 'file',
    titulo: '',
    descripcion: '',
    url: '',
    materiaId: defaultMateriaId || '',
    tags: [],
    archivo: null,
    nombreArchivo: '',
    tamanho: 0,
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    if (material) {
      setFormData({
        tipo: material.tipo || 'file',
        titulo: material.titulo || '',
        descripcion: material.descripcion || '',
        url: material.url || '',
        materiaId: material.materiaId || '',
        tags: material.tags?.map((t) => t.nombre || t) || [],
        archivo: null,
        nombreArchivo: material.nombreArchivo || '',
        tamanho: material.tamanho || 0,
      });
    } else {
      setFormData({
        tipo: 'file',
        titulo: '',
        descripcion: '',
        url: '',
        materiaId: defaultMateriaId || '',
        tags: [],
        archivo: null,
        nombreArchivo: '',
        tamanho: 0,
      });
    }
    setTagInput('');
    setError('');
  }, [open, defaultMateriaId, material]);

  const handleTipoChange = (e) => {
    setFormData({
      ...formData,
      tipo: e.target.value,
      url: '',
      archivo: null,
      nombreArchivo: '',
      tamanho: 0,
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('El archivo supera el límite de 25 MB');
        return;
      }
      const validation = await validateMagicBytes(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
      setFormData({
        ...formData,
        archivo: file,
        nombreArchivo: file.name,
        tamanho: file.size,
      });
      setError('');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, url });

    if (isDiscordLink(url)) {
      const discordInfo = parseDiscordInvite(url);
      setFormData((prev) => ({
        ...prev,
        url,
        discordInfo,
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (isEdit) {
      onSave({
        id: material.id,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        tags: formData.tags,
      });
      setError('');
      onClose();
      return;
    }

    if (!formData.materiaId) {
      setError('Selecciona una materia');
      return;
    }
    if (formData.tipo === 'file' && !formData.archivo && !formData.nombreArchivo) {
      setError('Selecciona un archivo');
      return;
    }
    if (formData.tipo === 'link') {
      if (!formData.url.trim()) {
        setError('Ingresa una URL');
        return;
      }
      if (!isValidUrl(formData.url.trim())) {
        setError('Ingresa una URL válida (http:// o https://)');
        return;
      }
    }
    onSave(formData);
    setFormData({
      tipo: 'file',
      titulo: '',
      descripcion: '',
      url: '',
      materiaId: defaultMateriaId || '',
      tags: [],
      archivo: null,
      nombreArchivo: '',
      tamanho: 0,
    });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Editar Material' : 'Agregar Material'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl>
            <RadioGroup
              row
              value={formData.tipo}
              onChange={handleTipoChange}
              disabled={isEdit}
            >
              <FormControlLabel value="file" control={<Radio />} label="Archivo" />
              <FormControlLabel value="link" control={<Radio />} label="Enlace" />
            </RadioGroup>
          </FormControl>

          <TextField
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            fullWidth
            required
          />

          <TextField
            label="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />

          <FormControl fullWidth disabled={isEdit}>
            <InputLabel>Materia</InputLabel>
            <Select
              value={formData.materiaId}
              label="Materia"
              onChange={(e) => setFormData({ ...formData, materiaId: e.target.value })}
              MenuProps={{
                PaperProps: { style: { maxHeight: 280, maxWidth: '90vw' } }
              }}
            >
              {materias.map((m) => (
                <MenuItem key={m.id} value={m.id} sx={{ whiteSpace: 'normal' }}>
                  {m.nombre} ({m.codigo})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {formData.tipo === 'file' ? (
            <Box>
              {isEdit ? (
                <Typography variant="body2" color="text.secondary">
                  Archivo: {formData.nombreArchivo || 'Sin archivo'} (
                  {formatFileSize(formData.tamanho)})
                </Typography>
              ) : (
                <>
                  <Button variant="outlined" component="label">
                    Seleccionar archivo
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {formData.nombreArchivo && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {formData.nombreArchivo} ({formatFileSize(formData.tamanho)})
                    </Typography>
                  )}
                </>
              )}
            </Box>
          ) : (
            <TextField
              label="URL"
              value={formData.url}
              onChange={handleUrlChange}
              fullWidth
              disabled={isEdit}
              placeholder="https://youtube.com, https://discord.gg/invite/..., etc."
            />
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              size="small"
            />
            <Button onClick={handleAddTag} variant="outlined">
              Agregar
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {formData.tags.map((tag, idx) => (
              <Chip key={idx} label={tag} onDelete={() => handleRemoveTag(tag)} size="small" />
            ))}
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEdit ? 'Actualizar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialUploadDialog;