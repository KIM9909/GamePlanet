import { createSlice } from '@reduxjs/toolkit'

const UserSlice = createSlice({
  name: 'user',
  initialState: {
    isLoggedIn: false,
    userInfo: null,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userInfo = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  }
})

export const { setUser, logout, setError } = userSlice.actions;
export default UserSlice.reducer;