import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

import { likeComentario as likeService, unlikeComentario as unlikeService } from './comentariosService';

const avatarFallback = (autor) => {
  if (!autor) return autor;
  if (!autor.avatarUrl) {
    autor.avatarUrl = `https://ui-avatars.com/api/?name=${autor.nombre}+${autor.apellido || ''}&background=random`;
  }
  return autor;
};

export const fetchComentarios = createAsyncThunk(
  'comentarios/fetchComentarios',
  async ({ novedadId, estudianteId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/novedades/${novedadId}/comentarios?estudianteId=${estudianteId}`);
      return { novedadId, comentarios: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar comentarios');
    }
  }
);

export const addComentario = createAsyncThunk(
  'comentarios/addComentario',
  async ({ novedadId, contenido, estudianteId, comentarioPadreId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/novedades/${novedadId}/comentarios`, { contenido, estudianteId, comentarioPadreId });
      return { novedadId, comentario: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear comentario');
    }
  }
);

export const removeComentario = createAsyncThunk(
  'comentarios/removeComentario',
  async ({ comentarioId, estudianteId, novedadId }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/novedades/${novedadId}/comentarios/${comentarioId}`, { data: { estudianteId } });
      return { comentarioId, novedadId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar comentario');
    }
  }
);

export const editComentario = createAsyncThunk(
  'comentarios/editComentario',
  async ({ novedadId, comentarioId, contenido, estudianteId }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/novedades/${novedadId}/comentarios/${comentarioId}`, {
        contenido,
        estudianteId,
      });
      return { novedadId, comentario: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al editar comentario');
    }
  }
);

export const likeComentario = createAsyncThunk(
  'comentarios/likeComentario',
  async ({ novedadId, comentarioId, estudianteId }, { rejectWithValue }) => {
    try {
      await likeService(novedadId, comentarioId, estudianteId);
      return { novedadId, comentarioId, liked: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al dar like al comentario');
    }
  }
);

export const unlikeComentario = createAsyncThunk(
  'comentarios/unlikeComentario',
  async ({ novedadId, comentarioId, estudianteId }, { rejectWithValue }) => {
    try {
      await unlikeService(novedadId, comentarioId, estudianteId);
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
    loadingByNovedad: {},
    error: null,
  },
  reducers: {
    clearComentariosError: (state) => {
      state.error = null;
    },
    clearNovedadComentarios: (state, action) => {
      const novedadId = action.payload;
      delete state.byNovedad[novedadId];
      delete state.loadingByNovedad[novedadId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComentarios.pending, (state, action) => {
        state.loadingByNovedad[action.meta.arg.novedadId] = true;
        state.error = null;
      })
      .addCase(fetchComentarios.fulfilled, (state, action) => {
        const { novedadId, comentarios } = action.payload;
        state.loadingByNovedad[novedadId] = false;
        state.byNovedad[novedadId] = comentarios;

        comentarios.forEach(c => {
          avatarFallback(c.autor);
          (c.respuestas || []).forEach(r => avatarFallback(r.autor));
        });
      })
      .addCase(fetchComentarios.rejected, (state, action) => {
        state.loadingByNovedad[action.meta.arg.novedadId] = false;
        state.error = action.payload;
      })
      .addCase(addComentario.fulfilled, (state, action) => {
        const { novedadId, comentario } = action.payload;
        avatarFallback(comentario.autor);
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

export const { clearComentariosError, clearNovedadComentarios } = comentariosSlice.actions;
export default comentariosSlice.reducer;
