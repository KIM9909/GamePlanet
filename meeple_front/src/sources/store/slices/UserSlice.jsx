import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { UserAPI } from "../../api/UserAPI";

// JWT 디코딩 함수
const decodeToken = (token) => {
  try {
    const payloadBase64 = token.split(".")[1];
    // Base64 디코딩 시 UTF-8 문자열로 처리
    const payload = JSON.parse(decodeURIComponent(escape(atob(payloadBase64))));

    // 디코딩된 정보 출력
    console.log("사용자 ID:", payload.sub);
    console.log("권한:", payload.role);
    console.log("닉네임:", payload.nickname);
    console.log("토큰 발급 시간:", new Date(payload.iat * 1000));
    console.log("토큰 만료 시간:", new Date(payload.exp * 1000));

    return payload;
  } catch (error) {
    // UTF-8 디코딩에 실패한 경우 기존 방식으로 시도
    try {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64));
      return payload;
    } catch (fallbackError) {
      console.error("토큰 디코딩 실패:", fallbackError);
      return null;
    }
  }
};

// 토큰 유효성 검사 함수
const isTokenValid = (token) => {
  if (!token) return false;

  const payload = decodeToken(token);
  if (!payload) return false;

  return Date.now() < payload.exp * 1000;
};

// 초기 상태 설정
const initialToken = localStorage.getItem("token");
const initialPayload = decodeToken(initialToken);

export const loginUser = createAsyncThunk("auth/login", async (credentials) => {
  try {
    const token = await UserAPI.login(credentials);
    return token;
  } catch (error) {
    throw new Error(error.message || "로그인에 실패했습니다.");
  }
});

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

const UserSlice = createSlice({
  name: "user",
  initialState: {
    token: initialToken,
    userId: initialPayload?.sub || null,
    userRole: initialPayload?.role || null,
    userNickname: initialPayload?.nickname || null,
    isLoading: false,
    error: null,
    isModalOpen: false,
  },

  reducers: {
    setModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
      if (!action.payload) {
        state.error = null;
      }
    },
    setToken: (state, action) => {
      const token = action.payload;
      if (token && isTokenValid(token)) {
        const payload = decodeToken(token);
        state.token = token;
        state.userId = payload.sub;
        state.userRole = payload.role;
        state.userNickname = payload.nickname;
        localStorage.setItem("token", token);
      } else {
        state.token = null;
        state.userId = null;
        state.userRole = null;
        state.userNickname = null;
        localStorage.removeItem("token");
      }
    },
    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.userRole = null;
      state.userNickname = null;
      state.isModalOpen = false;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const token = action.payload;
        const payload = decodeToken(token);

        state.isLoading = false;
        state.token = token;
        state.userId = payload.sub;
        state.userRole = payload.role;
        state.userNickname = payload.nickname;
        state.isModalOpen = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.token = null;
        state.userId = null;
        state.userRole = null;
        state.userNickname = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setModalOpen, setToken, logout, clearError } = UserSlice.actions;
export default UserSlice.reducer;
