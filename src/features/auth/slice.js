import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const fetchStudents = createAsyncThunk(
  'auth/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/usuarios?rol=estudiante');
      return response.data.data.map(u => ({
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
        avatarUrl: u.avatarUrl || `https://ui-avatars.com/api/?name=${u.nombre}+${u.apellido}&background=random`
      }));
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
        // Restaurar usuario previo o usar el primero
        const storedId = parseInt(localStorage.getItem('mockStudentId'), 10);
        const found = action.payload.find(s => s.id === storedId);
        state.user = found || action.payload[0] || null;
      })
      .addCase(fetchStudents.rejected, (state) => {
        state.loadingStudents = false;
      });
  },
});

export const { setCredentials, logout, switchStudent } = authSlice.actions;
export default authSlice.reducer;
