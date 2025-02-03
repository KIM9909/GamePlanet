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
  createSession: async (options = {}) => {
    try {
      const response = await API.post("api/video/create-session", options);
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
      const response = await API.post(`api/video/generate-token/${sessionId}`);
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

      // axios 요청 및 응답 로깅
      try {
        const response = await axios.post(
          `${config.baseURL}/catch-mind/create-room`,
          roomData,
          config
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      console.error("Create room error:", {
        requestData: roomData,
        errorMessage: error.message,
        serverResponse: error.response?.data,
      });
      throw error;
    }
  },

  getRoomList: async () => {
    try {
      const response = await API.get("/catch-mind");

      // response 자체가 방 목록 전체 정보를 포함하고 있을 것이므로 바로 반환
      return response;
    } catch (error) {
      console.error("방 목록 조회 실패:", error);
      throw error;
    }
  },

  getRoomInfo: async (roomId) => {
    try {
      const roomList = await API.get("/catch-mind");
      const roomInfo = roomList.find((room) => room.roomId === roomId);

      if (!roomInfo) {
        throw new Error(`Room with ID ${roomId} not found`);
      }

      return roomInfo;
    } catch (error) {
      console.error(`방 정보 조회 실패 (${roomId}):`, error);
      throw error;
    }
  },

  // 방 비밀번호 확인
  checkRoomPassword: async (roomId, password) => {
    try {
      // joinRoom API를 사용해 비밀번호 검증
      const joinRequest = {
        roomId: parseInt(roomId),
        password: password,
        playerName: localStorage.getItem("userNickname"), // 로그인한 사용자의 닉네임
      };

      const response = await API.post("/catch-mind/join-room", joinRequest);

      // response.code가 200이면 비밀번호 일치, 400이면 불일치
      return { isCorrect: response.code === 200 };
    } catch (error) {
      return { isCorrect: false };
    }
  },

  // 방 입장 API
  joinRoom: async (roomId, playerName, password = "") => {
    try {
      const joinRequest = {
        roomId: String(roomId),
        playerName: playerName,
        password: password || "",
      };

      const response = await API.post("/catch-mind/join-room", joinRequest);

      // 기존 로직 유지
      if (response?.code === 200) {
        const roomInfo = response.roomInfo || {};
        return {
          success: true,
          roomInfo: {
            ...roomInfo,
            roomId: String(roomInfo.roomId),
          },
        };
      } else {
        console.error("방 입장 실패:", response);
        return {
          success: false,
          message: response?.message || "방 입장에 실패했습니다.",
        };
      }
    } catch (error) {
      console.error("방 입장 요청 실패:", error);
      return {
        success: false,
        message: "서버 오류가 발생했습니다.",
      };
    }
  },
};

export default API;
