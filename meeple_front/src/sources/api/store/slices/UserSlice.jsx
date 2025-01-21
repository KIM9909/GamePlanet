import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {UserAPI} from '../../UserAPI'

// 로그인 액션 생성
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials) => {
    try {
      const token = await UserAPI.login(credentials);
      return token;
    } catch (error) {
      throw new Error(error.message || '로그인에 실패했습니다.');
    }
  }
);

const UserSlice = createSlice({
  name: 'user',
  initialState: {
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,
    isModalOpen: false,
  },

  reducers: {
    setModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    logout: (state) => {
      state.token = null;
      localStorage.removeItem
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(loginUser.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false
      state.token = action.payload
      state.isModalOpen = false
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message
    })
  }
})

export const {setModalOpen, logout} = UserSlice.actions
export default UserSlice.reducer