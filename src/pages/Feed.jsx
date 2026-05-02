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
  Alert,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  Delete,
  MoreVert,
  School,
  CheckCircle,
  Edit,
  Send,
  Person,
} from '@mui/icons-material';
import { fetchFeed, addPost, removePost, toggleLike, clearFeedError, setCurrentUser } from '../features/feed/slice';
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
    case TIPO_EVENTO.INSCRIPCION:
      return <School fontSize="small" />;
    case TIPO_EVENTO.REGULARIZACION:
      return <Edit fontSize="small" />;
    case TIPO_EVENTO.APROBACION:
      return <CheckCircle fontSize="small" />;
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
    default:
      return '';
  }
};

function PostCard({ post, currentUserId, onDelete, onToggleLike }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOwner = post.autor?.id === currentUserId;

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    onDelete(post.id);
    handleMenuClose();
  };

  const handleLike = () => {
    onToggleLike(post.id, post.liked);
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString();
  };

  if (post.tipo === TIPO_POST.EVENTO_ACADEMICO) {
    return (
      <Card sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={post.autor?.avatar}
            alt={post.autor?.nombre}
            sx={{ width: 48, height: 48 }}
          >
            {post.autor?.nombre?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {post.autor?.nombre}
              </Typography>
              <Chip
                icon={getIconForTipoEvento(post.tipoEvento)}
                label={getLabelForTipoEvento(post.tipoEvento)}
                size="small"
                color="primary"
                variant="outlined"
              />
              {post.esAutomatica && (
                <Chip label="Automática" size="small" color="info" variant="outlined" sx={{ fontSize: '0.65rem' }} />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {formatFecha(post.fecha)}
            </Typography>
          </Box>
        </CardContent>
        <Divider />
        <CardContent>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School color="primary" />
            {post.materia?.nombre || 'Materia'}
          </Typography>
          {post.materia?.codigo && (
            <Typography variant="caption" color="text.secondary" display="block">
              Código: {post.materia.codigo}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <IconButton onClick={handleLike} color={post.liked ? 'primary' : 'default'} size="small">
              {post.liked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
            </IconButton>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {post.likesCount || 0}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardHeader
        avatar={
          <Avatar
            src={post.autor?.avatar}
            alt={post.autor?.nombre}
          >
            {post.autor?.nombre?.charAt(0)}
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" fontWeight="bold">
            {post.autor?.nombre}
          </Typography>
        }
        subheader={formatFecha(post.fecha)}
        action={
          isOwner && (
            <IconButton onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          )
        }
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Eliminar
        </MenuItem>
      </Menu>
      <CardContent>
        {post.contenido && (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {post.contenido}
          </Typography>
        )}
        {post.imagen && (
          <Box
            component="img"
            src={post.imagen}
            alt="Imagen del post"
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              mt: 2,
              borderRadius: 1,
            }}
          />
        )}
      </CardContent>
      <Divider />
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
        <IconButton onClick={handleLike} color={post.liked ? 'primary' : 'default'}>
          {post.liked ? <ThumbUp /> : <ThumbUpOutlined />}
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          {post.likesCount || 0}
        </Typography>
      </Box>
    </Card>
  );
}

function CreatePostForm({ onSubmit, loading, currentStudent }) {
  const [contenido, setContenido] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!contenido.trim()) return;
    
    const resumen = contenido.trim().length > 50
      ? contenido.trim().substring(0, 50) + '...'
      : contenido.trim();

    onSubmit({
      tipo: 'posteo',
      titulo: resumen,
      contenido: contenido.trim(),
    });
    setContenido('');
  };

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Avatar src={currentStudent?.avatarUrl} sx={{ width: 36, height: 36 }}>
          {currentStudent?.nombre?.charAt(0)}
        </Avatar>
        <Typography variant="body2" color="text.secondary">
          Publicando como <strong>{currentStudent?.nombre} {currentStudent?.apellido}</strong>
        </Typography>
      </Box>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="¿Qué estás pensando?"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            type="submit"
            variant="contained"
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
            disabled={!contenido.trim() || loading}
          >
            Publicar
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default function Feed() {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((state) => state.feed);
  const { user, students } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFeed(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (user?.id) {
      dispatch(setCurrentUser(user.id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearFeedError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleCreatePost = (postData) => {
    dispatch(addPost({ postData, autorId: user?.id }));
  };

  const handleDeletePost = (postId) => {
    dispatch(removePost(postId));
  };

  const handleToggleLike = (postId, currentLiked) => {
    dispatch(toggleLike({ postId, currentlyLiked: currentLiked, usuarioId: user?.id }));
  };

  const handleStudentChange = (e) => {
    const newUserId = Number(e.target.value);
    dispatch(switchStudent(newUserId));
    dispatch(fetchFeed(newUserId));
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Feed de Novedades
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="student-select-label">Estudiante</InputLabel>
          <Select
            labelId="student-select-label"
            value={user?.id || ''}
            label="Estudiante"
            onChange={handleStudentChange}
            startAdornment={<Person sx={{ mr: 1, color: 'action.active' }} />}
          >
            {students.map((student) => (
              <MenuItem key={student.id} value={student.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={student.avatarUrl} sx={{ width: 24, height: 24 }}>
                    {student.nombre.charAt(0)}
                  </Avatar>
                  {student.nombre} {student.apellido}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearFeedError())}>
          {error}
        </Alert>
      )}

      <CreatePostForm onSubmit={handleCreatePost} loading={loading} currentStudent={user} />

      <Divider sx={{ my: 3 }} />

      {loading && posts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hay novedades todavía. ¡Conecta con otros estudiantes para ver sus publicaciones!
          </Typography>
        </Box>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={user?.id}
            onDelete={handleDeletePost}
            onToggleLike={handleToggleLike}
          />
        ))
      )}
    </Container>
  );
}
