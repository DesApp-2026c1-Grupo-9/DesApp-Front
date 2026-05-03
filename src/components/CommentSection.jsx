import { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, TextField, Button, IconButton, Collapse, CircularProgress, Typography } from '@mui/material';
import { Comment, ThumbUp } from '@mui/icons-material';
import api from '../api/axiosConfig';

function CommentSection({ postId, currentUserId }) {
  const [comentarios, setComentarios] = useState([]);
  const [showComentarios, setShowComentarios] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Limpiar comentarios al cambiar de usuario para asegurar consistencia en la simulación
  useEffect(() => {
    setComentarios([]);
    setShowComentarios(false);
  }, [currentUserId]);

  const handleLikeComentario = async (comentarioId, liked) => {
    try {
      if (liked) {
        await api.post(`/novedades/${postId}/comentarios/${comentarioId}/unlike`, { usuarioId: currentUserId });
      } else {
        await api.post(`/novedades/${postId}/comentarios/${comentarioId}/like`, { usuarioId: currentUserId });
      }
      
      const actualizarLista = (lista) => lista.map(c => {
        if (c.id === comentarioId) {
          return { ...c, liked: !liked, likesCount: (c.likesCount || 0) + (liked ? -1 : 1) };
        }
        if (c.respuestas) {
          return { ...c, respuestas: actualizarLista(c.respuestas) };
        }
        return c;
      });

      setComentarios(actualizarLista(comentarios));
    } catch (error) {
      console.error('Error al gestionar el like:', error);
    }
  };

  const fetchComentarios = async () => {
    if (comentarios.length > 0) {
      setShowComentarios(!showComentarios);
      return;
    }

    setLoading(true);
    try {
      // Modificación aplicada: inclusión de usuarioId como query param
      const response = await fetch(`http://localhost:3000/api/novedades/${postId}/comentarios?usuarioId=${currentUserId}`);
      const data = await response.json();
      setComentarios(data.data || []);
      setShowComentarios(true);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (comentarioPadreId) => {
    if (!replyText.trim() || !currentUserId) return;
    try {
      const response = await fetch(`http://localhost:3000/api/novedades/${postId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido: replyText.trim(),
          usuarioId: currentUserId,
          comentarioPadreId,
        }),
      });
      const data = await response.json();
      setComentarios(comentarios.map(c =>
        c.id === comentarioPadreId
          ? { ...c, respuestas: [...(c.respuestas || []), data.data] }
          : c
      ));
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error al agregar respuesta:', error);
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
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid #eee' }}>
          <List dense>
            {comentarios.map((com) => (
              <ListItem key={com.id} alignItems="flex-start" sx={{ flexDirection: 'column', mb: 1 }}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <ListItemAvatar>
                    <Avatar src={com.autor?.avatarUrl} sx={{ width: 32, height: 32 }}>
                      {com.autor?.nombre?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flex: 1 }}>
                    <ListItemText
                      primary={
                        <Typography variant="caption" fontWeight="bold">
                          {com.autor?.nombre} {com.autor?.apellido}
                        </Typography>
                      }
                      secondary={com.contenido}
                    />
                    {/* Sección de Likes y Responder - Comentario Principal */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleLikeComentario(com.id, com.liked)}>
                        <ThumbUp sx={{ fontSize: 16, color: com.liked ? 'primary.main' : 'text.secondary' }} />
                        <Typography variant="caption" color={com.liked ? 'primary' : 'text.secondary'}>
                          {com.likesCount || 0}
                        </Typography>
                      </Box>
                      <Button size="small" sx={{ textTransform: 'none', p: 0, minWidth: 0, fontSize: '0.75rem' }} onClick={() => { setReplyingTo(com.id); setReplyText(''); }}>
                        Responder
                      </Button>
                    </Box>
                    {replyingTo === com.id && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, ml: 4 }}>
                        <TextField size="small" placeholder="Escribe una respuesta..." value={replyText} onChange={(e) => setReplyText(e.target.value)} sx={{ flex: 1 }} />
                        <Button size="small" variant="contained" onClick={() => handleAddReply(com.id)} disabled={!replyText.trim()}>Enviar</Button>
                        <Button size="small" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Cancelar</Button>
                      </Box>
                    )}
                  </Box>
                </Box>
                
                {com.respuestas && com.respuestas.length > 0 && (
                  <Box sx={{ ml: 6, mt: 1, width: '90%' }}>
                    {com.respuestas.map((reply) => (
                      <Box key={reply.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                        <Avatar src={reply.autor?.avatarUrl} sx={{ width: 24, height: 24 }}>
                          {reply.autor?.nombre?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, bgcolor: 'white', p: 1, borderRadius: 1 }}>
                          <Typography variant="caption" fontWeight="bold">
                            {reply.autor?.nombre}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {reply.contenido}
                          </Typography>
                          {/* Sección de Likes y Responder - Respuesta */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleLikeComentario(reply.id, reply.liked)}>
                              <ThumbUp sx={{ fontSize: 14, color: reply.liked ? 'primary.main' : 'text.secondary' }} />
                              <Typography variant="caption" color={reply.liked ? 'primary' : 'text.secondary'}>
                                {reply.likesCount || 0}
                              </Typography>
                            </Box>
                            <Button size="small" sx={{ textTransform: 'none', p: 0, minWidth: 0, fontSize: '0.7rem' }} onClick={() => { setReplyingTo(reply.id); setReplyText(''); }}>
                              Responder
                            </Button>
                          </Box>
                          {replyingTo === reply.id && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, ml: 3 }}>
                              <TextField size="small" placeholder="Escribe una respuesta..." value={replyText} onChange={(e) => setReplyText(e.target.value)} sx={{ flex: 1 }} />
                              <Button size="small" variant="contained" onClick={() => handleAddReply(reply.id)} disabled={!replyText.trim()}>Enviar</Button>
                              <Button size="small" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Cancelar</Button>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              sx={{ bgcolor: 'white' }}
            />
            <Button 
              onClick={handleAddComentario} 
              variant="contained" 
              size="small"
              disabled={!nuevoComentario.trim()}
            >
              Comentar
            </Button>
          </Box>
        </Box>
      </Collapse>
    </>
  );
}

export default CommentSection;