// Axios 라이브러리 임포트
import axios from "axios";

// Axios 인스턴스 생성 및 기본 설정
const API = axios.create({
  baseURL: "http://localhost:8090", // API 서버 기본 URL
  headers: {
    "Content-Type": "application/json", // 기본 Content-Type 설정
  },
});

// 요청 인터셉터 설정
// 모든 요청이 실행되기 전에 실행되는 미들웨어
API.interceptors.request.use(
  (config) => {
    // localStorage에서 인증 토큰 가져오기
    const token = localStorage.getItem("token");
    // 토큰이 존재하면 요청 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 요청 전송 중 에러 발생 시 처리
    return Promise.reject(error);
  }
);

// API 함수들을 담은 객체
export const UserAPI = {
  // 로그인 API 호출 함수
  login: async (credentials) => {
    try {
      // POST 요청으로 로그인 시도
      const response = await API.post("/auth/login", credentials);
      // 응답에서 토큰을 받아오면 localStorage에 저장
      if (response.data) {
        localStorage.setItem("token", response.data);
        console.log(response.data);
      }
      return response.data; // 토큰 반환
    } catch (error) {
      // 에러 발생 시 처리
      // response가 있으면 서버에서 전달한 에러 메시지 사용, 없으면 기본 메시지 사용
      throw error.response?.data || "로그인에 실패했습니다.";
    }
  },

  register: async (userData) => {
    try {
      const response = await API.post("/user/register", userData);
      return response.status === 201; // 회원가입 성공 여부만 반환
    } catch (error) {
      throw error.response?.data || "회원가입에 실패했습니다.";
    }
  },

  checkNickname: async (nickname) => {
    try {
      const response = await API.get(`/user/checkNickname/${nickname}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || "닉네임 중복 검사에 실패했습니다.";
    }
  },

  checkEmail: async (email) => {
    try {
      const response = await API.get(`/user/checkEmail/${email}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || "이메일 중복 검사에 실패했습니다.";
    }
  },

  logout: async () => {
    try {
      // POST 요청으로 로그아웃 요청
      await API.post("/user/logout");
      // 로컬 스토리지의 토큰 제거
      localStorage.removeItem("token");
    } catch (error) {
      throw error.response?.data || "로그아웃에 실패했습니다.";
    }
  },

  getProfile: async (userId) => {
    try {
      const response = await API.get(`/profile/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || "프로필 정보를 불러오는데 실패했습니다.";
    }
  },
};

export default UserAPI;
