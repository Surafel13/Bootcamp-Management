import { createSlice } from '@reduxjs/toolkit';
import type { User } from './types';

interface AuthState {
  user: User | null;
  activeRole: string | null;
  activeDivisionId: string | null;
  token: string | null;
}

const storedUser = localStorage.getItem('user');
const parsedUser = storedUser ? JSON.parse(storedUser) : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: parsedUser,
    activeRole: parsedUser?.activeRole ?? null,
    activeDivisionId: parsedUser?.activeDivisionId ?? null,
    token: localStorage.getItem('token') ?? null,
  },
  reducers: {
    setCredentials(state, { payload }) {
      const { user, accessToken, refreshToken } = payload;
      state.user = user;
      state.activeRole = user.activeRole;
      state.activeDivisionId = user.activeDivisionId ?? null;
      state.token = accessToken;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    },
    switchRoleLocally(state, { payload }) {
      const { activeRole, activeDivisionId, accessToken, refreshToken } = payload;
      state.activeRole = activeRole;
      state.activeDivisionId = activeDivisionId ?? null;
      state.token = accessToken;
      if (state.user) {
        state.user.activeRole = activeRole;
        state.user.activeDivisionId = activeDivisionId ?? null;
      }
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    clearCredentials(state) {
      state.user = state.activeRole = state.activeDivisionId = state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, switchRoleLocally, clearCredentials } = authSlice.actions;
export default authSlice.reducer;

export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectActiveRole = (state: { auth: AuthState }) => state.auth.activeRole;
export const selectActiveDivisionId = (state: { auth: AuthState }) => state.auth.activeDivisionId;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.token;