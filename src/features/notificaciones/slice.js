import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getNotificaciones,
  getContador,
  marcarTodasLeidas,
} from './service';

export const fetchNotificaciones = createAsyncThunk(
  'notificaciones/fetch',
  async ({ estudianteId, noLeidas, page = 1 } = {}, { rejectWithValue }) => {
    try {
      const params = { estudianteId, page };
      if (noLeidas) params.noLeidas = 'true';
      const response = await getNotificaciones(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar notificaciones');
    }
  }
);

export const fetchContador = createAsyncThunk(
  'notificaciones/fetchContador',
  async (estudianteId, { rejectWithValue }) => {
    try {
      const response = await getContador({ estudianteId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener contador');
    }
  }
);

export const readAllNotificaciones = createAsyncThunk(
  'notificaciones/readAll',
  async (estudianteId, { rejectWithValue }) => {
    try {
      const response = await marcarTodasLeidas({ estudianteId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al marcar todas como leídas');
    }
  }
);

const notificacionesSlice = createSlice({
  name: 'notificaciones',
  initialState: {
    lista: [],
    total: 0,
    page: 1,
    totalPages: 0,
    noLeidas: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificaciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificaciones.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchNotificaciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchContador.fulfilled, (state, action) => {
        state.noLeidas = action.payload.noLeidas;
      })
      .addCase(readAllNotificaciones.fulfilled, (state) => {
        state.lista.forEach((n) => {
          n.leido = true;
        });
        state.noLeidas = 0;
      });
  },
});

export const { clearError } = notificacionesSlice.actions;
export default notificacionesSlice.reducer;
