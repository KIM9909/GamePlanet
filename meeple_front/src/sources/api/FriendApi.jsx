import { retry } from "@reduxjs/toolkit/query";
import axios from "axios";
import { useSelector } from "react-redux";

// const FRIEND_API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/friend`; // 배포 API 주소
const FRIEND_API_BASE_URL = `${import.meta.env.VITE_LOCAL_API_BASE_URL}/friend`; // 로컬 API 주소

// 친구 목록 조회
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

// 친구목록 삭제
export const deleteFriend = async (friendId) => {
  try {
    const response = await axios.delete(
      `${FRIEND_API_BASE_URL}/delete-friend?friendId=${friendId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "친구 삭제 실패";
  }
};

// 닉네임으로 친구 검색
export const searchFriend = async (userNickname) => {
  try {
    const response = await axios.get(
      `${FRIEND_API_BASE_URL}/search?userNickname=${userNickname}`
    );

    return response.data;
  } catch (error) {
    console.error("닉네임으로 친구 검색 중 오류가 났습니다. : ", error);
  }
};

// // 친구 요청 목록
export const requestFriendList = async (userId) => {
  try {
    const response = await axios.get(
      `${FRIEND_API_BASE_URL}/request-list?=${userId}`
    );

    return response.data;
  } catch (error) {
    console.error("친구 요청 목록 조회 중 오류 : ", error);
  }
};

// 차단 목록
export const blokingFriendList = async (userId) => {
  try {
    const response = await axios.get(
      `${FRIEND_API_BASE_URL}/blocking-list?=${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("차단 목록 조회 중 오류 : ", error);
  }
};
