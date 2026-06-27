import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeed, createPost, deletePost, likePost, unlikePost, updatePost } from './service';

const transformBackendNovedad = (novedad, currentUserId) => {
  const tipoMap = {
    posteo: 'publicacion',
    inscripcion: 'evento_academico',
    regularizacion: 'evento_academico',
    aprobacion: 'evento_academico',
    sesion_creada: 'evento_sesion',
    sesion_cancelada: 'evento_sesion',
  };

  const autor = novedad.autor
    ? {
        id: novedad.autor.id,
        nombre: novedad.autor.nombre,
        apellido: novedad.autor.apellido || '',
        rol: novedad.autor.rol || 'estudiante',
        avatar:
          novedad.autor.avatarUrl ||
          `https://ui-avatars.com/api/?name=${novedad.autor.nombre}+${novedad.autor.apellido || ''}&background=random`,
      }
    : novedad.autorId
    ? {
        id: novedad.autorId,
        nombre: 'Estudiante',
        apellido: '',
        rol: 'estudiante',
        avatar: `https://ui-avatars.com/api/?name=Estudiante&background=random`,
      }
    : {
        id: null,
        nombre: 'Estudiante',
        apellido: '',
        rol: 'estudiante',
        avatar: `https://ui-avatars.com/api/?name=Estudiante&background=random`,
      };

  const likesArray = Array.isArray(novedad.likes) ? novedad.likes.map(id => Number(id)) : [];
  const liked = novedad.liked !== undefined ? novedad.liked : false;

  const base = {
    id: novedad.id,
    tipo: tipoMap[novedad.tipo] || 'publicacion',
    titulo: novedad.titulo,
    contenido: novedad.contenido || '',
    autor,
    fecha: novedad.createdAt,
    editedAt: novedad.editedAt || null,
    likes: likesArray,
    liked,
    likesCount: novedad.likesCount !== undefined ? novedad.likesCount : likesArray.length,
    comentariosCount: novedad.comentariosCount || 0,
    imagen: novedad.imagenUrl || null,
    esAutomatica: novedad.esAutomatica || false,
  };

  if (novedad.tipo !== 'posteo') {
    base.tipoEvento = novedad.tipo;
    base.materia = novedad.materia
      ? { nombre: novedad.materia.nombre, codigo: novedad.materia.codigo }
      : { nombre: 'Materia', codigo: `ID: ${novedad.materiaId || '-'}` };
  }

  if (novedad.sesion) {
    base.sesion = novedad.sesion;
  }
  if (novedad.sesionId) {
    base.sesionId = novedad.sesionId;
  }

  return base;
};

const transformBackendList = (responseData, currentUserId) => {
  const novedades = Array.isArray(responseData) ? responseData : (responseData.data || []);
  return novedades.map((n) => transformBackendNovedad(n, currentUserId));
};

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (estudianteId, { getState }) => {
    const currentUserId = estudianteId || getState().feed.currentUserId;
    const response = await getFeed({ estudianteId: currentUserId, feed: 'contactos' });
    return { novedades: transformBackendList(response.data, currentUserId) };
  }
);

export const addPost = createAsyncThunk(
  'feed/addPost',
  async ({ postData, autorId, estudianteId }, { rejectWithValue }) => {
    const response = await createPost({ ...postData, estudianteId: estudianteId || autorId });
    return response.data.data;
  }
);

export const removePost = createAsyncThunk(
  'feed/removePost',
  async ({ postId, estudianteId }, { getState, rejectWithValue }) => {
    const userId = estudianteId || getState().auth.user?.id || getState().feed.currentUserId;
    try {
      await deletePost(postId, userId);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar la publicación');
    }
  }
);

export const editPost = createAsyncThunk(
  'feed/editPost',
  async ({ postId, postData, estudianteId }, { getState, rejectWithValue }) => {
    const userId = estudianteId || getState().auth.user?.id || getState().feed.currentUserId;
    try {
      const response = await updatePost(postId, postData, { estudianteId: userId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al editar la publicación');
    }
  }
);

export const toggleLike = createAsyncThunk(
  'feed/toggleLike',
  async ({ postId, currentlyLiked, estudianteId }, { rejectWithValue }) => {
    if (currentlyLiked) {
      const response = await unlikePost(postId, estudianteId);
      return { postId, likesCount: response.data.data.likesCount, liked: false };
    } else {
      const response = await likePost(postId, estudianteId);
      return { postId, likesCount: response.data.data.likesCount, liked: true };
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    posts: [],
    loadingFeed: false,
    posting: false,
    error: null,
    currentUserId: null,
  },
  reducers: {
    clearFeedError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUserId = action.payload;
    },
    updateComentariosCount: (state, action) => {
      const { postId, comentariosCount } = action.payload;
      const post = state.posts.find(p => p.id === postId);
      if (post) {
        post.comentariosCount = comentariosCount;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loadingFeed = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loadingFeed = false;
        state.posts = action.payload.novedades;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loadingFeed = false;
        state.error = action.payload;
      })
      .addCase(addPost.pending, (state) => {
        state.posting = true;
        state.error = null;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.posting = false;
        const newPost = transformBackendNovedad(action.payload, state.currentUserId);
        state.posts.unshift(newPost);
      })
      .addCase(addPost.rejected, (state, action) => {
        state.posting = false;
        state.error = action.payload;
      })
      .addCase(removePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post.id !== action.payload);
      })
      .addCase(editPost.fulfilled, (state, action) => {
        const updatedPost = transformBackendNovedad(action.payload, state.currentUserId);
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
      })
      .addCase(editPost.rejected, (state, action) => {
        state.error = action.payload || 'Error al editar la publicación';
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likesCount, liked } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.liked = liked;
          post.likesCount = likesCount;
          if (liked) {
            if (!post.likes.includes(state.currentUserId)) {
              post.likes.push(state.currentUserId);
            }
          } else {
            post.likes = post.likes.filter(id => id !== state.currentUserId);
          }
        }
      });
  },
});

export const { clearFeedError, setCurrentUser } = feedSlice.actions;
export default feedSlice.reducer;
