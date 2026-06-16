import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getSesiones,
  createSesion,
  updateSesion,
  deleteSesion,
  joinSesion,
  getParticipantes,
  approveParticipante,
  rejectParticipante,
  leaveSesion
} from './service';

const transformBackendSesion = (sesion) => {
  return {
    id: sesion.id,
    materiaId: sesion.materiaId,
    materia: sesion.Materia || sesion.materia,
    tema: sesion.tema,
    tipo: sesion.tipo,
    link: sesion.link,
    ubicacion: sesion.ubicacion,
    fechaHora: sesion.fechaHora,
    duracion: sesion.duracion,
    cupos: sesion.cupos,
    descripcion: sesion.descripcion,
    necesidadAprobacion: sesion.necesidadAprobacion,
    estado: sesion.estado,
    creadorId: sesion.creadorId,
    creador: sesion.creador,
    participantes: sesion.participantes || []
  };
};

export const fetchSesiones = createAsyncThunk(
  'sesiones/fetchSesiones',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getSesiones(params);
      const sesiones = response.data.data || response.data || [];
      return sesiones.map(s => transformBackendSesion(s));
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addSesion = createAsyncThunk(
  'sesiones/addSesion',
  async ({ sesionData, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await createSesion({ ...sesionData, usuarioId });
      return transformBackendSesion(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const editSesion = createAsyncThunk(
  'sesiones/editSesion',
  async ({ sesionId, sesionData, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await updateSesion(sesionId, { ...sesionData, usuarioId });
      return transformBackendSesion(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeSesion = createAsyncThunk(
  'sesiones/removeSesion',
  async ({ sesionId, usuarioId }, { rejectWithValue }) => {
    try {
      await deleteSesion(sesionId, usuarioId);
      return sesionId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const joinToSesion = createAsyncThunk(
  'sesiones/joinToSesion',
  async ({ sesionId, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await joinSesion(sesionId, usuarioId);
      return { sesionId, participante: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchParticipantes = createAsyncThunk(
  'sesiones/fetchParticipantes',
  async ({ sesionId, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await getParticipantes(sesionId, usuarioId);
      return { sesionId, participantes: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const approveParticipanteThunk = createAsyncThunk(
  'sesiones/approveParticipante',
  async ({ sesionId, participanteId, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await approveParticipante(sesionId, participanteId, usuarioId);
      return { sesionId, participante: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const rejectParticipanteThunk = createAsyncThunk(
  'sesiones/rejectParticipante',
  async ({ sesionId, participanteId, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await rejectParticipante(sesionId, participanteId, usuarioId);
      return { sesionId, participante: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const leaveSesionThunk = createAsyncThunk(
  'sesiones/leaveSesion',
  async ({ sesionId, participanteId, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await leaveSesion(sesionId, participanteId, usuarioId);
      return { sesionId, participante: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const sesionesSlice = createSlice({
  name: 'sesiones',
  initialState: {
    list: [],
    loading: false,
    error: null,
    currentUserId: null,
    operationLoading: null
  },
  reducers: {
    clearSesionesError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUserId = action.payload;
    },
    setOperationLoading: (state, action) => {
      state.operationLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSesiones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSesiones.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSesiones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addSesion.pending, (state) => {
        state.error = null;
        state.operationLoading = { action: 'creating' };
      })
      .addCase(addSesion.fulfilled, (state, action) => {
        state.operationLoading = null;
        state.list.unshift(action.payload);
      })
      .addCase(addSesion.rejected, (state, action) => {
        state.operationLoading = null;
        state.error = action.payload;
      })
      .addCase(editSesion.pending, (state) => {
        state.error = null;
      })
      .addCase(editSesion.fulfilled, (state, action) => {
        state.operationLoading = null;
        const index = state.list.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(editSesion.rejected, (state, action) => {
        state.operationLoading = null;
        state.error = action.payload;
      })
      .addCase(removeSesion.fulfilled, (state, action) => {
        const sesion = state.list.find(s => s.id === action.payload);
        if (sesion) sesion.estado = 'cancelada';
      })
      .addCase(joinToSesion.pending, (state, action) => {
        state.operationLoading = { action: 'joining', sesionId: action.meta.arg.sesionId };
      })
      .addCase(joinToSesion.fulfilled, (state, action) => {
        state.operationLoading = null;
        const { sesionId, participante } = action.payload;
        const sesion = state.list.find(s => s.id === sesionId);
        if (sesion) {
          sesion.participantes = [...(sesion.participantes || []), participante];
        }
      })
      .addCase(joinToSesion.rejected, (state, action) => {
        state.operationLoading = null;
      })
      .addCase(fetchParticipantes.fulfilled, (state, action) => {
        const { sesionId, participantes } = action.payload;
        const sesion = state.list.find(s => s.id === sesionId);
        if (sesion) {
          sesion.participantes = participantes;
        }
      })
      .addCase(approveParticipanteThunk.fulfilled, (state, action) => {
        const { sesionId, participante } = action.payload;
        const sesion = state.list.find(s => s.id === sesionId);
        if (sesion && sesion.participantes) {
          const idx = sesion.participantes.findIndex(p => p.id === participante.id);
          if (idx !== -1) {
            sesion.participantes[idx] = participante;
          }
        }
      })
      .addCase(rejectParticipanteThunk.fulfilled, (state, action) => {
        const { sesionId, participante } = action.payload;
        const sesion = state.list.find(s => s.id === sesionId);
        if (sesion && sesion.participantes) {
          const idx = sesion.participantes.findIndex(p => p.id === participante.id);
          if (idx !== -1) {
            sesion.participantes[idx] = participante;
          }
        }
      })
      .addCase(leaveSesionThunk.pending, (state, action) => {
        state.operationLoading = { action: 'leaving', sesionId: action.meta.arg.sesionId };
      })
      .addCase(leaveSesionThunk.fulfilled, (state, action) => {
        state.operationLoading = null;
        const { sesionId, participante } = action.payload;
        const sesion = state.list.find(s => s.id === sesionId);
        if (sesion && sesion.participantes) {
          sesion.participantes = sesion.participantes.filter(p => p.id !== participante.id);
        }
      })
      .addCase(leaveSesionThunk.rejected, (state, action) => {
        state.operationLoading = null;
      });
  }
});

export const { clearSesionesError, setCurrentUser, setOperationLoading } = sesionesSlice.actions;
export default sesionesSlice.reducer;