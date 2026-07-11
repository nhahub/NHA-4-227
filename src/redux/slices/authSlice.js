import { createSlice } from '@reduxjs/toolkit';

const userFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const initialState = {
  userInfo: userFromStorage,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      state.loading = false;
      state.error = null;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('userInfo');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const { setCredentials, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
