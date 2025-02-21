import axios from "axios";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

/**
 * Axios 인스턴스 생성 및 기본 설정
 */
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/game`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * WebSocket 클라이언트 설정
 */
let stompClient = null;

export const connectWebSocket = (onConnect) => {
  try {
    const socket = new SockJS(`${import.meta.env.VITE_SOCKET_API_BASE_URL}`);
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, () => {
      if (onConnect) onConnect(stompClient);
    }, (error) => {
      return error
    });

    return stompClient;
  } catch (error) {
    return null;
  }
};

/**
 * WebSocket 클라이언트 가져오기
 */
export const getStompClient = () => stompClient;

/**
 * 요청 인터셉터 설정
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터 설정
 */
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error.response?.data || error);
  }
);

export const CockroachAPI = {

  
  // REST API Endpoints
  /**
   * 게임 방 생성
   * @param {Object} request - 방 생성 요청 데이터
   * @returns {Promise<Object>} 생성된 방 정보
   */
  createRoom: async (request) => {
    try {
      const response = await API.post("/create-room", request);
      return response;
    } catch (error) {
      throw error || "방 생성에 실패했습니다.";
    }
  },

  /**
   * 게임 방 정보 조회
   * @param {string} roomId - 방 ID
   * @returns {Promise<Object>} 방 정보
   */
  getRoom: async (roomId) => {
    try {
      const response = await API.get(`/room/${roomId}`);
      return response;
    } catch (error) {
      throw error || "방 정보 조회에 실패했습니다.";
    }
  },

  /**
   * 게임 방 삭제
   * @param {string} roomId - 삭제할 방 ID
   * @returns {Promise<string>} 삭제 결과 메시지
   */
  deleteRoom: async (roomId) => {
    try {
      const response = await API.delete("/delete-room", { params: { roomId } });
      return response;
    } catch (error) {
      throw error || "방 삭제에 실패했습니다.";
    }
  },

  /**
   * 전체 게임 방 목록 조회
   * @returns {Promise<Array>} 게임 방 목록
   */
  getAllRooms: async () => {
    try {
      const response = await API.get("/rooms");
      return response;
    } catch (error) {
      throw error || "방 목록 조회에 실패했습니다.";
    }
  },

  // WebSocket Methods

  
  /**
   * 게임 방 구독
   * @param {string} roomId - 구독할 방 ID
   * @param {Function} callback - 메시지 수신 시 실행할 콜백 함수
   */
  subscribeToRoom: (roomId, callback) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.subscribe(`/topic/game/${roomId}`, (message) => {
      const response = JSON.parse(message.body);
      callback(response);
    });
  },

  /**
   * 게임 방 참가
   * @param {Object} request - 참가 요청 데이터 (roomId, playerName, password)
   */
  joinRoom: (request) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.send("/app/game/join-room", {}, JSON.stringify(request));
  },

  /**
   * 게임 채팅 메시지 전송
   * @param {string} roomId - 방 ID
   * @param {Object} request - 메시지 데이터
   */
  sendChatMessage: (roomId, request) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.send(`/app/game/chat/${roomId}`, {}, JSON.stringify(request));
  },

  /**
   * 게임 시작
   * @param {string} roomId - 방 ID
   */
  startGame: (roomId) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.send(`/app/game/start-game/${roomId}`, {}, {});
  },

  /**
   * 카드 전달
   * @param {string} roomId - 방 ID
   * @param {Object} request - 카드 전달 요청 데이터
   */
  giveCard: (roomId, request) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.send(`/app/game/give-card/${roomId}`, {}, JSON.stringify(request));
  },

  /**
   * 싱글 카드 확인
   * @param {string} roomId - 방 ID
   * @param {Object} request - 카드 확인 요청 데이터
   */
  checkSingleCard: (roomId, request) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.send(`/app/game/single-card/${roomId}`, {}, JSON.stringify(request));
  },

  /**
   * 멀티 카드 확인
   * @param {string} roomId - 방 ID
   * @param {Object} request - 카드 확인 요청 데이터
   */
  checkMultiCard: (roomId, request) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.send(`/app/game/multi-card/${roomId}`, {}, JSON.stringify(request));
  },

  /**
   * 게임 방 나가기
   * @param {string} roomId - 방 ID
   * @param {string} userNickname - 사용자 닉네임
   */
  exitRoom: (roomId, userNickname) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.send(`/app/game/exit-room/${roomId}`, {}, userNickname);
  },

  /**
   * 투표 요청
   * @param {string} roomId - 방 ID
   * @param {Object} request - 투표 요청 데이터
   */
  sendVote: (roomId, request) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.send(`/app/game/send-vote/${roomId}`, {}, JSON.stringify(request));
  },

  /**
   * 투표 진행
   * @param {string} roomId - 방 ID
   * @param {Object} request - 투표 데이터
   */
  vote: (roomId, request) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.send(`/app/game/vote/${roomId}`, {}, JSON.stringify(request));
  },

  /**
   * 투표 결과 전송
   * @param {string} roomId - 방 ID
   * @param {Object} request - 투표 결과 데이터
   */
  sendVoteResult: (roomId, request) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.send(`/app/game/vote-result/${roomId}`, {}, JSON.stringify(request));
  },

  /**
   * 손 패 체크
   * @param {string} roomId - 방 ID
   * @param {Object} request - 손 패 체크 요청 데이터
   */
  checkHand: (roomId, request) => {
    if (!stompClient) {
      throw new Error("WebSocket이 연결되지 않았습니다.");
    }
    stompClient.send(`/app/game/hand-check/${roomId}`, {}, JSON.stringify(request));
  },

  /**
   * WebSocket 연결 확인
   */
  isConnected: () => {
    return stompClient?.connected || false;
  },
    /**
   * WebSocket 연결
   */
    connect: (onConnect) => {
      return connectWebSocket(onConnect);
    },


  /**
   * WebSocket 연결 종료
   */
  disconnect: () => {
    if (stompClient) {
      stompClient.disconnect();
      stompClient = null;
    }
  }
};

export default CockroachAPI;