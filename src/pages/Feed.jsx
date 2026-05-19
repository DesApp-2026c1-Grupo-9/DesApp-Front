import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Container, Typography, Box } from '@mui/material';
import { fetchFeed, addPost, removePost, toggleLike, editPost } from '../features/feed/slice';
import { fetchStudents } from '../features/auth/slice';

import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';

export { TIPO_EVENTO, TIPO_POST } from '../constants/postTypes';

function Feed() {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.feed);
  const { user, loadingStudents } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchFeed(user.id));
    }
  }, [user, dispatch]);

  if (loadingStudents || !user) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <Typography>Cargando usuarios...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6, maxWidth: '800px !important' }}>
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Novedades
        </Typography>
      </Box>

      {user?.id && (
        <CreatePostForm
          onSubmit={(data) => dispatch(addPost({ postData: data, autorId: user.id }))}
          loading={loading}
          currentStudent={user}
        />
      )}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={user?.id}
          onDelete={(id) => user?.id && dispatch(removePost({ postId: id, usuarioId: user.id }))}
          onEdit={(id, data) =>
            user?.id && dispatch(editPost({ postId: id, postData: data, usuarioId: user.id }))
          }
          onToggleLike={(id, liked) =>
            user?.id && dispatch(toggleLike({ postId: id, currentlyLiked: liked, usuarioId: user.id }))
          }
          onUpdateComentariosCount={(id, count) =>
            dispatch({ type: 'feed/updateComentariosCount', payload: { postId: id, comentariosCount: count } })
          }
        />
      ))}
    </Container>
  );
}

export default Feed;