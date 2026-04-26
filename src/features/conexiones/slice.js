import { createSlice } from '@reduxjs/toolkit';

const conexionesSlice = createSlice({
  name: 'conexiones',
  initialState: {
    list: [],
    requests: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default conexionesSlice.reducer;
