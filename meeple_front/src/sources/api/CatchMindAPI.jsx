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
      const response = await API.post("api/video/create-session");
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

      // 요청 데이터 로깅
      console.log("Request Data:", JSON.stringify(roomData, null, 2));

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
        console.log("Response:", response.data);
        return response.data;
      } catch (error) {
        console.log("Server Error Response:", error.response?.data);
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
      const roomIds = response || [];

      // 방 정보를 병렬로 조회
      const roomDetails = await Promise.all(
        roomIds.map(async (roomId) => {
          try {
            const roomInfo = await API.get(`/catch-mind/rooms/${roomId}`);
            return roomInfo;
          } catch (error) {
            console.error(`방 정보 조회 실패 (${roomId}):`, error);
            // 기본 정보 반환
            return {
              roomId,
              roomTitle: "접근 불가능한 방",
              isPrivate: false,
              players: [],
              maxPeople: 4,
              isGameStart: false,
              creator: "알 수 없음",
              timeLimit: 90,
              quizCount: 5,
            };
          }
        })
      );

      return roomDetails;
    } catch (error) {
      console.error("방 목록 조회 실패:", error);
      throw error;
    }
  },

  getRoomInfo: async (roomId) => {
    try {
      const response = await API.get(`/catch-mind/rooms/${roomId}`);
      return response;
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
      return { isCorrect: true };
    }
  },
};

export default API;
