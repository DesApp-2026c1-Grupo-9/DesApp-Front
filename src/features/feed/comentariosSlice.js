import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';
import { likeComentario as likeService, unlikeComentario as unlikeService } from './comentariosService';

export const fetchComentarios = createAsyncThunk(
  'comentarios/fetchComentarios',
  async (novedadId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/novedades/${novedadId}/comentarios`);
      return { novedadId, comentarios: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar comentarios');
    }
  }
);

export const addComentario = createAsyncThunk(
  'comentarios/addComentario',
  async ({ novedadId, contenido, usuarioId, comentarioPadreId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/novedades/${novedadId}/comentarios`, { contenido, usuarioId, comentarioPadreId });
      return { novedadId, comentario: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear comentario');
    }
  }
);

export const removeComentario = createAsyncThunk(
  'comentarios/removeComentario',
  async ({ comentarioId, usuarioId, novedadId }, { rejectWithValue }) => {
    try {
      await api.delete(`/novedades/${novedadId}/comentarios/${comentarioId}`, { data: { usuarioId } });
      return { comentarioId, novedadId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar comentario');
    }
  }
);

export const editComentario = createAsyncThunk(
  'comentarios/editComentario',
  async ({ novedadId, comentarioId, contenido, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/novedades/${novedadId}/comentarios/${comentarioId}`, {
        contenido,
        usuarioId,
      });
      return { novedadId, comentario: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al editar comentario');
    }
  }
);

export const likeComentario = createAsyncThunk(
  'comentarios/likeComentario',
  async ({ novedadId, comentarioId, usuarioId }, { rejectWithValue }) => {
    try {
      await likeService(novedadId, comentarioId, usuarioId);
      return { novedadId, comentarioId, liked: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al dar like al comentario');
    }
  }
);

export const unlikeComentario = createAsyncThunk(
  'comentarios/unlikeComentario',
  async ({ novedadId, comentarioId, usuarioId }, { rejectWithValue }) => {
    try {
      await unlikeService(novedadId, comentarioId, usuarioId);
      return { novedadId, comentarioId, liked: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al quitar like al comentario');
    }
  }
);

const comentariosSlice = createSlice({
  name: 'comentarios',
  initialState: {
    byNovedad: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearComentariosError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComentarios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComentarios.fulfilled, (state, action) => {
        state.loading = false;
        const { novedadId, comentarios } = action.payload;
        state.byNovedad[novedadId] = comentarios;
      })
      .addCase(fetchComentarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addComentario.fulfilled, (state, action) => {
        const { novedadId, comentario } = action.payload;
        if (!state.byNovedad[novedadId]) {
          state.byNovedad[novedadId] = [];
        }
        if (comentario.comentarioPadreId) {
          const parent = state.byNovedad[novedadId].find(c => c.id === comentario.comentarioPadreId);
          if (parent) {
            if (!parent.respuestas) parent.respuestas = [];
            parent.respuestas.push(comentario);
          }
        } else {
          state.byNovedad[novedadId].push(comentario);
        }
      })
      .addCase(removeComentario.fulfilled, (state, action) => {
        const { comentarioId, novedadId } = action.payload;
        if (state.byNovedad[novedadId]) {
          state.byNovedad[novedadId] = state.byNovedad[novedadId].filter(
            c => c.id !== comentarioId
          );
          state.byNovedad[novedadId].forEach(c => {
            if (c.respuestas) {
              c.respuestas = c.respuestas.filter(r => r.id !== comentarioId);
            }
          });
        }
      })
      .addCase(editComentario.fulfilled, (state, action) => {
        const { novedadId, comentario } = action.payload;
        if (state.byNovedad[novedadId]) {
          const parent = state.byNovedad[novedadId].find(c => c.id === comentario.id);
          if (parent) {
            Object.assign(parent, comentario);
          } else {
            state.byNovedad[novedadId].forEach(c => {
              if (c.respuestas) {
                const idx = c.respuestas.findIndex(r => r.id === comentario.id);
                if (idx !== -1) {
                  c.respuestas[idx] = comentario;
                }
              }
            });
          }
        }
      })
      .addCase(likeComentario.fulfilled, (state, action) => {
        const { comentarioId, liked } = action.payload;
        Object.values(state.byNovedad).forEach(comentarios => {
          comentarios.forEach(c => {
            if (c.id === comentarioId) {
              c.liked = liked;
              c.likesCount = (c.likesCount || 0) + (liked ? 1 : -1);
            }
            if (c.respuestas) {
              const reply = c.respuestas.find(r => r.id === comentarioId);
              if (reply) {
                reply.liked = liked;
                reply.likesCount = (reply.likesCount || 0) + (liked ? 1 : -1);
              }
            }
          });
        });
      })
      .addCase(unlikeComentario.fulfilled, (state, action) => {
        const { comentarioId, liked } = action.payload;
        Object.values(state.byNovedad).forEach(comentarios => {
          comentarios.forEach(c => {
            if (c.id === comentarioId) {
              c.liked = liked;
              c.likesCount = (c.likesCount || 0) + (liked ? 1 : -1);
            }
            if (c.respuestas) {
              const reply = c.respuestas.find(r => r.id === comentarioId);
              if (reply) {
                reply.liked = liked;
                reply.likesCount = (reply.likesCount || 0) + (liked ? 1 : -1);
              }
            }
          });
        });
      });
  },
});

export const { clearComentariosError } = comentariosSlice.actions;
export default comentariosSlice.reducer;
