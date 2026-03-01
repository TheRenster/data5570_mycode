import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AppState = {
  favoriteNames: string[];
  count: number;
};

const initialState: AppState = {
  favoriteNames: [],
  count: 0,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    addFavorite: (state, action: PayloadAction<string>) => {
      const name = action.payload.trim();
      if (name && !state.favoriteNames.includes(name)) {
        state.favoriteNames.push(name);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.favoriteNames = state.favoriteNames.filter((n) => n !== action.payload);
    },
    incrementCount: (state) => {
      state.count += 1;
    },
    decrementCount: (state) => {
      state.count -= 1;
    },
  },
});

export const { addFavorite, removeFavorite, incrementCount, decrementCount } = appSlice.actions;
export default appSlice.reducer;
