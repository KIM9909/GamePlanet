import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UserAPI } from "../../api/UserAPI";

/**
 * JWT 토큰에서 userId를 추출하는 헬퍼 함수
 * @param {string} token - JWT 토큰
 * @returns {string|null} - 추출된 userId 또는 null
 */
const extractUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    // JWT 토큰의 페이로드(두 번째 부분)를 디코딩
    return JSON.parse(atob(token.split(".")[1])).sub;
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
};

// 앱 시작 시 localStorage에서 토큰을 가져와 초기 상태 설정
const initialToken = localStorage.getItem("token");
const initialUserId = extractUserIdFromToken(initialToken);

/**
 * 로그인 처리를 위한 비동기 액션 생성자
 * UserAPI를 통해 로그인 요청을 보내고 토큰을 반환
 */
export const loginUser = createAsyncThunk("auth/login", async (credentials) => {
  try {
    const token = await UserAPI.login(credentials);
    return token;
  } catch (error) {
    throw new Error(error.message || "로그인에 실패했습니다.");
  }
});

/**
 * 로그아웃 처리를 위한 비동기 액션 생성자
 * UserAPI를 통해 로그아웃 요청을 보냄
 */
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await UserAPI.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

/**
 * 유저 관련 Redux Slice
 * 인증 상태와 유저 정보를 관리
 */
const UserSlice = createSlice({
  name: "user",
  // 초기 상태 설정
  initialState: {
    token: initialToken,
    userId: initialUserId,
    isLoading: false,
    error: null,
    isModalOpen: false,
  },

  // 동기적 액션에 대한 리듀서들
  reducers: {
    // 모달 상태 변경
    setModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    // 토큰 설정 (로그인 시)
    setToken: (state, action) => {
      state.token = action.payload;
      state.userId = extractUserIdFromToken(action.payload);
    },
    // 로그아웃 처리
    logout: (state) => {
      state.token = null;
      state.userId = null;
      localStorage.removeItem("token");
    },
  },

  // 비동기 액션에 대한 리듀서들
  extraReducers: (builder) => {
    builder
      // 로그인 요청 시작
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // 로그인 성공
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
        state.userId = extractUserIdFromToken(action.payload);
        state.isModalOpen = false;
      })
      // 로그인 실패
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // 로그아웃 요청 시작
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // 로그아웃 성공
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.token = null;
        state.userId = null;
        state.error = null;
      })
      // 로그아웃 실패
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// 액션 생성자들을 export
export const { setModalOpen, setToken, logout } = UserSlice.actions;

// 리듀서를 export
export default UserSlice.reducer;
