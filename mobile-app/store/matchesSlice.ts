import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'http://3.139.94.75:8000';

export const fetchMatches = createAsyncThunk('matches/fetch', async (profileId: number) => {
  const res = await fetch(`${BASE_URL}/api/matches/${profileId}/`);
  return res.json();
});

const matchesSlice = createSlice({
  name: 'matches',
  initialState: {
    matches: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => { state.loading = true; })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchMatches.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to fetch matches';
      });
  },
});

export default matchesSlice.reducer;
