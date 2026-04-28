import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeed, createPost, deletePost, likePost } from './service';

const MOCK_POSTS = [
  {
    id: 1,
    tipo: 'publicacion',
    contenido: '¡Buenas! Les comparto mis apuntes de Análisis Matemático I, fueron muy útiles para el parcial. ¡Suerte con los exámenes! 📚',
    autor: {
      id: 2,
      nombre: 'María González',
      avatar: null,
    },
    fecha: new Date(Date.now() - 1800000).toISOString(),
    likes: ['3', '4', '5'],
    liked: false,
    imagen: null,
  },
  {
    id: 2,
    tipo: 'evento_academico',
    tipoEvento: 'inscripcion',
    autor: {
      id: 3,
      nombre: 'Juan Pérez',
      avatar: null,
    },
    fecha: new Date(Date.now() - 7200000).toISOString(),
    materia: {
      nombre: 'Algoritmos y Estructuras de Datos',
      codigo: 'AYED-201',
    },
  },
  {
    id: 3,
    tipo: 'publicacion',
    contenido: 'Alguien tiene resuelto el TP3 de Física II? Necesito ayuda con el ejercicio de momento de inercia 🥺',
    autor: {
      id: 4,
      nombre: 'Sofia Rodriguez',
      avatar: null,
    },
    fecha: new Date(Date.now() - 14400000).toISOString(),
    likes: ['2'],
    liked: true,
    imagen: null,
  },
  {
    id: 4,
    tipo: 'evento_academico',
    tipoEvento: 'aprobacion',
    autor: {
      id: 5,
      nombre: 'Lucas Martínez',
      avatar: null,
    },
    fecha: new Date(Date.now() - 28800000).toISOString(),
    materia: {
      nombre: 'Introducción a la Programación',
      codigo: 'INTRO-101',
    },
  },
  {
    id: 5,
    tipo: 'publicacion',
    contenido: 'Quedó confirmada la sesión de estudio para mañana a las 18hs en el aula 305. Vamos a repasar para el parcial de Álgebra!',
    autor: {
      id: 2,
      nombre: 'María González',
      avatar: null,
    },
    fecha: new Date(Date.now() - 43200000).toISOString(),
    likes: ['3', '4', '5', '6'],
    liked: false,
    imagen: null,
  },
  {
    id: 6,
    tipo: 'evento_academico',
    tipoEvento: 'regularizacion',
    autor: {
      id: 6,
      nombre: 'Ana López',
      avatar: null,
    },
    fecha: new Date(Date.now() - 86400000).toISOString(),
    materia: {
      nombre: 'Química General',
      codigo: 'QUIM-101',
    },
  },
];

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFeed();
      return response.data;
    } catch (error) {
      return MOCK_POSTS;
    }
  }
);

export const addPost = createAsyncThunk(
  'feed/addPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await createPost(postData);
      return response.data;
    } catch (error) {
      const newPost = {
        id: Date.now(),
        tipo: 'publicacion',
        contenido: postData.contenido,
        autor: { id: 1, nombre: 'Usuario Actual', avatar: null },
        fecha: new Date().toISOString(),
        likes: [],
        liked: false,
        imagen: null,
      };
      return newPost;
    }
  }
);

export const removePost = createAsyncThunk(
  'feed/removePost',
  async (postId, { rejectWithValue }) => {
    try {
      await deletePost(postId);
      return postId;
    } catch (error) {
      return postId;
    }
  }
);

export const toggleLike = createAsyncThunk(
  'feed/toggleLike',
  async ({ postId, liked }, { rejectWithValue }) => {
    try {
      await likePost(postId, liked);
      return { postId, liked };
    } catch (error) {
      return { postId, liked };
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFeedError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(addPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post.id !== action.payload);
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          if (liked) {
            post.liked = false;
            post.likes = post.likes.filter(id => id !== 'currentUser');
          } else {
            post.liked = true;
            post.likes.push('currentUser');
          }
        }
      });
  },
});

export const { clearFeedError } = feedSlice.actions;
export default feedSlice.reducer;