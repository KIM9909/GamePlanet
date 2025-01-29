// Redux Toolkit의 필수 기능들을 임포트
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// API 통신을 위한 유틸리티 임포트
import { UserAPI } from "../../api/UserAPI";

// 로그인 비동기 액션 생성
// createAsyncThunk: Redux에서 비동기 작업을 처리하기 위한 액션 생성자
export const loginUser = createAsyncThunk(
  "auth/login", // 액션 타입 문자열: 'user/login/pending', 'user/login/fulfilled', 'user/login/rejected' 자동 생성
  async (credentials) => {
    try {
      // UserAPI를 통해 로그인 요청 수행
      const token = await UserAPI.login(credentials);
      return token; // 성공 시 토큰 반환
    } catch (error) {
      // 에러 발생 시 에러 메시지 전달
      throw new Error(error.message || "로그인에 실패했습니다.");
    }
  }
);

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

// 유저 관련 Redux 슬라이스 생성
const UserSlice = createSlice({
  name: "user", // 슬라이스 이름 (액션 타입의 prefix로 사용)

  // 초기 상태 정의
  initialState: {
    token: localStorage.getItem("token"), // 브라우저에 저장된 토큰 가져오기
    userId: null,
    isLoading: false, // 로딩 상태
    error: null, // 에러 상태
    isModalOpen: false, // 모달 표시 상태
  },

  // 동기적 액션에 대한 리듀서
  reducers: {
    // 모달 열기/닫기 액션
    setModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    // 토큰 설정 액션 추가
    setToken: (state, action) => {
      state.token = action.payload;
    },
    // 로그아웃 액션
    logout: (state) => {
      state.token = null; // 토큰 제거
      localStorage.removeItem("token"); // localStorage에서도 토큰 제거
    },
  },

  // 비동기 액션에 대한 리듀서
  extraReducers: (builder) => {
    builder
      // 로그인 요청 시작
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true; // 로딩 상태 활성화
        state.error = null; // 이전 에러 초기화
      })
      // 로그인 요청 성공
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
        state.userId = JSON.parse(atob(action.payload.split(".")[1])).sub;
        state.isModalOpen = false;
      })
      // 로그인 요청 실패
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false; // 로딩 상태 비활성화
        state.error = action.error.message; // 에러 메시지 저장
      })

      // 로그아웃 요청 시작
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // 로그아웃 요청 성공
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.token = null;
        state.error = null;
      })
      // 로그아웃 요청 실패
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// 액션 생성자들을 내보내기
export const { setModalOpen, setToken, logout } = UserSlice.actions;
// 리듀서를 내보내기
export default UserSlice.reducer;
