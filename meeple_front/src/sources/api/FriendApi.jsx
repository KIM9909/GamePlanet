import axios from "axios";
import { useSelector } from "react-redux";

// const FRIEND_API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`; // 배포 API 주소
const FRIEND_API_BASE_URL = `${import.meta.env.VITE_LOCAL_API_BASE_URL}/friend`; // 로컬 API 주소

// 친구 목록 가져오기
export const fetchFriendList = async (userId) => {
  console.log(userId);
  if (userId) {
    try {
      const response = await axios.get(
        `${FRIEND_API_BASE_URL}?userId=${userId}`
      );
      console.log("✅ [프론트] API 응답:", response.data);
      return response.data;
    } catch (error) {
      console.error("FriendList fetch error : ", error);
      throw error;
    }
  }
};

export const deleteFriend = async (friendId) => {
  try {
    const response = await axios.delete(`${FRIEND_API_BASE_URL}/${friendId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || "친구 삭제 실패";
  }
};
