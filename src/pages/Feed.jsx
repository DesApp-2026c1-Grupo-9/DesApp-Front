import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  TextField,
  Button,
  Box,
  IconButton,
  Divider,
  Paper,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Delete,
  MoreVert,
  School,
  CheckCircle,
  Edit,
  Comment,
} from '@mui/icons-material';
import { fetchFeed, addPost, removePost, toggleLike, editPost } from '../features/feed/slice';
import { switchStudent } from '../features/auth/slice';

const TIPO_EVENTO = {
  INSCRIPCION: 'inscripcion',
  REGULARIZACION: 'regularizacion',
  APROBACION: 'aprobacion',
};

const TIPO_POST = {
  PUBLICACION: 'publicacion',
  EVENTO_ACADEMICO: 'evento_academico',
};

const getIconForTipoEvento = (tipo) => {
  switch (tipo) {
    case TIPO_EVENTO.INSCRIPCION: return <School fontSize="small" />;
    case TIPO_EVENTO.REGULARIZACION: return <Edit fontSize="small" />;
    case TIPO_EVENTO.APROBACION: return <CheckCircle fontSize="small" />;
    default: return null;
  }
};

const getLabelForTipoEvento = (tipo) => {
  switch (tipo) {
    case TIPO_EVENTO.INSCRIPCION: return 'se inscribió a';
    case TIPO_EVENTO.REGULARIZACION: return 'regularizó';
    case TIPO_EVENTO.APROBACION: return 'aprobó';
    default: return '';
  }
};

function PostCard({ post, currentUserId, onDelete, onToggleLike, onEdit, onUpdateComentariosCount }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.contenido || '');
  const isOwner = String(post.autor?.id) === String(currentUserId);

  const [comentarios, setComentarios] = useState([]);
  const [showComentarios, setShowComentarios] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [comentarioMenuEl, setComentarioMenuEl] = useState(null);
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
  const [editandoComentarioId, setEditandoComentarioId] = useState(null);
  const [editComentarioContent, setEditComentarioContent] = useState('');
  const [replyMenuEl, setReplyMenuEl] = useState(null);
  const [replySeleccionada, setReplySeleccionada] = useState(null);
  const [editandoReplyId, setEditandoReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');

  const handleMenuClick = (event) => { event.stopPropagation(); setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => setAnchorEl(null);
  const handleDelete = () => { onDelete(post.id); handleMenuClose(); };

  const handleEditSubmit = () => {
    if (!editContent.trim()) return;
    onEdit(post.id, { contenido: editContent.trim(), titulo: editContent.trim().substring(0, 50) });
    setIsEditing(false);
  };

  const fetchComentarios = async () => {
    if (showComentarios) {
      setShowComentarios(false);
      setVisibleCount(1);
      return;
    }
    if (comentarios.length > 0) {
      setShowComentarios(true);
      return;
    }
    setLoadingComentarios(true);
    try {
      const response = await fetch(`http://localhost:3000/api/novedades/${post.id}/comentarios`);
      const data = await response.json();
      setComentarios(data.data || []);
      setShowComentarios(true);
    } catch (error) { console.error(error); } finally { setLoadingComentarios(false); }
  };

  const handleAddComentario = async () => {
    if (!nuevoComentario.trim()) return;
    try {
      const response = await fetch(`http://localhost:3000/api/novedades/${post.id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: nuevoComentario.trim(), usuarioId: currentUserId }),
      });
      const data = await response.json();
      setComentarios([...comentarios, data.data]);
      setNuevoComentario('');
      setVisibleCount(prev => prev + 1);
      if (onUpdateComentariosCount) onUpdateComentariosCount(post.id, (post.comentariosCount || 0) + 1);
    } catch (error) { console.error(error); }
  };

  const handleReply = async (comentarioPadreId, contenido) => {
    try {
      const response = await fetch(`http://localhost:3000/api/novedades/${post.id}/comentarios`, {
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
      setReplyingTo(null);
      setReplyText('');
      if (onUpdateComentariosCount) onUpdateComentariosCount(post.id, (post.comentariosCount || 0) + 1);
    } catch (error) { console.error(error); }
  };

  const handleEditComentario = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/novedades/${post.id}/comentarios/${editandoComentarioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: editComentarioContent.trim(), usuarioId: currentUserId }),
      });
      if (res.ok) {
        const d = await res.json();
        setComentarios(comentarios.map(c => c.id === editandoComentarioId ? d.data : c));
        setEditandoComentarioId(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteReply = async () => {
    if (!replySeleccionada) return;
    try {
      const res = await fetch(`http://localhost:3000/api/novedades/${post.id}/comentarios/${replySeleccionada.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: currentUserId }),
      });
      if (res.ok) {
        setComentarios(comentarios.map(c => {
          if (c.respuestas) {
            return { ...c, respuestas: c.respuestas.filter(r => r.id !== replySeleccionada.id) };
          }
          return c;
        }));
        onUpdateComentariosCount(post.id, Math.max(0, (post.comentariosCount || 0) - 1));
      }
    } catch (err) { console.error(err); }
    setReplyMenuEl(null);
  };

  const formatFechaComentario = (fecha) => {
    const date = new Date(fecha);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
  };

  const isEvento = post.tipo === TIPO_POST.EVENTO_ACADEMICO;

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
      {isEvento ? (
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={post.autor?.avatar} sx={{ width: 45, height: 45 }}>{post.autor?.nombre?.charAt(0)}</Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {post.autor?.nombre} {post.autor?.apellido}
              </Typography>
              <Chip icon={getIconForTipoEvento(post.tipoEvento)} label={getLabelForTipoEvento(post.tipoEvento)} size="small" color="primary" variant="outlined" />
            </Box>
            <Typography variant="caption" color="text.secondary">{new Date(post.fecha).toLocaleString()}</Typography>
          </Box>
        </CardContent>
      ) : (
        <CardHeader
          avatar={<Avatar src={post.autor?.avatar} sx={{ width: 45, height: 45 }}>{post.autor?.nombre?.charAt(0)}</Avatar>}
          title={<Typography variant="subtitle1" fontWeight="bold">{post.autor?.nombre} {post.autor?.apellido}</Typography>}
          subheader={new Date(post.fecha).toLocaleString()}
          action={isOwner && <IconButton onClick={handleMenuClick}><MoreVert /></IconButton>}
        />
      )}

      <CardContent sx={{ px: 3 }}>
        {isEditing ? (
          <Box>
            <TextField fullWidth multiline rows={3} value={editContent} onChange={(e) => setEditContent(e.target.value)} sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button variant="contained" onClick={handleEditSubmit}>Guardar</Button>
            </Box>
          </Box>
        ) : (
          <>
            {isEvento ? (
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School color="primary" /> {post.materia?.nombre}
              </Typography>
            ) : (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{post.contenido}</Typography>
            )}
          </>
        )}
      </CardContent>

      <Divider />
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
        <IconButton onClick={() => onToggleLike(post.id, post.liked)} color={post.liked ? 'primary' : 'default'}>
          {post.liked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
        </IconButton>
        <Typography variant="body2" sx={{ mr: 3 }}>{post.likesCount || 0}</Typography>
        <IconButton onClick={fetchComentarios} color={showComentarios ? 'primary' : 'default'}>
          <Comment fontSize="small" />
        </IconButton>
        <Typography variant="body2">
          {post.comentariosCount ?? comentarios.reduce((acc, c) => acc + 1 + (c.respuestas?.length || 0), 0)}
        </Typography>
        {loadingComentarios && <CircularProgress size={20} sx={{ ml: 1 }} />}
      </Box>

      <Collapse in={showComentarios}>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid #eee' }}>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 2 }}>
            <TextField 
              fullWidth 
              size="small" 
              placeholder="Escribe un comentario..." 
              value={nuevoComentario} 
              onChange={(e) => setNuevoComentario(e.target.value)} 
            />
            <Button variant="contained" size="small" onClick={handleAddComentario} disabled={!nuevoComentario.trim()}>Enviar</Button>
          </Box>

          {comentarios.length > visibleCount && (
            <Button fullWidth size="small" onClick={() => setVisibleCount(prev => prev + 5)} sx={{ mb: 2, textTransform: 'none' }}>
              Cargar anteriores ({comentarios.length - visibleCount} restantes)
            </Button>
          )}

          <List dense>
            {comentarios.slice(Math.max(0, comentarios.length - visibleCount))
              .map((com) => (
                <Box key={com.id}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      String(com.autor?.id) === String(currentUserId) && (
                        <IconButton edge="end" size="small" onClick={(e) => {
                          setComentarioSeleccionado(com);
                          setComentarioMenuEl(e.currentTarget);
                        }}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={com.autor?.avatarUrl} sx={{ width: 35, height: 35 }}>{com.autor?.nombre?.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    
                    {editandoComentarioId === com.id ? (
                      <Box sx={{ flex: 1 }}>
                        <TextField fullWidth size="small" multiline value={editComentarioContent} onChange={(e) => setEditComentarioContent(e.target.value)} />
                        <Button size="small" onClick={handleEditComentario}>Guardar</Button>
                        <Button size="small" onClick={() => setEditandoComentarioId(null)}>Cancelar</Button>
                      </Box>
                    ) : (
                      <Box sx={{ flex: 1 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                                {com.autor?.nombre} {com.autor?.apellido}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                • {formatFechaComentario(com.createdAt)}
                              </Typography>
                              {com.editedAt && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  • editado
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={<Typography variant="body2" color="text.primary">{com.contenido}</Typography>}
                        />
                        <Typography variant="caption" sx={{ ml: 1, cursor: 'pointer', color: 'text.secondary' }} onClick={() => setReplyingTo(replyingTo === com.id ? null : com.id)}>
                          Responder
                        </Typography>
                        {com.respuestas && com.respuestas.length > 0 && (
                          <Typography variant="caption" sx={{ ml: 2, cursor: 'pointer', color: 'text.secondary' }}>
                            {com.respuestas.length} respuesta{com.respuestas.length > 1 ? 's' : ''}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </ListItem>
                  {replyingTo === com.id && (
                    <Box sx={{ display: 'flex', gap: 1, ml: 7, mb: 1 }}>
                      <TextField fullWidth size="small" placeholder="Escribe una respuesta..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                      <Button size="small" variant="contained" onClick={() => handleReply(com.id, replyText)}>Responder</Button>
                    </Box>
                  )}
                  {com.respuestas && com.respuestas.length > 0 && (
                    <List dense sx={{ ml: 4 }}>
                      {com.respuestas.map((reply) => (
                        <ListItem key={reply.id} alignItems="flex-start"
                          secondaryAction={
                            String(reply.autor?.id) === String(currentUserId) && (
                              <IconButton edge="end" size="small" onClick={(e) => {
                                setReplySeleccionada(reply);
                                setReplyMenuEl(e.currentTarget);
                              }}>
                                <MoreVert fontSize="small" />
                              </IconButton>
                            )
                          }
                        >
                          <ListItemAvatar>
                            <Avatar src={reply.autor?.avatarUrl} sx={{ width: 30, height: 30 }}>{reply.autor?.nombre?.charAt(0)}</Avatar>
                          </ListItemAvatar>
                          {editandoReplyId === reply.id ? (
                            <Box sx={{ flex: 1 }}>
                              <TextField fullWidth size="small" multiline value={editReplyContent} onChange={(e) => setEditReplyContent(e.target.value)} />
                              <Button size="small" onClick={async () => {
                                try {
                                  const res = await fetch(`http://localhost:3000/api/novedades/${post.id}/comentarios/${reply.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ contenido: editReplyContent.trim(), usuarioId: currentUserId }),
                                  });
                                  if (res.ok) {
                                    const d = await res.json();
                                    setComentarios(comentarios.map(c => {
                                      if (c.id === com.id) {
                                        return { ...c, respuestas: c.respuestas.map(r => r.id === reply.id ? d.data : r) };
                                      }
                                      return c;
                                    }));
                                    setEditandoReplyId(null);
                                  }
                                } catch (err) { console.error(err); }
                              }}>Guardar</Button>
                              <Button size="small" onClick={() => setEditandoReplyId(null)}>Cancelar</Button>
                            </Box>
                          ) : (
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="caption" fontWeight="bold">{reply.autor?.nombre} {reply.autor?.apellido}</Typography>
                                  <Typography variant="caption" color="text.secondary">• {formatFechaComentario(reply.createdAt)}</Typography>
                                  {reply.editedAt && (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                      • editado
                                    </Typography>
                                  )}
                                </Box>
                              }
                              secondary={<Typography variant="body2" color="text.primary">{reply.contenido}</Typography>}
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              ))}
          </List>
        </Box>
      </Collapse>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleDelete}><Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar</MenuItem>
        {!post.esAutomatica && <MenuItem onClick={() => { setIsEditing(true); handleMenuClose(); }}><Edit fontSize="small" sx={{ mr: 1 }} /> Editar</MenuItem>}
      </Menu>

      <Menu anchorEl={comentarioMenuEl} open={Boolean(comentarioMenuEl)} onClose={() => setComentarioMenuEl(null)}>
        <MenuItem onClick={() => { setEditandoComentarioId(comentarioSeleccionado.id); setEditComentarioContent(comentarioSeleccionado.contenido); setComentarioMenuEl(null); }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={async () => {
           try {
            const res = await fetch(`http://localhost:3000/api/novedades/${post.id}/comentarios/${comentarioSeleccionado.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ usuarioId: currentUserId }),
            });
            if (res.ok) {
              setComentarios(comentarios.filter(c => c.id !== comentarioSeleccionado.id));
              onUpdateComentariosCount(post.id, Math.max(0, (post.comentariosCount || 0) - 1));
            }
          } catch (err) { console.error(err); }
          setComentarioMenuEl(null);
        }}><Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar</MenuItem>
      </Menu>

      <Menu anchorEl={replyMenuEl} open={Boolean(replyMenuEl)} onClose={() => setReplyMenuEl(null)}>
        <MenuItem onClick={() => { setEditandoReplyId(replySeleccionada.id); setEditReplyContent(replySeleccionada.contenido); setReplyMenuEl(null); }}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={async () => {
           try {
            const res = await fetch(`http://localhost:3000/api/novedades/${post.id}/comentarios/${replySeleccionada.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ usuarioId: currentUserId }),
            });
            if (res.ok) {
              setComentarios(comentarios.map(c => {
                if (c.respuestas) {
                  return { ...c, respuestas: c.respuestas.filter(r => r.id !== replySeleccionada.id) };
                }
                return c;
              }));
              onUpdateComentariosCount(post.id, Math.max(0, (post.comentariosCount || 0) - 1));
            }
          } catch (err) { console.error(err); }
          setReplyMenuEl(null);
        }}><Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar</MenuItem>
      </Menu>
    </Card>
  );
}

function CreatePostForm({ onSubmit, loading, currentStudent }) {
  const [contenido, setContenido] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contenido.trim()) return;
    onSubmit({ tipo: 'posteo', titulo: contenido.substring(0, 50), contenido: contenido.trim() });
    setContenido('');
  };

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar src={currentStudent?.avatarUrl} sx={{ width: 40, height: 40 }}>
          {currentStudent?.nombre?.charAt(0)}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="500">
          ¿Qué estás pensando, {currentStudent?.nombre}?
        </Typography>
      </Box>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth multiline rows={3} placeholder="Comparte algo con tus compañeros..." value={contenido} onChange={(e) => setContenido(e.target.value)} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" disabled={loading || !contenido.trim()} sx={{ px: 4 }}>Publicar</Button>
        </Box>
      </form>
    </Paper>
  );
}

export default function Feed() {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.feed);
  const { user, students } = useSelector((state) => state.auth);

  useEffect(() => { if (user?.id) dispatch(fetchFeed(user.id)); }, [user, dispatch]);

  return (
    <Container sx={{ py: 6, maxWidth: '800px !important' }}>
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Novedades</Typography>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Simular Usuario</InputLabel>
          <Select 
            value={user?.id || ''} 
            label="Simular Usuario" 
            onChange={(e) => dispatch(switchStudent(e.target.value))}
            renderValue={(selected) => {
              const student = students.find(s => s.id === selected);
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={student?.avatarUrl} sx={{ width: 24, height: 24 }}>{student?.nombre?.charAt(0)}</Avatar>
                  <Typography variant="body2" fontWeight="500">
                    {student?.nombre} {student?.apellido}
                  </Typography>
                </Box>
              );
            }}
          >
            {students.map(s => (
              <MenuItem key={s.id} value={s.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={s.avatarUrl} sx={{ width: 28, height: 28 }}>{s.nombre.charAt(0)}</Avatar>
                  <Typography>{s.nombre} {s.apellido}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <CreatePostForm onSubmit={(data) => dispatch(addPost({ postData: data, autorId: user.id }))} loading={loading} currentStudent={user} />
      
      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          currentUserId={user?.id}
          onDelete={(id) => dispatch(removePost(id))}
          onEdit={(id, data) => dispatch(editPost({ postId: id, postData: data }))}
          onToggleLike={(id, liked) => dispatch(toggleLike({ postId: id, currentlyLiked: liked, usuarioId: user.id }))}
          onUpdateComentariosCount={(id, count) => dispatch({ type: 'feed/updateComentariosCount', payload: { postId: id, comentariosCount: count } })}
        />
      ))}
    </Container>
  );
}