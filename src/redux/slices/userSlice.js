import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  profile: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.profile = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.profile = null;
    },
    mockLogin: (state) => {
      state.isAuthenticated = true;
      state.profile = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };
    },
  },
});

export const { login, logout, mockLogin } = userSlice.actions;
export default userSlice.reducer;
