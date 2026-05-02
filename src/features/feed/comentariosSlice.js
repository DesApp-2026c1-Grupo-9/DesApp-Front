import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

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
  async ({ novedadId, contenido, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/novedades/${novedadId}/comentarios`, { contenido, usuarioId });
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
        state.byNovedad[novedadId].push(comentario);
      })
      .addCase(removeComentario.fulfilled, (state, action) => {
        const { comentarioId, novedadId } = action.payload;
        if (state.byNovedad[novedadId]) {
          state.byNovedad[novedadId] = state.byNovedad[novedadId].filter(
            c => c.id !== comentarioId
          );
        }
      })
      .addCase(editComentario.fulfilled, (state, action) => {
        const { novedadId, comentario } = action.payload;
        if (state.byNovedad[novedadId]) {
          const index = state.byNovedad[novedadId].findIndex(c => c.id === comentario.id);
          if (index !== -1) {
            state.byNovedad[novedadId][index] = comentario;
          }
        }
      });
  },
});

export const { clearComentariosError } = comentariosSlice.actions;
export default comentariosSlice.reducer;
