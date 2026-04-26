import { createSlice } from '@reduxjs/toolkit';

const sesionesSlice = createSlice({
  name: 'sesiones',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default sesionesSlice.reducer;
