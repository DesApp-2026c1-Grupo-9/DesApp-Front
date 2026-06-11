import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getNotificaciones,
  getContador,
  marcarLeida,
  marcarTodasLeidas,
} from './service';

export const fetchNotificaciones = createAsyncThunk(
  'notificaciones/fetch',
  async ({ usuarioId, noLeidas, page = 1 } = {}, { rejectWithValue }) => {
    try {
      const params = { usuarioId, page };
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
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await getContador({ usuarioId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener contador');
    }
  }
);

export const readNotificacion = createAsyncThunk(
  'notificaciones/read',
  async ({ id, usuarioId }, { rejectWithValue }) => {
    try {
      await marcarLeida(id, { usuarioId });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al marcar como leída');
    }
  }
);

export const readAllNotificaciones = createAsyncThunk(
  'notificaciones/readAll',
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await marcarTodasLeidas({ usuarioId });
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
    setNoLeidas: (state, action) => {
      state.noLeidas = action.payload;
    },
    incrementNoLeidas: (state) => {
      state.noLeidas += 1;
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
      .addCase(readNotificacion.fulfilled, (state, action) => {
        const id = action.payload;
        const notif = state.lista.find((n) => n.id === id);
        if (notif) {
          notif.leido = true;
        }
        state.noLeidas = Math.max(0, state.noLeidas - 1);
      })
      .addCase(readAllNotificaciones.fulfilled, (state) => {
        state.lista.forEach((n) => {
          n.leido = true;
        });
        state.noLeidas = 0;
      });
  },
});

export const { clearError, setNoLeidas, incrementNoLeidas } = notificacionesSlice.actions;
export default notificacionesSlice.reducer;
