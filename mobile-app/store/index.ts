import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profileSlice';
import listingsReducer from './listingsSlice';
import matchesReducer from './matchesSlice';
import messagesReducer from './messagesSlice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    listings: listingsReducer,
    matches: matchesReducer,
    messages: messagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
