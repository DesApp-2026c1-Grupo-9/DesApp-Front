import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography, Box, TextField, InputAdornment, Select, MenuItem,
  FormControl, InputLabel, Button, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControlLabel,
  Radio, RadioGroup, CircularProgress, Alert
} from '@mui/material';
import {
  Search, Add, PictureAsPdf, VideoLibrary,
  ThumbUp, ThumbDown, Delete, Edit, Download, OpenInNew,
  Cloud, GitHub
} from '@mui/icons-material';
import {
  fetchMateriales, fetchMaterias, addMaterial, editMaterial,
  removeMaterial, rateMaterialThunk, setFilter
} from '../features/materiales/slice';
import { SORT_OPTIONS, LINK_TIPO, MAX_FILE_SIZE, isDiscordLink, validateMagicBytes, isValidUrl } from '../features/materiales/constants';

const DiscordIcon = () => (
  <Box component="span" sx={{ 
    display: 'inline-flex', 
    alignItems: 'center',
    color: '#5865F2',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  }}>
    Discord
  </Box>
);

const getLinkIcon = (tipoLink) => {
  switch (tipoLink) {
    case LINK_TIPO.YOUTUBE: return <VideoLibrary sx={{ color: '#FF0000' }} />;
    case LINK_TIPO.DRIVE: return <Cloud sx={{ color: '#4285F4' }} />;
    case LINK_TIPO.GITHUB: return <GitHub sx={{ color: '#333' }} />;
    case LINK_TIPO.DISCORD: return <DiscordIcon />;
    case LINK_TIPO.DROPBOX: return <Cloud sx={{ color: '#0061FF' }} />;
    default: return <OpenInNew sx={{ color: '#1976d2' }} />;
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const MaterialCard = ({ material, currentUserId, onRate, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isOwner = currentUserId === material.creadorId;
  const isDiscord = material.tipoLink === 'discord';

  const totalRatings = material.ratings.upvotes + material.ratings.downvotes;
  const ratio = totalRatings > 0 
    ? Math.round((material.ratings.upvotes / totalRatings) * 100) 
    : null;

  const handleRate = (value) => {
    onRate(material.id, value);
  };

  return (
    <Box sx={{ 
      border: isDiscord ? '2px solid #5865F2' : '1px solid #e0e0e0',
      borderRadius: 2,
      p: 2,
      mb: 2,
      backgroundColor: isDiscord ? '#f5f2ff' : '#fff',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 2 }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minWidth: 48,
          height: 48,
          borderRadius: 1,
          backgroundColor: '#f5f5f5'
        }}>
          {material.tipo === 'file' ? (
            <PictureAsPdf color="error" />
          ) : (
            getLinkIcon(material.tipoLink)
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              {material.titulo}
            </Typography>
            {isDiscord && (
              <Chip 
                icon={<span style={{ fontSize: '0.8rem' }}>🎮</span>}
                label="Discord"
                size="small"
                sx={{ backgroundColor: '#5865F2', color: '#fff' }}
              />
            )}
          </Box>

          {material.descripcion && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {material.descripcion}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {material.tags.map((tag, idx) => (
              <Chip key={idx} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={material.materia.codigo} 
              size="small" 
              sx={{ backgroundColor: '#e3f2fd' }}
            />
            <Typography variant="caption" color="text.secondary">
              {material.fecha} · {material.creador?.nombre}
            </Typography>
            {material.nombreArchivo && (
              <Typography variant="caption" color="text.secondary">
                {material.nombreArchivo} ({formatFileSize(material.tamanho)})
              </Typography>
            )}
            {isDiscord && material.discordInfo && (
              <Typography variant="caption" sx={{ color: '#5865F2', fontWeight: 500 }}>
                📍 {material.discordInfo.servidor} → {material.discordInfo.canal}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {material.tipo === 'file' ? (
              <Button 
                size="small" 
                startIcon={<Download />}
                href={material.url}
                download
              >
                Descargar
              </Button>
            ) : isDiscord ? (
              <Button 
                size="small" 
                variant="contained"
                sx={{ backgroundColor: '#5865F2', '&:hover': { backgroundColor: '#4752C4' } }}
                href={material.url}
                target="_blank"
                rel="noopener"
              >
                Unirse
              </Button>
            ) : (
              <Button 
                size="small" 
                startIcon={<OpenInNew />}
                href={material.url}
                target="_blank"
                rel="noopener"
              >
                Abrir
              </Button>
            )}

            {isOwner && (
              <>
                <IconButton size="small" onClick={() => onEdit(material)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => setShowDeleteConfirm(true)}>
                  <Delete fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <IconButton 
              size="small" 
              onClick={() => handleRate(1)}
              color={material.userRating === 1 ? 'primary' : 'default'}
            >
              <ThumbUp fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>
              {material.ratings.upvotes}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => handleRate(-1)}
              color={material.userRating === -1 ? 'error' : 'default'}
            >
              <ThumbDown fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>
              {material.ratings.downvotes}
            </Typography>
            {ratio !== null && (
              <Chip 
                label={`${ratio}%`} 
                size="small" 
                color={ratio >= 70 ? 'success' : ratio >= 50 ? 'warning' : 'error'}
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar este material?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
          <Button color="error" onClick={() => { onDelete(material.id); setShowDeleteConfirm(false); }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const MaterialUploadDialog = ({ open, onClose, onSave, materias, defaultMateriaId }) => {
  const [formData, setFormData] = useState({
    tipo: 'file',
    titulo: '',
    descripcion: '',
    url: '',
    materiaId: defaultMateriaId || '',
    tags: [],
    archivo: null,
    nombreArchivo: '',
    tamanho: 0
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setFormData({
        tipo: 'file',
        titulo: '',
        descripcion: '',
        url: '',
        materiaId: defaultMateriaId || '',
        tags: [],
        archivo: null,
        nombreArchivo: '',
        tamanho: 0
      });
      setTagInput('');
      setError('');
    }
  }, [open, defaultMateriaId]);

  const handleTipoChange = (e) => {
    setFormData({ ...formData, tipo: e.target.value, url: '', archivo: null, nombreArchivo: '', tamanho: 0 });
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
      setFormData({ ...formData, archivo: file, nombreArchivo: file.name, tamanho: file.size });
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
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, url });
    if (isDiscordLink(url)) {
      const parts = url.split('/');
      const inviteCode = parts[parts.length - 1];
      setFormData(prev => ({
        ...prev,
        url,
        discordInfo: { servidor: 'Servidor de Estudio', canal: 'General' }
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
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
    setFormData({ tipo: 'file', titulo: '', descripcion: '', url: '', materiaId: defaultMateriaId || '', tags: [], archivo: null, nombreArchivo: '', tamanho: 0 });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Material</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl>
            <RadioGroup row value={formData.tipo} onChange={handleTipoChange}>
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

          <FormControl fullWidth>
            <InputLabel>Materia</InputLabel>
            <Select
              value={formData.materiaId}
              label="Materia"
              onChange={(e) => setFormData({ ...formData, materiaId: e.target.value })}
            >
              {materias.map(m => (
                <MenuItem key={m.id} value={m.id}>{m.nombre} ({m.codigo})</MenuItem>
              ))}
            </Select>
          </FormControl>

          {formData.tipo === 'file' ? (
            <Box>
              <Button variant="outlined" component="label">
                Seleccionar archivo
                <input type="file" hidden accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip" onChange={handleFileChange} />
              </Button>
              {formData.nombreArchivo && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {formData.nombreArchivo} ({formatFileSize(formData.tamanho)})
                </Typography>
              )}
            </Box>
          ) : (
            <TextField
              label="URL"
              value={formData.url}
              onChange={handleUrlChange}
              fullWidth
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
            <Button onClick={handleAddTag} variant="outlined">Agregar</Button>
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
        <Button onClick={handleSubmit} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

const Materiales = () => {
  const dispatch = useDispatch();
  const { list: materiales = [], materias = [], loading, error, filter, operationLoading } = useSelector(state => state.materiales);
  const { user } = useSelector(state => state.auth);

  const currentUserId = user?.id || 1;
  const currentUserName = user?.nombre || user?.name || 'Usuario';

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.FECHA_DESC);
  const [materiaFilter, setMateriaFilter] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMateriales({ ...filter, search, sortBy }));
    dispatch(fetchMaterias());
  }, []);

  useEffect(() => {
    dispatch(fetchMateriales({ ...filter, search: search || '', sortBy }));
  }, [search, sortBy, filter]);

  const handleFilterChange = (newFilter) => {
    dispatch(setFilter(newFilter));
  };

  const handleMateriaChange = (e) => {
    const value = e.target.value;
    setMateriaFilter(value);
    handleFilterChange({ materiaId: value || null });
  };

  const handleRate = (id, value) => {
    if (currentUserId) {
      dispatch(rateMaterialThunk({ id, value, usuarioId: currentUserId }));
    }
  };

  const handleAddMaterial = (data) => {
    dispatch(addMaterial({
      ...data,
      creadorId: currentUserId,
      creador: { id: currentUserId, nombre: currentUserName }
    }));
  };

  const handleDeleteMaterial = (id) => {
    dispatch(removeMaterial(id));
  };

  const handleEditMaterial = (material) => {
    console.log('Edit material:', material);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Materiales de Estudio</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setUploadOpen(true)}
        >
          Agregar Material
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar por título, tags o materia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Materia</InputLabel>
          <Select
            value={materiaFilter}
            label="Materia"
            onChange={handleMateriaChange}
          >
            <MenuItem value="">Todas</MenuItem>
            {(materias || []).map(m => (
              <MenuItem key={m.id} value={m.id}>{m.nombre} ({m.codigo})</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Ordenar</InputLabel>
          <Select
            value={sortBy}
            label="Ordenar"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value={SORT_OPTIONS.FECHA_DESC}>Más recientes</MenuItem>
            <MenuItem value={SORT_OPTIONS.FECHA_ASC}>Más antiguos</MenuItem>
            <MenuItem value={SORT_OPTIONS.RATING_DESC}>Mejor valorados</MenuItem>
            <MenuItem value={SORT_OPTIONS.RATING_ASC}>Peor valorados</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (!materiales || materiales.length === 0) ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography color="text.secondary">
            No se encontraron materiales
          </Typography>
        </Box>
      ) : (
        materiales.map(material => (
          <MaterialCard
            key={material.id}
            material={material}
            currentUserId={currentUserId}
            onRate={handleRate}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
          />
        ))
      )}

<MaterialUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSave={handleAddMaterial}
        materias={materias || []}
        defaultMateriaId={materiaFilter || null}
      />
    </Box>
  );
};

export default Materiales;