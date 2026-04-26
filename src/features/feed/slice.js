import { createSlice } from '@reduxjs/toolkit';

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    posts: [],
    loading: false,
    error: null,
  },
  reducers: {},
});

export default feedSlice.reducer;
