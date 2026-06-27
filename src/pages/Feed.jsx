import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Typography, Box, CircularProgress } from '@mui/material';
import { fetchFeed, addPost, removePost, toggleLike, editPost } from '../features/feed/slice';

import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import { PageContainer } from '../components/ui';

export { TIPO_EVENTO, TIPO_POST } from '../constants/postTypes';

function Feed() {
  const dispatch = useDispatch();
  const { posts, loadingFeed, posting } = useSelector((state) => state.feed);
  const { user } = useSelector((state) => state.auth);
  const estudianteId = user?.estudianteId || user?.Estudiante?.id || user?.id;

  useEffect(() => {
    if (estudianteId) {
      dispatch(fetchFeed(estudianteId));
    }
  }, [estudianteId, dispatch]);

  return (
    <PageContainer maxWidth={1200}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          Novedades
        </Typography>
      </Box>

      {user?.id && (
        <CreatePostForm
          onSubmit={(data) => dispatch(addPost({ postData: data, estudianteId }))}
          loading={posting}
          currentStudent={user}
        />
      )}

      {loadingFeed ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No hay novedades para mostrar.
        </Typography>
      ) : (
        posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={estudianteId}
          onDelete={(id) => user?.id && dispatch(removePost({ postId: id, estudianteId }))}
          onEdit={(id, data) =>
            user?.id && dispatch(editPost({ postId: id, postData: data, estudianteId }))
          }
          onToggleLike={(id, liked) =>
            user?.id && dispatch(toggleLike({ postId: id, currentlyLiked: liked, estudianteId }))
          }
        />
      )))}
    </PageContainer>
  );
}

export default Feed;