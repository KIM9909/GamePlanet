import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
  // baseURL: `${import.meta.env.VITE_LOCAL_API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터에서 매 요청마다 토큰을 확인하고 추가
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 개선
API.interceptors.response.use(
  (response) => {
    // HTML 응답 체크를 더 엄격하게
    if (
      response.data &&
      typeof response.data === "string" &&
      (response.data.includes("<!DOCTYPE html>") ||
        response.data.includes("Please sign in"))
    ) {
      throw new Error("인증에 실패했습니다. 다시 로그인해주세요.");
    }

    return response.data;
  },
  (error) => {
    console.error("Response interceptor error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
);

export const VideoAPI = {
  createSession: async () => {
    try {
      const response = await API.post("/api/video/create-session");
      if (!response) {
        throw new Error("No response received from createSession");
      }
      return response;
    } catch (error) {
      console.error("Failed to create session:", error);
      throw error;
    }
  },

  generateToken: async (sessionId) => {
    try {
      if (!sessionId) {
        throw new Error("SessionId is required");
      }
      const response = await API.post(`/api/video/generate-token/${sessionId}`);
      if (!response) {
        throw new Error("No response received from generateToken");
      }
      return response;
    } catch (error) {
      console.error("Failed to generate token:", error);
      throw error;
    }
  },
};

export const CatchMindAPI = {
  createRoom: async (roomData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("로그인이 필요합니다");
      }

      // 기본 config에 추가된 헤더 설정
      const config = {
        baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
        // baseURL: `${import.meta.env.VITE_LOCAL_API_BASE_URL}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      };

      // axios 인스턴스 대신 직접 axios 사용
      const response = await axios.post(
        `${config.baseURL}/api/catch-mind/create-room`,
        roomData,
        config
      );

      return response.data;
    } catch (error) {
      console.error("Create room error:", {
        config: error.config,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error;
    }
  },

  getRoomList: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("로그인이 필요합니다");
      }

      // 토큰 유효성 추가 검증 로직
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      };

      const listResponse = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/catch-mind`,
        // `${import.meta.env.VITE_LOCAL_API_BASE_URL}/api/catch-mind`,
        config
      );

      return listResponse.data;
    } catch (error) {
      console.error("Room list error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // 토큰 만료 시 로그아웃 처리 등
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        // 로그인 페이지로 리다이렉트 등의 처리
      }

      throw error;
    }
  },

  getRoomInfo: async (roomId) => {
    try {
      const response = await API.get(`/api/catch-mind/rooms/${roomId}`);
      return response; // 여기서 response를 그대로 반환
    } catch (error) {
      console.error(`Failed to fetch room info for room ${roomId}:`, error);
      // 에러 발생 시 기본 객체 반환
      return {
        roomId,
        roomTitle: "알 수 없는 방",
        isPrivate: false,
        players: [],
        maxPeople: 4,
        isGameStart: false,
        creator: "알 수 없음",
      };
    }
  },

  // 방 비밀번호 확인
  checkRoomPassword: async (roomId, password) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("로그인이 필요합니다");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };

      const response = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/catch-mind/rooms/${roomId}/check-password`,
        { password },
        // `${
        //   import.meta.env.VITE_LOCAL_API_BASE_URL
        // }/api/catch-mind/rooms/${roomId}/check-password`,
        // { password },
        config
      );

      return response;
    } catch (error) {
      console.error(`Failed to check room password for room ${roomId}:`, error);
      throw error;
    }
  },
};

export default API;
