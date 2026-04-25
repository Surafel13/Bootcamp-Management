import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Division } from './types';

const initialState: Division[] = [];

const divisionsSlice = createSlice({
  name: 'divisions',
  initialState,
  reducers: {
    addDivision: (state, action: PayloadAction<Division>) => {
      state.push(action.payload);
    },
    updateDivision: (state, action: PayloadAction<Division>) => {
      const index = state.findIndex(d => d._id === action.payload._id);
      if (index !== -1) state[index] = action.payload;
    },
    deleteDivision: (state, action: PayloadAction<number>) => {
      state.splice(action.payload, 1);
    },
  },
});

export const { addDivision, updateDivision, deleteDivision } = divisionsSlice.actions;
export default divisionsSlice.reducer;