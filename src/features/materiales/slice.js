import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getMateriales,
  getMaterias,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  rateMaterial
} from './service';
import { SORT_OPTIONS } from './constants';

export const fetchMateriales = createAsyncThunk(
  'materiales/fetchMateriales',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getMateriales(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMaterias = createAsyncThunk(
  'materiales/fetchMaterias',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMaterias();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addMaterial = createAsyncThunk(
  'materiales/addMaterial',
  async (materialData, { rejectWithValue }) => {
    try {
      const response = await createMaterial(materialData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editMaterial = createAsyncThunk(
  'materiales/editMaterial',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateMaterial(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeMaterial = createAsyncThunk(
  'materiales/removeMaterial',
  async (id, { rejectWithValue }) => {
    try {
      await deleteMaterial(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rateMaterialThunk = createAsyncThunk(
  'materiales/rateMaterial',
  async ({ id, value, usuarioId }, { rejectWithValue }) => {
    try {
      const response = await rateMaterial(id, value, usuarioId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  list: [],
  materias: [],
  loading: false,
  error: null,
  filter: {
    materiaId: null,
    search: '',
    sortBy: SORT_OPTIONS.FECHA_DESC
  },
  operationLoading: null
};

const materialesSlice = createSlice({
  name: 'materiales',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilter: (state) => {
      state.filter = initialState.filter;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMateriales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMateriales.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchMateriales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMaterias.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaterias.fulfilled, (state, action) => {
        state.loading = false;
        state.materias = action.payload;
      })
      .addCase(fetchMaterias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addMaterial.pending, (state) => {
        state.operationLoading = 'creating';
        state.error = null;
      })
      .addCase(addMaterial.fulfilled, (state, action) => {
        state.operationLoading = null;
        state.list.unshift(action.payload);
      })
      .addCase(addMaterial.rejected, (state, action) => {
        state.operationLoading = null;
        state.error = action.payload;
      })
      .addCase(editMaterial.pending, (state) => {
        state.operationLoading = 'updating';
        state.error = null;
      })
      .addCase(editMaterial.fulfilled, (state, action) => {
        state.operationLoading = null;
        const index = state.list.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(editMaterial.rejected, (state, action) => {
        state.operationLoading = null;
        state.error = action.payload;
      })
      .addCase(removeMaterial.fulfilled, (state, action) => {
        state.list = state.list.filter(m => m.id !== action.payload);
      })
      .addCase(rateMaterialThunk.pending, (state) => {
        state.operationLoading = 'rating';
      })
      .addCase(rateMaterialThunk.fulfilled, (state, action) => {
        state.operationLoading = null;
        const index = state.list.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(rateMaterialThunk.rejected, (state, action) => {
        state.operationLoading = null;
        state.error = action.payload;
      });
  }
});

export const { setFilter, clearFilter, clearError } = materialesSlice.actions;
export default materialesSlice.reducer;