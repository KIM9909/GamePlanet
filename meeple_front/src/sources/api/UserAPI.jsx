import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8090",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터 수정
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Bearer 토큰 형식으로 변경
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 수정
API.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Response Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      headers: error.config?.headers,
    });
    return Promise.reject(error.response?.data || error);
  }
);

export const UserAPI = {
  getProfile: async (userId) => {
    try {
      // /profile/ 엔드포인트 사용
      const response = await API.get(`/profile/${userId}`);
      return response;
    } catch (error) {
      console.error("Profile fetch error:", error);
      throw error;
    }
  },

  // 프로필 정보 수정
  updateProfile: async (userId, data) => {
    try {
      const response = await API.put(`/profile/${userId}`, data);
      return response.data;
    } catch (error) {
      // 자세한 에러 정보 로깅
      console.error("API Error:", error);
      throw new Error("프로필 수정에 실패했습니다.");
    }
  },

  // 비밀번호 변경
  updatePassword: async (userId, data) => {
    try {
      const response = await API.put(`/profile/${userId}/password`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || "비밀번호 변경에 실패했습니다.";
    }
  },

  // 로그인 API 호출 함수
  login: async (credentials) => {
    try {
      const response = await API.post("/auth/login", credentials);
      // 응답에서 토큰을 받아오면 localStorage에 저장
      if (response.data) {
        localStorage.setItem("token", response.data);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || "로그인에 실패했습니다.";
    }
  },

  // 회원가입 API 호출 함수
  register: async (userData) => {
    try {
      const response = await API.post("/user/register", userData);
      return response.status === 201;
    } catch (error) {
      throw error.response?.data || "회원가입에 실패했습니다.";
    }
  },

  // 닉네임 중복 체크
  checkNickname: async (nickname) => {
    try {
      const response = await API.get(`/user/checkNickname/${nickname}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || "닉네임 중복 검사에 실패했습니다.";
    }
  },

  // 이메일 중복 체크
  checkEmail: async (email) => {
    try {
      const response = await API.get(`/user/checkEmail/${email}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || "이메일 중복 검사에 실패했습니다.";
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await API.post("/auth/logout");
      localStorage.removeItem("token");
    } catch (error) {
      throw error.response?.data || "로그아웃에 실패했습니다.";
    }
  },

  // 회원 탈퇴
  deleteUser: async (userId, password) => {
    try {
      await API.delete(`/profile/${userId}/delete`, {
        data: { password },
      });
    } catch (error) {
      throw error.response?.data || "회원 탈퇴에 실패했습니다.";
    }
  },
};

export default UserAPI;
