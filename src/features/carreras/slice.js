import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCarreras, getCarreraById } from './service';

export const fetchCarreras = createAsyncThunk(
  'carreras/fetchCarreras',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCarreras();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar carreras');
    }
  }
);

export const fetchCarreraById = createAsyncThunk(
  'carreras/fetchCarreraById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getCarreraById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar carrera');
    }
  }
);

const carrerasSlice = createSlice({
  name: 'carreras',
  initialState: {
    carreras: [],
    currentCarrera: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCarrerasError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarreras.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarreras.fulfilled, (state, action) => {
        state.loading = false;
        state.carreras = action.payload;
      })
      .addCase(fetchCarreras.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCarreraById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarreraById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCarrera = action.payload;
      })
      .addCase(fetchCarreraById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCarrerasError } = carrerasSlice.actions;
export default carrerasSlice.reducer;
