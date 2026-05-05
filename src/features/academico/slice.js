import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk para cargar datos académicos
export const fetchDatosAcademicos = createAsyncThunk(
  'academico/fetchDatos',
  async (estudianteId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3000/api/academico/dashboard/${estudianteId}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk para cargar resumen académico
export const fetchResumenAcademico = createAsyncThunk(
  'academico/fetchResumen',
  async (estudianteId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3000/api/academico/resumen/${estudianteId}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const academicoSlice = createSlice({
  name: 'academico',
  initialState: {
    // Estado de los datos
    datosCompletos: null,
    resumen: null,
    
    // Estados de carga
    loading: false,
    loadingResumen: false,
    
    // Errores
    error: null,
    errorResumen: null,
    
    // Estado actual del estudiante seleccionado
    estudianteActual: null,
    
    // Cache para evitar recargas innecesarias
    lastUpdated: null,
  },
  reducers: {
    // Acción para limpiar errores
    clearError: (state) => {
      state.error = null;
      state.errorResumen = null;
    },
    
    // Acción para cambiar estudiante
    setEstudianteActual: (state, action) => {
      state.estudianteActual = action.payload;
      // Limpiar datos cuando cambia el estudiante
      state.datosCompletos = null;
      state.resumen = null;
      state.error = null;
      state.errorResumen = null;
    },
    
    // Acción para limpiar todos los datos
    clearDatos: (state) => {
      state.datosCompletos = null;
      state.resumen = null;
      state.error = null;
      state.errorResumen = null;
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch datos académicos completos
      .addCase(fetchDatosAcademicos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatosAcademicos.fulfilled, (state, action) => {
        state.loading = false;
        state.datosCompletos = action.payload;
        state.error = null;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchDatosAcademicos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.datosCompletos = null;
      })
      
      // Fetch resumen académico
      .addCase(fetchResumenAcademico.pending, (state) => {
        state.loadingResumen = true;
        state.errorResumen = null;
      })
      .addCase(fetchResumenAcademico.fulfilled, (state, action) => {
        state.loadingResumen = false;
        state.resumen = action.payload;
        state.errorResumen = null;
      })
      .addCase(fetchResumenAcademico.rejected, (state, action) => {
        state.loadingResumen = false;
        state.errorResumen = action.payload;
        state.resumen = null;
      });
  },
});

export const { clearError, setEstudianteActual, clearDatos } = academicoSlice.actions;

// Selectores
export const selectDatosAcademicos = (state) => state.academico.datosCompletos;
export const selectResumenAcademico = (state) => state.academico.resumen;
export const selectAcademicoLoading = (state) => state.academico.loading;
export const selectAcademicoError = (state) => state.academico.error;
export const selectEstudianteActual = (state) => state.academico.estudianteActual;

export default academicoSlice.reducer;