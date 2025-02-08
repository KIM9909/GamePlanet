import React, { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { RiPassPendingFill } from "react-icons/ri";
import { body } from "framer-motion/client";

export const SocketContext = React.createContext();

const SocketLayout = ({ children }) => {
  const location = useLocation();

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  // 대기방 정보
  const [roomSocketData, setRoomSocketData] = useState({});
  const [roomNotifi, setRoomNotifi] = useState("");
  // 채팅
  const [chatMessage, setChatMessages] = useState({});

  // 게임 정보
  const [gamePlaySocketData, setGamePlaySocketData] = useState({});

  // 게임 공지 메시지
  const [gameSocketNotifi, setGameSocketNotifi] = useState({});

  // 주사위 굴린 후 정보
  const [rollDiceSocketData, setRollDiceSocketData] = useState({});

  // 땅 구매 후 정보
  const [buyLandSocketData, setBuyLandSocketData] = useState({});

  const stompClientRef = useRef(null);

  const roomId = useSelector((state) => state.burumabul.roomId);
  const userId = useSelector((state) => state.user.userId);
  if (!userId) throw new Error("사용자 ID 가 없습니다.");
  const token = localStorage.getItem("token").trim() || "";
  if (!token) throw new Error("인증 토큰이 없습니다.");

  useEffect(() => {
    if (!roomId) {
      console.warn("방 ID가 없습니다.");
      return;
    }

    console.log("🌐 STOMP Client 생성 중...");
    const stompClient = new Client({
      webSocketFactory: () => {
        console.log("🌍 SockJS WebSocket 팩토리 실행됨!");
        // return new SockJS(`${import.meta.env.VITE_SOCKET_LOCAL_API_BASE_URL}`);
        return new SockJS(`${import.meta.env.VITE_SOCKET_API_BASE_URL}`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log("🛠 STOMP Debug:", str); // 강제 디버깅 출력
      },
    });

    stompClient.onConnect = (frame) => {
      console.log("부루마불 대기방 웹소켓 연결", frame);
      setConnected(true);

      if (roomId) {
        try {
          console.log("구독 시도:", `/topic/rooms/${roomId}`);
          console.log("부루마불 구독 시작");
          stompClient.subscribe(`/topic/rooms/${roomId}`, (message) => {
            console.log(
              "부루마불 소켓 서버로부터 받은 메시지 : ",
              message.body
            );
            const receivedData = JSON.parse(message.body);
            console.log("부루마불 서버로부터 받은 응답 : ", receivedData);
            if (receivedData.type === "chat") {
              setChatMessages(receivedData);
            } else if (receivedData.type === "room") {
              setRoomSocketData(receivedData.roomResponse);
              setRoomNotifi(receivedData.message);
            } else if (receivedData.type === "create") {
              setGamePlaySocketData(receivedData.gamePlay);
              setGameSocketNotifi(receivedData.message);
            } else if (receivedData.type === "game-play") {
              if (receivedData.buyLandResponse) {
                setBuyLandSocketData(receivedData.buyLandResponse);
                setGameSocketNotifi(receivedData.message);
              } else if (receivedData.rollDiceResponse) {
                setRollDiceSocketData(receivedData.rollDiceResponse);
                setGameSocketNotifi(receivedData.message);
              }
            }
            console.log("구독 성공:");
          });
        } catch (error) {
          console.error("부루마불 대기방 구독 중 오류 발생", error);
        }
      }
    };

    stompClient.onDisconnect = () => {
      console.warn("❌ WebSocket 연결이 끊어졌습니다!");
    };
    stompClient.onWebSocketError = (error) => {
      console.error("WebSocket Error:", error);
    };

    stompClient.onUnhandledMessage = (message) => {
      console.log("Unhandled Message:", message);
    };

    stompClient.onStompError = (frame) => {
      console.error("WebSocket Error", frame.headers["message"]);
      setError(`WebSocket 연결 중 오류 발생: ${frame.headers["message"]}`);
      setConnected(false);
    };
    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.deactivate();
        setConnected(false);
      }
    };
  }, [roomId]);

  // 대기방 입장
  const enterWaitingRoom = useCallback(() => {
    if (!stompClientRef.current?.connected) {
      console.warn("웹소켓이 연결되어 있지 않습니다.");
      return;
    }

    try {
      stompClientRef.current.publish({
        destination: `/app/${roomId}/user/${userId}/join`,
      });
      console.log(userId);
      console.log("게임 대기방에 참가 요청");
    } catch (error) {
      console.error("게임 대기방에 참가하지 못했습니다.");
      setError("게임 대기방에 참가 중 오류가 발생했습니다. ");
    }
  }, [roomId, userId]);

  // 대기방 채팅
  const chatWaitingRoom = useCallback(
    (message) => {
      if (!stompClientRef.current?.connected) {
        console.warn("웹소켓이 연결되어 있지 않습니다.");
        return;
      }
      try {
        stompClientRef.current.publish({
          destination: `/app/game/blue-marble/rooms/${roomId}/sendMessage`,
          body: JSON.stringify({ type: "chat", content: message }),
        });
        console.log("게임 대기방에 채팅 메시지 전송");
      } catch (error) {
        console.error("게임 대기방에 채팅 메시지 전송 실패");
        setError("게임 대기방에 채팅 메시지 전송 중 오류 발생");
      }
    },
    [roomId]
  );

  // 비밀 대기방 참가
  const enterSecretWaitingRoom = useCallback(
    (password) => {
      if (!stompClientRef.current?.connected) {
        console.warn("웹소켓이 연결되어 있지 않습니다.");
        return;
      }
      try {
        stompClientRef.current.publish({
          destination: `/app/game/blue-marble/rooms/${roomId}/user/${userId}/private-room-join`,
          body: JSON.stringify({ password }),
        });
        console.log("비밀 대기방에 참가 요청");
      } catch (error) {
        console.error("비밀 대기방에 참가하지 못했습니다.");
        setError("비밀 대기방에 참가 중 오류가 발생했습니다. ");
      }
    },
    [roomId, userId]
  );

  // 대기방 업데이트
  const updateWaitingRoom = useCallback(
    (roomData) => {
      if (!stompClientRef.current?.connected) {
        console.warn("웹소켓이 연결되어 있지 않습니다.");
        return;
      }
      try {
        stompClientRef.current.publish({
          destination: `/app/game/blue-marble/${roomId}/update`,
          body: JSON.stringify(roomData),
        });
      } catch (error) {
        console.error("대기방 업데이트 중 오류가 발생했습니다.");
        setError("대기방 업데이트 중 오류가 발생했습니다. ");
      }
    },
    [roomId]
  );

  // 대기방 비밀번호 변경
  const changePassword = useCallback(
    (password) => {
      if (!stompClientRef.current?.connected) {
        console.warn("웹소켓이 연결되어 있지 않습니다.");
        return;
      }
      try {
        stompClientRef.current.publish({
          destination: `/app/game/blue-marble/rooms/${roomId}/changePassword`,
          body: JSON.stringify({ password }),
        });
      } catch (error) {
        console.error("대기방 비밀번호 변경 중 오류가 발생했습니다.");
        setError("대기방 비밀번호 변경 중 오류가 발생했습니다.");
      }
    },
    [roomId, userId]
  );

  // 대기방 나가기
  const leaveGame = useCallback(() => {
    if (!stompClientRef.current?.connected) {
      console.warn("웹소켓이 연결되어 있지 않습니다.");
      return;
    }
    try {
      stompClientRef.current.publish({
        destination: `/app/${roomId}/user/${userId}/delete`,
      });
      console.log("게임 대기방 / 게임 나가기");
    } catch (error) {
      console.error("게임 대기방 / 게임 나가기");
      setError("게임 대기방 / 게임 나가기 중 오류 발생");
    }
  }, [roomId, userId]);

  // 게임 플레이 생성
  const createBurumabulPlay = useCallback(
    (playInfo) => {
      if (!stompClientRef.current?.connected) {
        console.warn("웹소켓에 연결되어 있지 않습니다.");
        return;
      }
      try {
        const formattedPlayInfo = {
          gamePlayId: playInfo.gamePlayId,
          players: playInfo.players,
        };
        stompClientRef.current.publish({
          destination: `/app/create`,
          body: JSON.stringify(formattedPlayInfo),
        });
        console.log("게임 플레이 생성에 성공했습니다.");
      } catch (error) {
        console.error("게임 플레이 생성에 실패했습니다.");
        setError("게임 플레이 생성에 실패했습니다.");
      }
    },
    [roomId, userId]
  );

  // 부루마불 주사위 굴리기
  const rollDice = useCallback(
    (diceResult) => {
      if (!stompClientRef.current?.connected) {
        console.warn("웹소켓에 연결되어있지 않습니다.");
        return;
      }
      try {
        stompClientRef.current.publish({
          destination: `/app/${roomId}/roll-dice`,
          body: JSON.stringify(diceResult),
        });
        console.log("주사위 굴리기에 성공했습니다.");
      } catch (error) {
        console.error("주사위 굴리기에 실패했습니다. ", error);
        setError("주사위 굴리기에 성공했습니다.");
      }
    },
    [roomId, userId]
  );

  // 부루마불 땅 구매
  const buyLand = useCallback(
    (buyInfo) => {
      if (!stompClientRef.current?.connected) {
        console.warn("웹소켓에 연결되어있지 않습니다.");
        return;
      }
      try {
        stompClientRef.current.publish({
          destination: `/app/game/blue-marble/game-plays/${roomId}/buy-land`,
          body: JSON.stringify(buyInfo),
        });
        console.log("땅 구매에 성공했습니다.");
      } catch (error) {
        console.error("땅 구매에 실패했습니다.", error);
        setError("땅 구매에 실패했습니다. ");
      }
    },
    [roomId, userId]
  );

  if (location.pathname !== "/") {
    return (
      <SocketContext.Provider
        value={{
          connected,
          error,
          roomSocketData,
          roomNotifi,
          chatMessage,
          gamePlaySocketData,
          gameSocketNotifi,
          rollDiceSocketData,
          buyLandSocketData,
          enterWaitingRoom,
          chatWaitingRoom,
          changePassword,
          enterSecretWaitingRoom,
          leaveGame,
          buyLand,
          rollDice,
          createBurumabulPlay,
          updateWaitingRoom,
        }}
      >
        {children}
      </SocketContext.Provider>
    );
  }
};

export default SocketLayout;
