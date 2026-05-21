import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PictureAsPdf,
  ThumbUp,
  ThumbDown,
  Delete,
  Edit,
  Download,
  OpenInNew,
} from '@mui/icons-material';
import { getLinkIcon, formatFileSize, DiscordIcon, LINK_TIPO } from '../utils';

const MaterialCard = ({ material, currentUserId, onRate, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isOwner = currentUserId === material.creadorId;
  const isDiscord = material.tipoLink === LINK_TIPO.DISCORD;

  const totalRatings = material.ratings.upvotes + material.ratings.downvotes;
  const ratio =
    totalRatings > 0
      ? Math.round((material.ratings.upvotes / totalRatings) * 100)
      : null;

  const handleRate = (value) => {
    onRate(material.id, value);
  };

  const handleDelete = () => {
    onDelete(material.id);
    setShowDeleteConfirm(false);
  };

  return (
    <Box
      sx={{
        border: isDiscord ? '2px solid #5865F2' : '1px solid #e0e0e0',
        borderRadius: 2,
        p: 2,
        mb: 2,
        backgroundColor: isDiscord ? '#f5f2ff' : '#fff',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 48,
            height: 48,
            borderRadius: 1,
            backgroundColor: '#f5f5f5',
          }}
        >
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
              <Chip
                key={idx}
                label={tag.nombre || tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={material.materia?.nombre || material.materia}
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
              <Typography
                variant="caption"
                sx={{ color: '#5865F2', fontWeight: 500 }}
              >
                📍 {material.discordInfo.servidor} → {material.discordInfo.canal}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {isOwner && (
              <>
                <IconButton size="small" onClick={() => onEdit(material)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </>
            )}

            {material.tipo === 'file' ? (
              <Button
                size="small"
                startIcon={<Download />}
                href={`http://localhost:3001/api/materiales/${material.id}/descargar`}
                target="_blank"
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
          <Button color="error" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaterialCard;