import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getConexiones,
  getPendientes,
  sendInvitation,
  respondInvitation,
  removeConexion,
} from './service';

export const fetchConexiones = createAsyncThunk(
  'conexiones/fetchConexiones',
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await getConexiones(usuarioId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener conexiones'
      );
    }
  }
);

export const fetchPendientes = createAsyncThunk(
  'conexiones/fetchPendientes',
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await getPendientes(usuarioId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al obtener solicitudes pendientes'
      );
    }
  }
);

export const inviteContact = createAsyncThunk(
  'conexiones/inviteContact',
  async ({ email, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await sendInvitation(email, usuarioId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al enviar invitación'
      );
    }
  }
);

export const respondToInvitation = createAsyncThunk(
  'conexiones/respondToInvitation',
  async ({ id, estado, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await respondInvitation(id, estado, usuarioId);
      return { data: response.data, id, estado };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al responder invitación'
      );
    }
  }
);

export const deleteConexion = createAsyncThunk(
  'conexiones/deleteConexion',
  async ({ id, usuarioId }, { rejectWithValue }) => {
    try {
      await removeConexion(id, usuarioId);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al eliminar conexión'
      );
    }
  }
);

const conexionesSlice = createSlice({
  name: 'conexiones',
  initialState: {
    list: [],
    requests: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearConexionesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConexiones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConexiones.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchConexiones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPendientes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendientes.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchPendientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(inviteContact.fulfilled, (state, action) => {
        state.requests.push(action.payload.data);
      })
      .addCase(inviteContact.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(respondToInvitation.fulfilled, (state, action) => {
        const { id, estado } = action.payload;
        state.requests = state.requests.filter((r) => r.id !== id);
        if (estado === 'aceptada') {
          state.list.push(action.payload.data);
        }
      })
      .addCase(respondToInvitation.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteConexion.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteConexion.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearConexionesError } = conexionesSlice.actions;
export default conexionesSlice.reducer;
