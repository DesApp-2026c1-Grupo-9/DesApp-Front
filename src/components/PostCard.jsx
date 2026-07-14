import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import {
  Card,
  CardContent,
  CardHeader,
  Avatar,
  TextField,
  Button,
  Box,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  Collapse,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ThumbUp,
  Delete,
  MoreVert,
  School,
  CheckCircle,
  Edit,
  Comment,
  Groups,
  Event,
  Videocam,
  LocationOn,
} from '@mui/icons-material';

import { TIPO_EVENTO, TIPO_POST } from '../constants/postTypes';
import { formatFechaRelative } from '../utils';
import useComentarios from '../hooks/useComentarios';

const getIconForTipoEvento = (tipo) => {
  switch (tipo) {
    case TIPO_EVENTO.INSCRIPCION:
      return <School fontSize="small" />;
    case TIPO_EVENTO.REGULARIZACION:
      return <Edit fontSize="small" />;
    case TIPO_EVENTO.APROBACION:
      return <CheckCircle fontSize="small" />;
    case TIPO_EVENTO.SESION_CREADA:
      return <Groups fontSize="small" />;
    case TIPO_EVENTO.SESION_CANCELADA:
      return <Event fontSize="small" color="error" />;
    default:
      return null;
  }
};

const getLabelForTipoEvento = (tipo) => {
  switch (tipo) {
    case TIPO_EVENTO.INSCRIPCION:
      return 'se inscribió a';
    case TIPO_EVENTO.REGULARIZACION:
      return 'regularizó';
    case TIPO_EVENTO.APROBACION:
      return 'aprobó';
    case TIPO_EVENTO.SESION_CREADA:
      return 'creó sesión de';
    case TIPO_EVENTO.SESION_CANCELADA:
      return 'canceló sesión de';
    default:
      return '';
  }
};

const formatFechaComentario = (fecha) => formatFechaRelative(fecha);

function PostCard({ post, currentUserId, onDelete, onToggleLike, onEdit }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.contenido || '');
  const isOwner = Boolean(post.autor?.id && user?.id && String(post.autor?.id) === String(user?.id));

  const {
    comentarios,
    loadingComentarios,
    showComentarios,
    visibleCount,
    setVisibleCount,
    nuevoComentario,
    setNuevoComentario,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    comentarioMenuEl,
    setComentarioMenuEl,
    comentarioSeleccionado,
    setComentarioSeleccionado,
    editandoComentarioId,
    setEditandoComentarioId,
    editComentarioContent,
    setEditComentarioContent,
    replyMenuEl,
    setReplyMenuEl,
    replySeleccionada,
    setReplySeleccionada,
    editandoReplyId,
    setEditandoReplyId,
    editReplyContent,
    setEditReplyContent,
    error,
    handleFetchComentarios,
    handleAddComentario,
    handleEditComentario,
    handleEditReply,
    handleLikeComentario,
    handleReply,
    handleDeleteComentario,
    handleDeleteReply,
    handleClearError,
    comentariosCount,
  } = useComentarios(post, currentUserId);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleDelete = () => {
    onDelete(post.id);
    handleMenuClose();
  };

  const handleEditSubmit = () => {
    if (!editContent.trim()) return;
    onEdit(post.id, { contenido: editContent.trim(), titulo: editContent.trim().substring(0, 50) });
    setIsEditing(false);
  };

  const isEvento = post.tipo === TIPO_POST.EVENTO_ACADEMICO;
  const isSesionEvento = post.tipo === TIPO_POST.EVENTO_SESION;

  const formatFechaHora = (fechaHora) => {
    if (!fechaHora) return '';
    const d = new Date(fechaHora);
    return d.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2, '&:hover': { boxShadow: 2 }, minWidth: 0 }}>
      {isSesionEvento ? (
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, minWidth: 0 }}>
            <Avatar
              src={post.autor?.avatar}
              sx={{ width: 45, height: 45, cursor: 'pointer' }}
              onClick={() => navigate('/perfil/' + post.autor?.id)}
            >
              {post.autor?.nombre?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minWidth: 0, mb: 0.75 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  onClick={() => navigate('/perfil/' + post.autor?.id)}
                >
                  {post.autor?.nombre} {post.autor?.apellido || ''}
                </Typography>
                <Chip
                  icon={getIconForTipoEvento(post.tipoEvento)}
                  label={getLabelForTipoEvento(post.tipoEvento)}
                  size="small"
                  color={post.tipoEvento === TIPO_EVENTO.SESION_CANCELADA ? 'error' : 'primary'}
                  variant="outlined"
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {formatFechaRelative(post.fecha)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' },
              overflow: 'hidden',
              minWidth: 0,
            }}
            onClick={() => post.sesionId && navigate('/sesiones')}
          >
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
              <School color="primary" /> {post.materia?.nombre || 'Materia'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <Groups sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-top' }} />
              {post.contenido || post.titulo}
            </Typography>
            {post.sesion && (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  <Event sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-top' }} />
                  {formatFechaHora(post.sesion.fechaHora)} · {post.sesion.duracion}min
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {post.sesion.tipo === 'virtual' ? (
                    <><Videocam sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-top' }} />Virtual</>
                  ) : (
                    <><LocationOn sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-top' }} />{post.sesion.ubicacion}</>
                  )}
                </Typography>
                {post.sesion.cupos && (
                  <Typography variant="caption" color="text.secondary">
                    Cupo: {post.sesion.participantes?.filter(p => p.estado === 'aprobado').length || 0}/{post.sesion.cupos}
                  </Typography>
                )}
              </Box>
            )}
            <Button
              size="small"
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={(e) => { e.stopPropagation(); navigate('/sesiones'); }}
            >
              Ver sesión
            </Button>
          </Box>
        </CardContent>
      ) : isEvento ? (
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden', minWidth: 0 }}>
          <Avatar
            src={post.autor?.avatar}
            sx={{ width: 45, height: 45, cursor: 'pointer' }}
            onClick={() => navigate('/perfil/' + post.autor?.id)}
          >
            {post.autor?.nombre?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minWidth: 0, mb: 0.75 }}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, fontSize: { xs: '0.9rem', sm: '1rem' } }}
                onClick={() => navigate('/perfil/' + post.autor?.id)}
              >
                {post.autor?.nombre} {post.autor?.apellido}
              </Typography>
              <Chip
                icon={getIconForTipoEvento(post.tipoEvento)}
                label={getLabelForTipoEvento(post.tipoEvento)}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                {formatFechaRelative(post.fecha)}
              </Typography>
              {post.editedAt && (
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: 'italic' }}
                >
                  • editado
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      ) : (
        <CardHeader
          avatar={
            <Avatar
              src={post.autor?.avatar}
              sx={{ width: 45, height: 45, cursor: 'pointer' }}
              onClick={() => navigate('/perfil/' + post.autor?.id)}
            >
              {post.autor?.nombre?.charAt(0)}
            </Avatar>
          }
          title={
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, fontSize: { xs: '0.9rem', sm: '1rem' } }}
              onClick={() => navigate('/perfil/' + post.autor?.id)}
            >
              {post.autor?.nombre} {post.autor?.apellido}
            </Typography>
          }
          subheader={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {formatFechaRelative(post.fecha)}
              {post.editedAt && (
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: 'italic' }}
                >
                  • editado
                </Typography>
              )}
            </Box>
          }
          action={isOwner && <IconButton onClick={handleMenuClick}><MoreVert /></IconButton>}
        />
      )}

      <CardContent sx={{ px: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button variant="contained" onClick={handleEditSubmit}>
                Guardar
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            {isEvento ? (
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                <School color="primary" /> {post.materia?.nombre}
              </Typography>
            ) : isSesionEvento ? null : (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {post.contenido}
              </Typography>
            )}
          </>
        )}
      </CardContent>

      <Divider />
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
        <Tooltip title={isOwner ? 'No puedes dar like a tu propia publicación' : ''}>
          <IconButton
            onClick={() => !isOwner && onToggleLike(post.id, post.liked)}
            color={post.liked ? 'primary' : 'default'}
            disabled={isOwner}
            sx={isOwner ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
          >
            <ThumbUp fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="body2" sx={{ mr: 1 }}>
          {post.likesCount || 0}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3, overflow: 'hidden' }}>
          {post.likesDetails?.map((user) => (
            <Avatar
              key={user.id}
              src={user.avatar || 'default.jpg'}
              sx={{ width: 20, height: 20, ml: -0.5, border: '1px solid white' }}
            >
              {user.nombre?.charAt(0)}
            </Avatar>
          ))}
        </Box>

        <IconButton
          onClick={handleFetchComentarios}
          color={showComentarios ? 'primary' : 'default'}
        >
          <Comment fontSize="small" />
        </IconButton>
        <Typography variant="body2">
          {comentariosCount}
        </Typography>
        {loadingComentarios && <CircularProgress size={20} sx={{ ml: 1 }} />}
      </Box>

      <Collapse in={showComentarios} timeout={475}>
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid #eee' }}>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' }, justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              sx={{ minWidth: 0 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleAddComentario}
              disabled={!nuevoComentario.trim()}
              sx={{ minWidth: { xs: 'auto', sm: 64 } }}
            >
              Enviar
            </Button>
          </Box>

          {comentarios.length > visibleCount && (
            <Button
              fullWidth
              size="small"
              onClick={() => setVisibleCount((prev) => prev + 5)}
              sx={{ mb: 2, textTransform: 'none' }}
            >
              Cargar anteriores ({comentarios.length - visibleCount} restantes)
            </Button>
          )}

          <List dense>
            {comentarios
              .slice(Math.max(0, comentarios.length - visibleCount))
              .map((com) => (
                <Box key={com.id} sx={{ minWidth: 0 }}>
                  <ListItem
                    alignItems="flex-start"
                    disablePadding
                  >
                    <ListItemAvatar>
                      <Avatar src={com.autor?.avatarUrl} sx={{ width: 35, height: 35 }}>
                        {com.autor?.nombre?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>

                    {editandoComentarioId === com.id ? (
                      <Box sx={{ flex: 1, minWidth: { xs: 0, sm: undefined } }}>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                                  minRows={2}
                          value={editComentarioContent}
                          onChange={(e) => setEditComentarioContent(e.target.value)}
                        />
                        <Box sx={{ display: { xs: 'flex', sm: 'block' }, justifyContent: 'flex-end', gap: 1, mt: { xs: 0.5, sm: 0 } }}>
                          <Button size="small" onClick={() => setEditandoComentarioId(null)}>
                            Cancelar
                          </Button>
                          <Button size="small" variant="contained" onClick={handleEditComentario}>
                            Guardar
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                  sx={{ fontSize: '0.85rem' }}
                                >
                                  {com.autor?.nombre} {com.autor?.apellido}
                                </Typography>
                                {String(com.autor?.id) === String(user?.id) && (
                                  <IconButton
                                    size="small"
                                    sx={{ flexShrink: 0 }}
                                    onClick={(e) => {
                                      setComentarioSeleccionado(com);
                                      setComentarioMenuEl(e.currentTarget);
                                    }}
                                  >
                                    <MoreVert fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {formatFechaComentario(com.createdAt)}
                                </Typography>
                                {com.editedAt && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontStyle: 'italic' }}
                                  >
                                    • editado
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                                {com.contenido}
                              </Typography>

                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}
                        >
                          <Tooltip
                            title={
                              String(com.autor?.id) === String(user?.id)
                                ? 'No puedes dar like a tu propio comentario'
                                : ''
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleLikeComentario(com.id, com.liked)}
                              color={com.liked ? 'primary' : 'default'}
                              disabled={String(com.autor?.id) === String(user?.id)}
                              sx={{
                                p: 0.5,
                                ...(String(com.autor?.id) === String(user?.id)
                                  ? { opacity: 0.4, cursor: 'not-allowed' }
                                  : {}),
                              }}
                            >
                              <ThumbUp
                                fontSize="inherit"
                                style={{ fontSize: '1.1rem' }}
                              />
                            </IconButton>
                          </Tooltip>

                          <Typography variant="caption" sx={{ fontWeight: '500' }}>
                            {com.likesCount || 0}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              cursor: 'pointer',
                              color: 'text.secondary',
                              fontWeight: 'bold',
                              ml: 1,
                              '&:hover': { textDecoration: 'underline' },
                            }}
                            onClick={() =>
                              setReplyingTo(replyingTo === com.id ? null : com.id)
                            }
                          >
                            Responder
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                            {com.likesDetails &&
                              com.likesDetails.map((user) => (
                                <Avatar
                                  key={user.id}
                                  src={user.avatar || 'default.jpg'}
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    ml: -0.5,
                                    border: '1px solid white',
                                  }}
                                >
                                  {user.nombre?.charAt(0)}
                                </Avatar>
                              ))}
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </ListItem>

                  {replyingTo === com.id && (
                    <Box sx={{ display: 'flex', gap: 1, ml: { xs: 2, sm: 7 }, mb: 1, mt: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Escribe una respuesta..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        sx={{ minWidth: 0 }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleReply(com.id, replyText)}
                      >
                        Responder
                      </Button>
                    </Box>
                  )}

                  {com.respuestas && com.respuestas.length > 0 && (
                    <List dense sx={{ ml: { xs: 4, sm: 4 }, minWidth: 0, overflow: 'hidden' }}>
                      {com.respuestas
                        .filter((reply) => reply && reply.id)
                        .map((reply) => (
                          <ListItem
                            key={reply.id}
                            alignItems="flex-start"
                            disablePadding
                            sx={{ px: { xs: 0, sm: undefined } }}
                          >
                            <ListItemAvatar>
                              <Avatar src={reply.autor?.avatarUrl} sx={{ width: 35, height: 35 }}>
                                {reply.autor?.nombre?.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            {editandoReplyId === reply.id ? (
                              <Box sx={{ flex: 1, minWidth: { xs: 0, sm: undefined } }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  multiline
                          minRows={2}
                                  value={editReplyContent}
                                  onChange={(e) => setEditReplyContent(e.target.value)}
                                />
                                <Box sx={{ display: { xs: 'flex', sm: 'block' }, justifyContent: 'flex-end', gap: 1, mt: { xs: 0.5, sm: 0 } }}>
                                  <Button size="small" onClick={() => setEditandoReplyId(null)}>
                                    Cancelar
                                  </Button>
                                  <Button size="small" variant="contained" onClick={handleEditReply}>
                                    Guardar
                                  </Button>
                                </Box>
                              </Box>
                            ) : (
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <Typography variant="caption" fontWeight="bold">
                                      {reply.autor?.nombre} {reply.autor?.apellido}
                                    </Typography>
                                    {reply.autor && String(reply.autor?.id) === String(user?.id) && (
                                      <IconButton
                                        size="small"
                                        sx={{ flexShrink: 0 }}
                                        onClick={(e) => {
                                          setReplySeleccionada(reply);
                                          setReplyMenuEl(e.currentTarget);
                                        }}
                                      >
                                        <MoreVert fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatFechaComentario(reply.createdAt)}
                                    </Typography>
                                    {reply.editedAt && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontStyle: 'italic' }}
                                      >
                                        • editado
                                      </Typography>
                                    )}
                                  </Box>
                                  <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                                    {reply.contenido}
                                  </Typography>
                                  <Box
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}
                                  >
                                    <Tooltip
                                      title={
                                        String(reply.autor?.id) === String(user?.id)
                                          ? 'No puedes dar like a tu propio comentario'
                                          : ''
                                      }
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={() => handleLikeComentario(reply.id, reply.liked)}
                                        color={reply.liked ? 'primary' : 'default'}
                                        disabled={String(reply.autor?.id) === String(user?.id)}
                                        sx={{
                                          p: 0.5,
                                          ...(String(reply.autor?.id) === String(user?.id)
                                            ? { opacity: 0.4, cursor: 'not-allowed' }
                                            : {}),
                                        }}
                                      >
                                        <ThumbUp
                                          fontSize="inherit"
                                          style={{ fontSize: '1rem' }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                    <Typography variant="caption">{reply.likesCount || 0}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                      {reply.likesDetails &&
                                        reply.likesDetails.map((user) => (
                                          <Avatar
                                            key={user.id}
                                            src={user.avatar || 'default.jpg'}
                                            sx={{
                                              width: 16,
                                              height: 16,
                                              ml: -0.5,
                                              border: '1px solid white',
                                            }}
                                          >
                                            {user.nombre?.charAt(0)}
                                          </Avatar>
                                        ))}
                                    </Box>
                                  </Box>
                              </Box>
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
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
        {!post.esAutomatica && (
          <MenuItem
            onClick={() => {
              setIsEditing(true);
              handleMenuClose();
            }}
          >
            <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
          </MenuItem>
        )}
      </Menu>

      <Menu
        anchorEl={comentarioMenuEl}
        open={Boolean(comentarioMenuEl)}
        onClose={() => setComentarioMenuEl(null)}
      >
        <MenuItem
          onClick={() => {
            setEditandoComentarioId(comentarioSeleccionado.id);
            setEditComentarioContent(comentarioSeleccionado.contenido);
            setComentarioMenuEl(null);
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={handleDeleteComentario}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={replyMenuEl}
        open={Boolean(replyMenuEl)}
        onClose={() => setReplyMenuEl(null)}
      >
        <MenuItem
          onClick={() => {
            setEditandoReplyId(replySeleccionada.id);
            setEditReplyContent(replySeleccionada.contenido);
            setReplyMenuEl(null);
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={handleDeleteReply}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={handleClearError} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleClearError} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Card>
  );
}

export default PostCard;