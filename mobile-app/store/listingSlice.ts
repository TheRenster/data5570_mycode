import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'http://3.139.94.75:8000';

export const fetchListings = createAsyncThunk('listings/fetchAll', async () => {
  const res = await fetch(`${BASE_URL}/api/listings/`);
  return res.json();
});

export const createListing = createAsyncThunk('listings/create', async (data: {
  profile: number; title: string; listing_type: string; is_local: boolean;
}) => {
  const res = await fetch(`${BASE_URL}/api/listings/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
});

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
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.listings = action.payload;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.listings.push(action.payload);
      });
  },
});

export default listingsSlice.reducer;
