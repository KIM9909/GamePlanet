import axios from "axios";

const GAMEINFO_API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/game-info`; // 배포 API 주소
// const GAMEINFO_API_BASE_URL = `${import.meta.env.VITE_LOCAL_API_BASE_URL}/game-info`; // 로컬 API 주소

const config = {"Content-Type": 'application/json'};

export const GameInfoAPI = {
  //게임 목록 조회

  getGameInfoList: async () => {
    try {
      const response = await axios.get(`${GAMEINFO_API_BASE_URL}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //게임정보 생성

  createGameInfo: async (gameInfoData) => {
    try {
      const response = await axios.post(
        `${GAMEINFO_API_BASE_URL}`,
        gameInfoData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //게임정보 조회

  getGameInfo: async (gameInfoId) => {
    try {
      const response = await axios.get(
        `${GAMEINFO_API_BASE_URL}/${gameInfoId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //게임정보 수정

  updateGameInfo: async (gameInfoId, gameInfoData) => {
    try {
      const response = await axios.put(
        `${GAMEINFO_API_BASE_URL}/${gameInfoId}`,
        gameInfoData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //게임정보 삭제

  deleteGameInfo: async (gameInfoId) => {
    try {
      const response = await axios.delete(
        `${GAMEINFO_API_BASE_URL}/${gameInfoId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 리뷰 목록과 평균 별점 조회
  // `${GAMEINFO_API_BASE_URL}/review`
  getReviews: async (gameInfoId) => {
    try {
      const response = await axios.get(`${GAMEINFO_API_BASE_URL}/review`,
        {params :{
          gameInfoId:gameInfoId
        }
      })
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 리뷰 작성
  // `${GAMEINFO_API_BASE_URL}/review`
  createReview: async (reviewData) => {
    try {
      const response = await axios.post(
        `${GAMEINFO_API_BASE_URL}/review`,
        reviewData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 리뷰 수정
  // `${GAMEINFO_API_BASE_URL}/${gameInfoId}`
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await axios.put(
        `${GAMEINFO_API_BASE_URL}/review/${reviewId}`,
        reviewData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 리뷰 삭제
  // `${GAMEINFO_API_BASE_URL}/${gameInfoId}`
  deleteReview: async (gameInfoId, reviewId) => {
    try {
      const response = await axios.delete(`${GAMEINFO_API_BASE_URL}/review/${reviewId}`,
        {params :{
          gameInfoId:gameInfoId
        }}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //글목록 조회

  getCommunityPosts: async (gameInfoId) => {
    try {
      const response = await axios.get(
        `${GAMEINFO_API_BASE_URL}/community?gameInfoId=${gameInfoId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //단일 글 조회

  getCommunityPost: async (gameInfoId,gameCommunityId) => {
    try {
      const response = await axios.get(
        `${GAMEINFO_API_BASE_URL}/${gameInfoId}/${gameCommunityId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },



  //글 작성

  createCommunityPost: async (postData) => {
    try {
      const response = await axios.post(
        `${GAMEINFO_API_BASE_URL}/community`,
        postData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //글 수정

  updateCommunityPost: async (gameCommunityId, postData) => {
    try {
      const response = await axios.put(
        `${GAMEINFO_API_BASE_URL}/community/${gameCommunityId}`,
        {gameCommunityContent:postData.gameCommunityContent}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //글 삭제

  deleteCommunityPost: async (gameCommunityId) => {
    try {
      const response = await axios.delete(
        `${GAMEINFO_API_BASE_URL}/community/${gameCommunityId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 댓글 작성

  createComment: async (commentData) => {
    try {
      const response = await axios.post(
        `${GAMEINFO_API_BASE_URL}/comment`,
        commentData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //댓글 수정

  updateComment: async (commentId, commentData) => {
    try {
      const response = await axios.put(
        `${GAMEINFO_API_BASE_URL}/comment/${commentId}`,
        {content: commentData.content}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //댓글 삭제

  deleteComment: async (gameCommunityCommentId) => {
    try {
      const response = await axios.delete(
        `${GAMEINFO_API_BASE_URL}/comment/${gameCommunityCommentId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default GameInfoAPI;