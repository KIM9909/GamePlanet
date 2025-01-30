import axios from "axios";

const API_BASE_URL = "http://boardjjigae/duckdns.org/api/firend"; // 배포 API 주소

// 친구 목록 가져오기
export const fetchFriendList = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error("FriendList fetch error : ", error);
    throw error;
  }
};

// 친구 요청 보내기 (WebSocket)
export const requestFriend = async (userId, requestData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/request-friend/${userId}`,
      requestData,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("requestFriend Error:".error);
    throw error.respons?.data || "친구 요청에 실패했습니다.";
  }
};

// 친구 요청 승인 / 거절 (WebSocket)
export const processRequest = async (friendId, requestData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/process-request/${friendId}`,
      requestData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "요청 승인 / 거절 실패";
  }
};

export const deleteFriend = async (friendId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${friendId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "친구 삭제 실패";
  }
};
