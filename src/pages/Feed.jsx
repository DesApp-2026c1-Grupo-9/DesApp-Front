import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Typography, Box } from '@mui/material';
import { fetchFeed, addPost, removePost, toggleLike, editPost } from '../features/feed/slice';
import { fetchStudents } from '../features/auth/slice';

import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import { PageContainer } from '../components/ui';

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
      <PageContainer centered padding={3}>
        <Typography>Cargando usuarios...</Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={800}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
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
    </PageContainer>
  );
}

export default Feed;