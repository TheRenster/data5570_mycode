import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiBaseUrl } from '@/constants/api';

export const fetchMessages = createAsyncThunk('messages/fetch', async (profileId: number) => {
  const res = await fetch(`${getApiBaseUrl()}/api/messages/${profileId}/`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
});

export const sendMessage = createAsyncThunk(
  'messages/send',
  async (data: { sender: number; receiver: number; body: string }) => {
    const res = await fetch(`${getApiBaseUrl()}/api/messages/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    allMessages: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.allMessages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.loading = false;
        state.error = 'Failed to load messages';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.allMessages.push(action.payload);
      });
  },
});

export default messagesSlice.reducer;
