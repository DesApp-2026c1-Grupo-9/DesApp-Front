import { useState } from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, TextField, Button, IconButton, Collapse, CircularProgress, Typography } from '@mui/material';
import { Comment } from '@mui/icons-material';

function CommentSection({ postId, currentUserId }) {
  const [comentarios, setComentarios] = useState([]);
  const [showComentarios, setShowComentarios] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComentarios = async () => {
    if (comentarios.length > 0) {
      setShowComentarios(!showComentarios);
      return;
    }
    setLoading(true);
    try {
       const response = await fetch(`http://localhost:3000/api/novedades/${postId}/comentarios`);
      const data = await response.json();
      setComentarios(data.data || []);
      setShowComentarios(true);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComentario = async () => {
    if (!nuevoComentario.trim() || !currentUserId) return;
    try {
       const response = await fetch(`http://localhost:3000/api/novedades/${postId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: nuevoComentario.trim(), usuarioId: currentUserId }),
      });
      const data = await response.json();
      setComentarios([...comentarios, data.data]);
      setNuevoComentario('');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
        <IconButton onClick={fetchComentarios} color={showComentarios ? 'primary' : 'default'}>
          <Comment fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {comentarios.length || 0}
        </Typography>
        {loading && <CircularProgress size={20} />}
      </Box>

      <Collapse in={showComentarios}>
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <List dense>
            {comentarios.slice(0, 1).map((com) => (
              <ListItem key={com.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={com.autor?.avatarUrl} sx={{ width: 32, height: 32 }}>
                    {com.autor?.nombre?.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="caption" fontWeight="bold">{com.autor?.nombre}</Typography>}
                  secondary={com.contenido}
                />
              </ListItem>
            ))}
            {comentarios.length > 1 && !showComentarios && (
              <Button size="small" onClick={() => setShowComentarios(true)}>
                Ver todos los {comentarios.length} comentarios
              </Button>
            )}
          </List>
          {showComentarios && comentarios.length > 1 && (
            <List dense>
              {comentarios.slice(1).map((com) => (
                <ListItem key={com.id} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar src={com.autor?.avatarUrl} sx={{ width: 32, height: 32 }}>
                      {com.autor?.nombre?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="caption" fontWeight="bold">{com.autor?.nombre}</Typography>}
                    secondary={com.contenido}
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
            />
            <Button onClick={handleAddComentario} variant="contained" size="small">Comentar</Button>
          </Box>
        </Box>
      </Collapse>
    </>
  );
}

export default CommentSection;
