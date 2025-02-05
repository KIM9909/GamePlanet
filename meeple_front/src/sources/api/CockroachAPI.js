import axios from "axios";

export const VideoAPI = {
  createSession: async () => {
    const response = await axios.post(
      "http://localhost:8090/api/video/create-session"
    );
    return response.data;
  },
  generateToken: async (sessionId) => {
    const response = await axios.post(
      `http://localhost:8090/api/video/generate-token/${sessionId}`
    );
    return response.data;
  },
};
