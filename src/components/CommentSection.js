import { useState } from 'react';
import { Box, List, ListItem, ListItemAvatar, ListItemText, Avatar, TextField, Button, IconButton, Collapse, CircularProgress, Typography, Stack } from '@mui/material';
import { Comment } from '@mui/icons-material';

function CommentItem({ comentario, currentUserId, onReply, replyingTo, setReplyingTo, postId }) {
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const isReplying = replyingTo === comentario.id;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await onReply(comentario.id, replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  return (
    <ListItem alignItems="flex-start" sx={{ pl: comentario.comentarioPadreId ? 4 : 0, flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', width: '100%' }}>
        <ListItemAvatar>
          <Avatar src={comentario.autor?.avatarUrl} sx={{ width: 32, height: 32 }}>
            {comentario.autor?.nombre?.charAt(0)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<Typography variant="caption" fontWeight="bold">{comentario.autor?.nombre} {comentario.autor?.apellido}</Typography>}
          secondary={
            <Typography variant="body2" component="span">{comentario.contenido}</Typography>
          }
        />
      </Box>
      <Stack direction="row" spacing={1} sx={{ ml: 7, mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => setReplyingTo(isReplying ? null : comentario.id)}>
          Responder
        </Typography>
        {comentario.respuestas && comentario.respuestas.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer' }} onClick={() => setShowReplies(!showReplies)}>
            {showReplies ? 'Ocultar' : `${comentario.respuestas.length} respuesta${comentario.respuestas.length > 1 ? 's' : ''}`}
          </Typography>
        )}
      </Stack>
      {isReplying && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1, ml: 7, width: 'calc(100% - 56px)' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Escribe una respuesta..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <Button onClick={handleReply} variant="contained" size="small">Responder</Button>
        </Box>
      )}
      {comentario.respuestas && comentario.respuestas.length > 0 && (
        <Collapse in={showReplies} sx={{ width: '100%', pl: 4 }}>
          <List dense>
            {comentario.respuestas.map((reply) => (
              <CommentItem
                key={reply.id}
                comentario={reply}
                currentUserId={currentUserId}
                onReply={onReply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                postId={postId}
              />
            ))}
          </List>
        </Collapse>
      )}
    </ListItem>
  );
}

export default function CommentSection({ postId, currentUserId }) {
  const [comentarios, setComentarios] = useState([]);
  const [showComentarios, setShowComentarios] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchComentarios = async () => {
    if (comentarios.length > 0 && showComentarios) {
      setShowComentarios(false);
      return;
    }
    if (comentarios.length > 0) {
      setShowComentarios(true);
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

  const handleReply = async (comentarioPadreId, contenido) => {
    try {
      const response = await fetch(`http://localhost:3000/api/novedades/${postId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido, usuarioId: currentUserId, comentarioPadreId }),
      });
      const data = await response.json();
      setComentarios(comentarios.map(c => {
        if (c.id === comentarioPadreId) {
          return { ...c, respuestas: [...(c.respuestas || []), data.data] };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error al responder comentario:', error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
        <IconButton onClick={fetchComentarios} color={showComentarios ? 'primary' : 'default'}>
          <Comment fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {comentarios.reduce((acc, c) => acc + 1 + (c.respuestas?.length || 0), 0) || 0}
        </Typography>
        {loading && <CircularProgress size={20} />}
      </Box>

      <Collapse in={showComentarios}>
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          <List dense>
            {comentarios.map((com) => (
              <CommentItem
                key={com.id}
                comentario={com}
                currentUserId={currentUserId}
                onReply={handleReply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                postId={postId}
              />
            ))}
          </List>
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
