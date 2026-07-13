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
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Delete,
  Edit,
  Download,
  OpenInNew,
  Flag,
  Warning,
  MoreVert,
} from '@mui/icons-material';
import { getLinkIcon, getFileIcon, formatFileSize, DiscordIcon, LINK_TIPO } from '../utils';

const MaterialCard = ({ material, currentUserId, isActive = true, onRate, onEdit, onDelete, onDenunciar, onViewDetail }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [ownerMenuAnchor, setOwnerMenuAnchor] = useState(null);
  const creadorId = material.creadorId ?? material.estudianteId;
  const isOwner = currentUserId === creadorId;
  const isDiscord = material.tipoLink === LINK_TIPO.DISCORD;

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
        ...(isOwner && { borderLeft: '4px solid #1976d2' }),
        borderRadius: 2,
        p: 2,
        mb: 2,
        backgroundColor: isDiscord ? '#f5f2ff' : '#fff',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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
            getFileIcon(material.nombreArchivo)
          ) : (
            getLinkIcon(material.tipoLink)
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              {material.titulo}
            </Typography>
            {isOwner && (
              <Chip label="Tu material" size="small" color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
            )}
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={material.materia?.nombre || material.materia}
              size="small"
              sx={{ backgroundColor: '#e3f2fd' }}
            />
            <Typography variant="caption" color="text.secondary">
              {material.fecha} ·{' '}
              <Box
                component="span"
                sx={isOwner ? { color: 'primary.main' } : {}}
              >
                {material.creador ? `${material.creador.nombre} ${material.creador.apellido}` : (material.creadorId ? `Usuario ${material.creadorId}` : 'Usuario eliminado')}
              </Box>
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
            {isOwner && material.suspendido && (
              <Chip
                icon={<Warning fontSize="small" />}
                label="Suspendido"
                size="small"
                color="error"
              />
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: { xs: 'center', sm: 'flex-end' },
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {material.tipo === 'file' ? (
              <Button
                size="small"
                startIcon={<Download />}
                href={`http://localhost:3001/api/materiales/${material.id}/descargar`}
                target="_blank"
                disabled={material.suspendido || !isActive}
              >
                Descargar
              </Button>
            ) : isDiscord ? (
              <Button
                size="small"
                variant="contained"
                sx={{ backgroundColor: '#5865F2', '&:hover': { backgroundColor: '#4752C4' }, minWidth: { xs: 'auto', sm: 110 } }}
                href={material.url || '#'}
                target="_blank"
                rel="noopener"
                disabled={material.suspendido || !material.url || !isActive}
              >
                Unirse
              </Button>
            ) : (
              <Button
                size="small"
                startIcon={<OpenInNew />}
                sx={{ minWidth: { xs: 'auto', sm: 110 } }}
                href={material.url || '#'}
                target="_blank"
                rel="noopener"
                disabled={material.suspendido || !material.url || !isActive}
              >
                Abrir
              </Button>
            )}

            {isOwner && isActive && !material.suspendido && (
              <>
                <IconButton
                  size="small"
                  onClick={(e) => setOwnerMenuAnchor(e.currentTarget)}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={ownerMenuAnchor}
                  open={Boolean(ownerMenuAnchor)}
                  onClose={() => setOwnerMenuAnchor(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setOwnerMenuAnchor(null);
                      onEdit(material);
                    }}
                  >
                    <ListItemIcon>
                      <Edit fontSize="small" />
                    </ListItemIcon>
                    Editar
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setOwnerMenuAnchor(null);
                      setShowDeleteConfirm(true);
                    }}
                  >
                    <ListItemIcon>
                      <Delete fontSize="small" color="error" />
                    </ListItemIcon>
                    <Typography color="error">Eliminar</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}

            {isOwner && material.suspendido && onViewDetail && (
              <>
                <IconButton
                  size="small"
                  onClick={(e) => setOwnerMenuAnchor(e.currentTarget)}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={ownerMenuAnchor}
                  open={Boolean(ownerMenuAnchor)}
                  onClose={() => setOwnerMenuAnchor(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setOwnerMenuAnchor(null);
                      onViewDetail(material.id);
                    }}
                  >
                    <ListItemIcon>
                      <OpenInNew fontSize="small" />
                    </ListItemIcon>
                    Ver detalle
                  </MenuItem>
                </Menu>
              </>
            )}

            {!isOwner && isActive && onDenunciar && (
              <>
                <IconButton
                  size="small"
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null);
                      onDenunciar(material);
                    }}
                  >
                    <ListItemIcon>
                      <Flag fontSize="small" color="warning" />
                    </ListItemIcon>
                    Reportar
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <IconButton
              size="small"
              onClick={() => handleRate(1)}
              color={material.userRating === 1 ? 'primary' : 'default'}
              disabled={!isActive}
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
              disabled={!isActive}
            >
              <ThumbDown fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: 30, textAlign: 'center' }}>
              {material.ratings.downvotes}
            </Typography>
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