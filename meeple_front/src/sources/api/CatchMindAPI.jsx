import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8090/api",
  timeout: 5000, // 타임아웃 설정
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터
API.interceptors.request.use(
  (config) => {
    // 토큰이 필요한 경우 헤더에 추가
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러 처리 (인증 실패)
    if (error.response?.status === 401) {
      // 로그인 페이지로 리다이렉트 등의 처리
    }
    return Promise.reject(error);
  }
);

export default API;
