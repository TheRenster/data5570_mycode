import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiBaseUrl } from '@/constants/api';

export const fetchMatches = createAsyncThunk(
  'matches/fetch',
  async (profileId: number, { rejectWithValue }) => {
    const url = `${getApiBaseUrl()}/api/matches/${profileId}/`;
    try {
      const res = await fetch(url);
      const text = await res.text();
      if (!res.ok) {
        let detail = text;
        try {
          const j = JSON.parse(text) as { detail?: string; error?: string };
          detail = j.detail || j.error || text;
        } catch {
          /* raw text */
        }
        return rejectWithValue(`HTTP ${res.status}: ${detail.slice(0, 400)}`);
      }
      try {
        return JSON.parse(text);
      } catch {
        return rejectWithValue('Matches API returned invalid JSON');
      }
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error fetching matches');
    }
  },
);

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
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
        state.error = null;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch matches';
      });
  },
});

export default matchesSlice.reducer;
