import { createSlice } from '@reduxjs/toolkit';

const MOCK_STUDENTS = [
  { id: 1, nombre: 'Juana', apellido: 'Azurduy', email: 'juana.azurduy@estudiante.unahur.edu.ar', avatarUrl: 'http://www.laizquierdadiario.com/IMG/arton21559.jpg' },
  { id: 2, nombre: 'José', apellido: 'Artigas', email: 'jose.artigas@estudiante.unahur.edu.ar', avatarUrl: 'https://www.famousbirthdays.com/faces/artigas-jose-image.jpg' },
  { id: 3, nombre: 'Simón', apellido: 'Bolívar', email: 'simon.bolivar@estudiante.unahur.edu.ar', avatarUrl: 'https://img.goraymi.com/2019/01/15/95f0f23f742a6f7a28fd225745095d04_lg.jpg' },
];

const storedStudentId = localStorage.getItem('mockStudentId');
const initialStudent = MOCK_STUDENTS.find(s => s.id === parseInt(storedStudentId, 10)) || MOCK_STUDENTS[0];

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialStudent,
    students: MOCK_STUDENTS,
    token: null,
    isAuthenticated: false,
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
});

export const { setCredentials, logout, switchStudent } = authSlice.actions;
export default authSlice.reducer;
