import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';
import * as authService from './service';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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

export const updateUserData = createAsyncThunk(
  'auth/updateUserData',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await authService.updateUser(id, data);
      const updatedUser = response.data.data;
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUser = { ...storedUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
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

function getInitialState() {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    students: [],
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,
    loadingStudents: false,
    preferencias: null,
    loadingPreferencias: false,
    errorPreferencias: null,
    conexiones: [],
    loadingConexiones: false,
    errorConexiones: null,
  };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
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
      localStorage.removeItem('user');
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
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchStudents.pending, (state) => {
        state.loadingStudents = true;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loadingStudents = false;
        state.students = action.payload;
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
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.user = action.payload;
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
