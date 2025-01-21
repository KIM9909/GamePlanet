import axios from 'axios';

// 기본 API 설정
const API = axios.create({
  baseURL: 'http://localhost:8090',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰이 있다면 헤더에 추가
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => { 
    return Promise.reject(error);
  }
);

// API 함수들
export const UserAPI = {
  // 로그인
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      if (response.data) {
        localStorage.setItem('token', response.data);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || '로그인에 실패했습니다.';
    }
  },
};

export default UserAPI;