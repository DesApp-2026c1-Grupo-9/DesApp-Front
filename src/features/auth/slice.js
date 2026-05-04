import { createSlice } from '@reduxjs/toolkit';

const MOCK_STUDENTS = [
  { id: 1, nombre: 'Ana', apellido: 'García', email: 'ana.garcia@estudiante.unahur.edu.ar', avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=random' },
  { id: 2, nombre: 'Carlos', apellido: 'Rodríguez', email: 'carlos.rodriguez@estudiante.unahur.edu.ar', avatarUrl: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=random' },
  { id: 3, nombre: 'María', apellido: 'González', email: 'maria.gonzalez@estudiante.unahur.edu.ar', avatarUrl: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=random' },
  { id: 4, nombre: 'Juan', apellido: 'Martínez', email: 'juan.martinez@estudiante.unahur.edu.ar', avatarUrl: 'https://ui-avatars.com/api/?name=Juan+Martinez&background=random' },
  { id: 5, nombre: 'Sofía', apellido: 'López', email: 'sofia.lopez@estudiante.unahur.edu.ar', avatarUrl: 'https://ui-avatars.com/api/?name=Sofia+Lopez&background=random' },
  { id: 6, nombre: 'Diego', apellido: 'Fernández', email: 'diego.fernandez@estudiante.unahur.edu.ar', avatarUrl: 'https://ui-avatars.com/api/?name=Diego+Fernandez&background=random' },
  { id: 7, nombre: 'Valentina', apellido: 'Pérez', email: 'valentina.perez@estudiante.unahur.edu.ar', avatarUrl: 'https://ui-avatars.com/api/?name=Valentina+Perez&background=random' },
  { id: 8, nombre: 'Tomás', apellido: 'Silva', email: 'tomas.silva@estudiante.unahur.edu.ar', avatarUrl: 'https://ui-avatars.com/api/?name=Tomas+Silva&background=random' },
  { id: 9, nombre: 'Camila', apellido: 'Torres', email: 'camila.torres@estudiante.unahur.edu.ar', avatarUrl: 'https://ui-avatars.com/api/?name=Camila+Torres&background=random' },
  { id: 10, nombre: 'Nicolás', apellido: 'Morales', email: 'nicolas.morales@estudiante.unahur.edu.ar', avatarUrl: 'https://ui-avatars.com/api/?name=Nicolas+Morales&background=random' },
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
