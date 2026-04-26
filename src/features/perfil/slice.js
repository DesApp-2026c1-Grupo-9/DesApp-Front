import { createSlice } from '@reduxjs/toolkit';

const perfilSlice = createSlice({
  name: 'perfil',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
});

export default perfilSlice.reducer;
