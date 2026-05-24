import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const fetchStudents = createAsyncThunk(
  'auth/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/usuarios', { params: { limit: 1000 } });
      return response.data.data.map(u => ({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
        rol: u.rol || 'estudiante',
        activo: u.activo,
        avatarUrl: u.avatarUrl || `https://ui-avatars.com/api/?name=${u.nombre}+${u.apellido}&background=random`,
        perfilPublico: u.perfilPublico ?? true,
        visibleEnDescubrir: u.visibleEnDescubrir ?? true,
        conexiones: []
      }));
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchConexiones = createAsyncThunk(
  'auth/fetchConexiones',
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/conexiones', {
        params: { usuarioId }
      });
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPreferencias = createAsyncThunk(
  'auth/fetchPreferencias',
  async (estudianteId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/novedades/preferencias/${estudianteId}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePreferencias = createAsyncThunk(
  'auth/updatePreferencias',
  async ({ estudianteId, preferencias }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/novedades/preferencias/${estudianteId}`, preferencias);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const storedStudentId = localStorage.getItem('mockStudentId');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    students: [],
    token: null,
    isAuthenticated: false,
    loadingStudents: false,
    preferencias: null,
    loadingPreferencias: false,
    errorPreferencias: null,
    conexiones: [],
    loadingConexiones: false,
    errorConexiones: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    switchStudent: (state, action) => {
      const student = state.students.find(s => s.id === action.payload);
      if (student) {
        state.user = student;
        localStorage.setItem('mockStudentId', student.id);
        state.preferencias = null;
        state.conexiones = [];
      }
    },
    clearPreferencias: (state) => {
      state.preferencias = null;
    },
    clearConexiones: (state) => {
      state.conexiones = [];
    },
    updateStudentProfileVisibility: (state, action) => {
      const { studentId, perfilPublico } = action.payload;
      const student = state.students.find(s => s.id === studentId);
      if (student) {
        student.perfilPublico = perfilPublico;
      }
    },
    updateStudentActiveStatus: (state, action) => {
      const { studentId, activo } = action.payload;
      const student = state.students.find(s => s.id === studentId);
      if (student) {
        student.activo = activo;
      }
      if (state.user?.id === studentId) {
        state.user.activo = activo;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loadingStudents = true;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loadingStudents = false;
        state.students = action.payload;
        const storedId = parseInt(localStorage.getItem('mockStudentId'), 10);
        const found = action.payload.find(s => s.id === storedId);
        if (found) {
          state.user = found;
        } else {
          state.user = action.payload[0] || null;
          if (state.user) {
            localStorage.setItem('mockStudentId', state.user.id);
          } else {
            localStorage.removeItem('mockStudentId');
          }
        }
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loadingStudents = false;
        state.errorStudents = action.payload;
      })
      .addCase(fetchConexiones.pending, (state) => {
        state.loadingConexiones = true;
        state.errorConexiones = null;
      })
      .addCase(fetchConexiones.fulfilled, (state, action) => {
        state.loadingConexiones = false;
        state.conexiones = action.payload.map(c => c.contacto.id);
      })
      .addCase(fetchConexiones.rejected, (state, action) => {
        state.loadingConexiones = false;
        state.errorConexiones = action.payload;
      })
      .addCase(fetchPreferencias.pending, (state) => {
        state.loadingPreferencias = true;
        state.errorPreferencias = null;
      })
      .addCase(fetchPreferencias.fulfilled, (state, action) => {
        state.loadingPreferencias = false;
        state.preferencias = action.payload;
      })
      .addCase(fetchPreferencias.rejected, (state, action) => {
        state.loadingPreferencias = false;
        state.errorPreferencias = action.payload;
      })
      .addCase(updatePreferencias.pending, (state) => {
        state.loadingPreferencias = true;
        state.errorPreferencias = null;
      })
      .addCase(updatePreferencias.fulfilled, (state, action) => {
        state.loadingPreferencias = false;
        state.preferencias = action.payload;
        if (state.user) {
          state.user.perfilPublico = action.payload.perfilPublico;
        }
        const student = state.students.find(s => s.id === state.user?.id);
        if (student) {
          student.perfilPublico = action.payload.perfilPublico;
        }
      })
      .addCase(updatePreferencias.rejected, (state, action) => {
        state.loadingPreferencias = false;
        state.errorPreferencias = action.payload;
      });
  }
});

export const { setCredentials, logout, switchStudent, clearPreferencias, clearConexiones, updateStudentProfileVisibility, updateStudentActiveStatus } = authSlice.actions;
export default authSlice.reducer;