import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useDispatch } from "react-redux";
import {
  updatePlayers,
  updatePlayerScore,
} from "../sources/store/slices/CatchMindSlice";

/**
 * WebSocket을 통한 실시간 채팅 기능을 제공하는 Custom Hook
 * STOMP 프로토콜을 사용하여 서버와 통신
 *
 * @param {string} roomId - 게임방 ID
 * @returns {Object} WebSocket 관련 상태와 메서드들
 */
const useCatchSocket = (roomId) => {
  const dispatch = useDispatch();
  // STOMP 클라이언트 참조
  const clientRef = useRef(null);

  // 상태 관리
  const [messages, setMessages] = useState([]); // 채팅 메시지 목록
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // 연결 상태
  const reconnectTimeoutRef = useRef(null); // 재연결 타이머 참조

  /**
   * WebSocket 연결을 설정하는 함수
   */
  const connect = useCallback(() => {
    try {
      // 이미 연결된 경우 중복 연결 방지
      if (clientRef.current?.connected) {
        return;
      }

      // SockJS를 사용하여 WebSocket 연결 생성
      const socket = new SockJS(
        `${import.meta.env.VITE_SOCKET_API_BASE_URL}`,
        // `${import.meta.env.VITE_SOCKET_LOCAL_API_BASE_URL}`,
        null,
        {
          transports: ["websocket", "xhr-streaming", "xhr-polling"],
        }
      );

      // STOMP 클라이언트 생성
      const client = new Client({
        webSocketFactory: () => socket,
        debug: function (str) {
          console.log("STOMP: " + str);
        },
      });

      // STOMP 클라이언트 설정
      client.configure({
        reconnectDelay: 5000, // 재연결 시도 간격 (ms)
        heartbeatIncoming: 4000, // 수신 하트비트 간격
        heartbeatOutgoing: 4000, // 송신 하트비트 간격
      });

      /**
       * 연결 성공 시 핸들러
       */
      client.onConnect = () => {
        setConnectionStatus("connected");

        // roomId가 유효한지 확인
        if (!roomId) {
          console.error("Invalid roomId for subscription:", roomId);
          return;
        }

        // 채팅 메시지 구독 - roomId별로 구독
        client.subscribe(`/topic/catch-mind-messages/${roomId}`, (message) => {
          try {
            const chatMessage = JSON.parse(message.body);
            console.log("수신된 채팅 메시지:", chatMessage);

            // 현재 방의 메시지만 추가
            if (chatMessage.roomId === roomId) {
              setMessages((prev) => [
                ...prev,
                {
                  sender: chatMessage.sender,
                  content: chatMessage.content,
                  timestamp: chatMessage.timestamp,
                  isCorrect: chatMessage.isCorrect,
                  isNotice: chatMessage.isNotice,
                  score: chatMessage.score,
                },
              ]);

              // 정답인 경우 플레이어 점수 업데이트
              if (chatMessage.isCorrect) {
                console.log("Dispatching score update:", {
                  nickname: chatMessage.sender,
                  score: chatMessage.score,
                });
                dispatch(
                  updatePlayerScore({
                    nickname: chatMessage.sender,
                    score: chatMessage.score,
                  })
                );
              }
            }
          } catch (error) {
            console.error("Error parsing chat message:", error);
          }
        });

        // 게임 상태 구독
        client.subscribe(`/topic/catch-mind/${roomId}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log("Received game state update:", data);

            // gameInfo와 players가 있는지 확인
            if (data.players && data.gameInfo) {
              console.log("Current game info:", data.gameInfo);
              console.log("Current turn:", data.gameInfo.currentTurn);

              // 현재 턴 플레이어가 있는 경우에만 업데이트 진행
              if (
                data.gameInfo.currentTurn &&
                data.players.includes(data.gameInfo.currentTurn)
              ) {
                // 기존 플레이어 정보와 새로운 턴 정보를 결합하여 업데이트
                const updatedPlayers = data.players.map((playerName) => {
                  const playerScore =
                    data.gameInfo.playerScore?.[playerName] || 0;
                  const isCurrentTurn =
                    data.gameInfo.currentTurn === playerName;
                  console.log(
                    `Player ${playerName} turn status:`,
                    isCurrentTurn
                  );

                  return {
                    id: Math.random().toString(36).substr(2, 9),
                    nickname: playerName,
                    score: playerScore,
                    isTurn: isCurrentTurn,
                    isCurrentUser: false,
                  };
                });

                console.log("Updating players with new state:", updatedPlayers);
                dispatch(updatePlayers({ players: updatedPlayers }));
              } else {
                console.log("Skipping update: Invalid turn state", {
                  currentTurn: data.gameInfo.currentTurn,
                  players: data.players,
                });
              }

              // players 배열이 비어있는지 확인
              if (data.players.length === 0) {
                console.log("Room is empty, cleaning up...");

                // 연결 해제
                if (clientRef.current) {
                  try {
                    // 방 삭제 API 호출
                    fetch(
                      `${
                        import.meta.env.VITE_API_BASE_URL
                      }/catch-mind/delete-room?roomId=${roomId}`,
                      // `${
                      //   import.meta.env.VITE_LOCAL_API_BASE_URL
                      // }/catch-mind/delete-room?roomId=${roomId}`,
                      {
                        method: "DELETE",
                      }
                    )
                      .then(() => {
                        console.log("Room deletion request sent");
                      })
                      .catch((error) => {
                        console.error("Error deleting room:", error);
                      });

                    clientRef.current.deactivate();
                    clientRef.current = null;
                  } catch (error) {
                    console.error("Error during cleanup:", error);
                  }
                }

                // 상태 초기화
                setConnectionStatus("disconnected");
                setMessages([]);
                dispatch(updatePlayers({ players: [] }));

                // 로비로 리다이렉트
                setTimeout(() => {
                  window.location.href = "/catch-mind";
                }, 500);
              }
            }
          } catch (error) {
            console.error("Error parsing game state:", error);
          }
        });
      };

      // 에러 핸들러들 설정
      client.onStompError = (frame) => {
        console.error("STOMP error:", frame);
        setConnectionStatus("error");
        handleReconnect();
      };

      client.onWebSocketError = (event) => {
        console.error("WebSocket error:", event);
        setConnectionStatus("error");
        handleReconnect();
      };

      client.onDisconnect = () => {
        setConnectionStatus("disconnected");
        handleReconnect();
      };

      // 클라이언트 저장 및 활성화
      clientRef.current = client;
      client.activate();
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setConnectionStatus("error");
      handleReconnect();
    }
  }, [roomId, dispatch]);

  /**
   * 연결 재시도 핸들러
   */
  const handleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 5000);
  }, [connect]);

  /**
   * WebSocket 연결 해제 함수
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnectionStatus("disconnected");
        setMessages([]);
      } catch (error) {
        console.error("Error disconnecting:", error);
      }
    }
  }, []);

  /**
   * 메시지 전송 함수
   * @param {Object} messageData - 전송할 메시지 데이터
   */
  const sendMessage = useCallback(
    (messageData) => {
      if (!roomId) {
        console.error("Invalid roomId for message sending:", roomId);
        return;
      }

      if (!clientRef.current?.connected) {
        console.warn("Cannot send message: WebSocket not connected");
        connect();
        return;
      }

      try {
        clientRef.current.publish({
          destination: `/app/chat/${roomId}`,
          body: JSON.stringify(messageData),
          headers: { "content-type": "application/json" },
        });
      } catch (error) {
        console.error("Error sending message:", error);
        handleReconnect();
      }
    },
    [roomId, connect, handleReconnect]
  );

  // roomId가 있을 때 WebSocket 연결 설정
  useEffect(() => {
    if (roomId) {
      connect();
      return () => disconnect();
    }
  }, [roomId, connect, disconnect]);

  // 필요한 상태와 메서드들 반환
  return {
    connected: connectionStatus === "connected",
    connectionStatus,
    sendMessage,
    messages,
    client: clientRef.current,
  };
};

export default useCatchSocket;
