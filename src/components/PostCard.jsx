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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
  const usuarioId = user?.usuarioId || user?.id;

  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.contenido || '');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null);
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

  const requestDeleteComentario = (com) => {
    setConfirmDeleteTarget({ type: 'comentario', data: com });
    setConfirmDeleteOpen(true);
    setComentarioMenuEl(null);
  };

  const requestDeleteReply = (reply) => {
    setConfirmDeleteTarget({ type: 'respuesta', data: reply });
    setConfirmDeleteOpen(true);
    setReplyMenuEl(null);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteTarget?.type === 'comentario') {
      handleDeleteComentario();
    } else if (confirmDeleteTarget?.type === 'respuesta') {
      handleDeleteReply();
    }
    setConfirmDeleteOpen(false);
    setConfirmDeleteTarget(null);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setConfirmDeleteTarget(null);
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
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2, '&:hover': { boxShadow: 2 } }}>
      {isSesionEvento ? (
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar
              src={post.autor?.avatar}
              sx={{ width: 45, height: 45, cursor: 'pointer' }}
              onClick={() => navigate('/perfil/' + post.autor?.id)}
            >
              {post.autor?.nombre?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
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
            }}
            onClick={() => post.sesionId && navigate('/sesiones')}
          >
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={post.autor?.avatar}
            sx={{ width: 45, height: 45, cursor: 'pointer' }}
            onClick={() => navigate('/perfil/' + post.autor?.id)}
          >
            {post.autor?.nombre?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
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
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              />
            </Box>
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
            <Chip
              icon={getIconForTipoEvento(post.tipoEvento)}
              label={getLabelForTipoEvento(post.tipoEvento)}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ display: { xs: 'inline-flex', sm: 'none' }, mt: 0.5, width: 'fit-content' }}
            />
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
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
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

      <CardContent sx={{ px: 3 }}>
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
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                <School color="primary" /> {post.materia?.nombre}
              </Typography>
            ) : isSesionEvento ? null : (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {post.contenido}
              </Typography>
            )}
          </>
        )}
      </CardContent>

      <Divider />
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
        <Tooltip title={isOwner ? 'No puedes dar like a tu propia publicación' : ''}>
          <span>
            <IconButton
              onClick={() => !isOwner && onToggleLike(post.id, post.liked)}
              color={post.liked ? 'primary' : 'default'}
              disabled={isOwner}
              sx={isOwner ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            >
              <ThumbUp fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Typography variant="body2" sx={{ mr: 1 }}>
          {post.likesCount || 0}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
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
        <Box sx={{ p: { xs: 0.5, sm: 2 }, bgcolor: 'grey.50', borderTop: '1px solid #eee' }}>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleAddComentario}
              disabled={!nuevoComentario.trim()}
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
                <Box key={com.id}>
                  <ListItem
                    alignItems="flex-start"
                  >
                    <ListItemAvatar>
                      <Avatar src={com.autor?.avatarUrl} sx={{ width: 35, height: 35 }}>
                        {com.autor?.nombre?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>

                    {editandoComentarioId === com.id ? (
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            value={editComentarioContent}
                            onChange={(e) => setEditComentarioContent(e.target.value)}
                          />
                          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={handleEditComentario}
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' }, textTransform: 'none', borderRadius: 2, px: { xs: 1.5, sm: 2 }, minWidth: 'auto' }}
                            >
                              Guardar
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setEditandoComentarioId(null)}
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' }, textTransform: 'none', borderRadius: 2, px: { xs: 1.5, sm: 2 }, minWidth: 'auto' }}
                            >
                              Cancelar
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ flex: 1 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                  sx={{ fontSize: '0.85rem' }}
                                >
                                  {com.autor?.nombre} {com.autor?.apellido}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatFechaComentario(com.createdAt)}
                                  {com.editedAt && ' · editado'}
                                </Typography>
                              </Box>
                              {String(com.autor?.id) === String(usuarioId) && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    setComentarioSeleccionado(com);
                                    setComentarioMenuEl(e.currentTarget);
                                  }}
                                >
                                  <MoreVert fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.primary">
                              {com.contenido}
                            </Typography>
                          }
                        />

                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}
                        >
                          <Tooltip
                            title={
                              String(com.autor?.id) === String(usuarioId)
                                ? 'No puedes dar like a tu propio comentario'
                                : ''
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleLikeComentario(com.id, com.liked)}
                                color={com.liked ? 'primary' : 'default'}
                                disabled={String(com.autor?.id) === String(usuarioId)}
                                sx={{
                                  p: 0.5,
                                  ...(String(com.autor?.id) === String(usuarioId)
                                    ? { opacity: 0.4, cursor: 'not-allowed' }
                                    : {}),
                                }}
                              >
                                <ThumbUp
                                  fontSize="inherit"
                                  style={{ fontSize: '1.1rem' }}
                                />
                              </IconButton>
                            </span>
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
                    <Box sx={{ display: 'flex', gap: 1, ml: 7, mb: 1, mt: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Escribe una respuesta..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
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
                    <List dense sx={{ ml: { xs: 1, sm: 4 } }}>
                      {com.respuestas
                        .filter((reply) => reply && reply.id)
                        .map((reply) => (
                          <ListItem
                            key={reply.id}
                            alignItems="flex-start"
                          >
                            <ListItemAvatar>
                              <Avatar src={reply.autor?.avatarUrl} sx={{ width: 30, height: 30 }}>
                                {reply.autor?.nombre?.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            {editandoReplyId === reply.id ? (
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    multiline
                                    value={editReplyContent}
                                    onChange={(e) => setEditReplyContent(e.target.value)}
                                  />
                                  <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={handleEditReply}
                                      sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' }, textTransform: 'none', borderRadius: 2, px: { xs: 1.5, sm: 2 }, minWidth: 'auto' }}
                                    >
                                      Guardar
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() => setEditandoReplyId(null)}
                                      sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' }, textTransform: 'none', borderRadius: 2, px: { xs: 1.5, sm: 2 }, minWidth: 'auto' }}
                                    >
                                      Cancelar
                                    </Button>
                                  </Box>
                                </Box>
                              </Box>
                            ) : (
                              <Box sx={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                      <Box>
                                        <Typography variant="caption" fontWeight="bold">
                                          {reply.autor?.nombre} {reply.autor?.apellido}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                          {formatFechaComentario(reply.createdAt)}
                                          {reply.editedAt && ' · editado'}
                                        </Typography>
                                      </Box>
                                      {reply.autor && String(reply.autor?.id) === String(usuarioId) && (
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            setReplySeleccionada(reply);
                                            setReplyMenuEl(e.currentTarget);
                                          }}
                                        >
                                          <MoreVert fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>
                                  }
                                  secondary={
                                    <Typography variant="body2" color="text.primary">
                                      {reply.contenido}
                                    </Typography>
                                  }
                                />
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}
                                >
                                  <Tooltip
                                    title={
                                      String(reply.autor?.id) === String(usuarioId)
                                        ? 'No puedes dar like a tu propio comentario'
                                        : ''
                                    }
                                  >
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleLikeComentario(reply.id, reply.liked)}
                                        color={reply.liked ? 'primary' : 'default'}
                                        disabled={String(reply.autor?.id) === String(usuarioId)}
                                        sx={{
                                          p: 0.5,
                                          ...(String(reply.autor?.id) === String(usuarioId)
                                            ? { opacity: 0.4, cursor: 'not-allowed' }
                                            : {}),
                                        }}
                                      >
                                        <ThumbUp
                                          fontSize="inherit"
                                          style={{ fontSize: '1rem' }}
                                        />
                                      </IconButton>
                                    </span>
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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} disableRestoreFocus disableAutoFocus disableEnforceFocus>
        <MenuItem onClick={() => { handleDelete(); document.activeElement?.blur(); }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
        {!post.esAutomatica && (
          <MenuItem
            onClick={() => {
              setIsEditing(true);
              handleMenuClose();
              document.activeElement?.blur();
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
        disableRestoreFocus disableAutoFocus disableEnforceFocus
      >
        <MenuItem
          onClick={() => {
                                     setEditandoComentarioId(comentarioSeleccionado.id);
                                     setEditandoReplyId(null);
            setEditComentarioContent(comentarioSeleccionado.contenido);
            setComentarioMenuEl(null);
            document.activeElement?.blur();
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={() => { requestDeleteComentario(comentarioSeleccionado); document.activeElement?.blur(); }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={replyMenuEl}
        open={Boolean(replyMenuEl)}
        onClose={() => setReplyMenuEl(null)}
        disableRestoreFocus disableAutoFocus disableEnforceFocus
      >
        <MenuItem
          onClick={() => {
                                     setEditandoReplyId(replySeleccionada.id);
                                     setEditandoComentarioId(null);
            setEditReplyContent(replySeleccionada.contenido);
            setReplyMenuEl(null);
            document.activeElement?.blur();
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={() => { requestDeleteReply(replySeleccionada); document.activeElement?.blur(); }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>

      <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
        <DialogTitle>Eliminar {confirmDeleteTarget?.type === 'comentario' ? 'comentario' : 'respuesta'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que querés eliminar este {confirmDeleteTarget?.type === 'comentario' ? 'comentario' : 'respuesta'}? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={handleClearError} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleClearError} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Card>
  );
}

export default PostCard;