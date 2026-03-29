import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiBaseUrl } from '@/constants/api';

export type CreateProfilePayload = {
  user_name: string;
  bio: string;
  zip_code: string;
  search_radius_miles: number;
};

function parseApiError(text: string): string {
  try {
    const j = JSON.parse(text) as Record<string, unknown>;
    if (typeof j.detail === 'string') return j.detail;
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

export const fetchAllProfiles = createAsyncThunk('profile/fetchAll', async () => {
  const res = await fetch(`${getApiBaseUrl()}/api/profiles/`);
  if (!res.ok) throw new Error('Failed to fetch profiles');
  return res.json();
});

export const createProfile = createAsyncThunk(
  'profile/create',
  async (data: CreateProfilePayload, { rejectWithValue }) => {
    const url = `${getApiBaseUrl()}/api/profiles/`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : 'Network error — is Django running? On web use http://localhost:8081 → API at ' +
            getApiBaseUrl();
      return rejectWithValue(msg);
    }
    const text = await res.text();
    if (!res.ok) {
      return rejectWithValue(parseApiError(text) || `HTTP ${res.status}`);
    }
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      return rejectWithValue('Server returned invalid JSON');
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    myProfile: null as Record<string, unknown> | null,
    allProfiles: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.allProfiles = action.payload;
      })
      .addCase(fetchAllProfiles.rejected, (state) => {
        state.loading = false;
        state.error = 'Could not load profiles';
      })
      .addCase(createProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload;
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to create profile';
      });
  },
});

export default profileSlice.reducer;
