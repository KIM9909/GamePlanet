import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8090",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// 요청 인터셉터 수정
API.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 수정
API.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error.response?.data || new Error(error.message);
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

export default API;
