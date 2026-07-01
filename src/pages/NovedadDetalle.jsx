import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Typography, Box, Button, CircularProgress, Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { getPostById } from '../features/feed/service';
import { transformBackendNovedad } from '../features/feed/slice';
import { removePost, toggleLike, editPost } from '../features/feed/slice';
import PostCard from '../components/PostCard';
import { PageContainer } from '../components/ui';

export default function NovedadDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const estudianteId = user?.estudianteId || user?.Estudiante?.id || user?.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !estudianteId) return;
    setLoading(true);
    getPostById(id)
      .then((res) => {
        const transformed = transformBackendNovedad(res.data.data, estudianteId);
        setPost(transformed);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Error al cargar la publicación');
      })
      .finally(() => setLoading(false));
  }, [id, estudianteId]);

  if (loading) {
    return (
      <PageContainer >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer >
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Volver
        </Button>
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  if (!post) return null;

  return (
    <PageContainer >
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Volver
      </Button>

      <PostCard
        post={post}
        currentUserId={estudianteId}
        onDelete={(postId) =>
          user?.id && dispatch(removePost({ postId, estudianteId }))
        }
        onToggleLike={(postId, liked) =>
          user?.id && dispatch(toggleLike({ postId, currentlyLiked: liked, estudianteId }))
        }
        onEdit={(postId, data) =>
          user?.id && dispatch(editPost({ postId, postData: data, estudianteId }))
        }
      />
    </PageContainer>
  );
}
