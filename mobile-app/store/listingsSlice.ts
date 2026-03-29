import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiBaseUrl } from '@/constants/api';

function parseApiError(text: string): string {
  try {
    const j = JSON.parse(text) as Record<string, unknown>;
    const parts: string[] = [];
    for (const [k, v] of Object.entries(j)) {
      if (Array.isArray(v)) parts.push(`${k}: ${v.join(', ')}`);
      else if (typeof v === 'string') parts.push(`${k}: ${v}`);
      else parts.push(`${k}: ${JSON.stringify(v)}`);
    }
    return parts.join('\n') || text;
  } catch {
    return text;
  }
}

export const fetchListings = createAsyncThunk('listings/fetchAll', async () => {
  const res = await fetch(`${getApiBaseUrl()}/api/listings/`);
  if (!res.ok) throw new Error('Failed to fetch listings');
  return res.json();
});

export const createListing = createAsyncThunk(
  'listings/create',
  async (
    data: { profile: number; title: string; listing_type: string; is_local: boolean },
    { rejectWithValue },
  ) => {
    const res = await fetch(`${getApiBaseUrl()}/api/listings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const text = await res.text();
    if (!res.ok) {
      return rejectWithValue(parseApiError(text));
    }
    try {
      return JSON.parse(text);
    } catch {
      return rejectWithValue('Invalid JSON from server');
    }
  },
);

const listingsSlice = createSlice({
  name: 'listings',
  initialState: {
    listings: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.loading = false;
        state.listings = action.payload;
      })
      .addCase(fetchListings.rejected, (state) => {
        state.loading = false;
        state.error = 'Could not load listings';
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.listings.push(action.payload);
      });
  },
});

export default listingsSlice.reducer;
