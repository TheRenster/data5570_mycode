import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'http://3.139.94.75:8000';

export const fetchAllProfiles = createAsyncThunk('profile/fetchAll', async () => {
  const res = await fetch(`${BASE_URL}/api/profiles/`);
  return res.json();
});

export const createProfile = createAsyncThunk('profile/create', async (data: {
  user_name: string; bio: string; lat: number | null; lon: number | null;
}) => {
  const res = await fetch(`${BASE_URL}/api/profiles/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    myProfile: null as any,
    allProfiles: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProfiles.fulfilled, (state, action) => {
        state.allProfiles = action.payload;
      })
      .addCase(createProfile.pending, (state) => { state.loading = true; })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload;
      })
      .addCase(createProfile.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to create profile';
      });
  },
});

export default profileSlice.reducer;
