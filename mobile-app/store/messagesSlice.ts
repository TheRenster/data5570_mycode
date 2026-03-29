import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = 'http://3.139.94.75:8000';

export const fetchMessages = createAsyncThunk('messages/fetch', async (profileId: number) => {
  const res = await fetch(`${BASE_URL}/api/messages/${profileId}/`);
  return res.json();
});

export const sendMessage = createAsyncThunk('messages/send', async (data: {
  sender: number; receiver: number; body: string;
}) => {
  const res = await fetch(`${BASE_URL}/api/messages/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
});

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
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.allMessages = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.allMessages.push(action.payload);
      });
  },
});

export default messagesSlice.reducer;
