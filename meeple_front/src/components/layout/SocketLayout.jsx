import React, { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { body } from "framer-motion/client";

export const SocketContext = React.createContext();

const SocketLayout = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  // 대기방 정보
  const [roomSocketData, setRoomSocketData] = useState({});
  const [roomNotifi, setRoomNotifi] = useState("");
  // 채팅
  const [chatMessage, setChatMessage] = useState({});

  // 게임 정보
  const [gamePlaySocketData, setGamePlaySocketData] = useState({});

  // 지금 플레이어는 누군지
  const [currentPlayerSocketIndex, setCurrentPlayerSocketIndex] =
    useState(null);

  // 주사위 던지는지 안 던지는 지
  const [socketRoll, setSocektRoll] = useState(null);

  // 주사위 굴린 후 정보
  const [rollDiceSocketData, setRollDiceSocketData] = useState({});

  //  다음 행동
  const [socketNext, setSocketNext] = useState(null);

  // 첫 번째 주사위 결과
  const [socketFirstDice, setSocketFirstDice] = useState(null);

  // 두 번째 주사위 결과
  const [socketSecondDice, setSocketSecondDice] = useState(null);

  // 주사위가 더블인지 아닌지
  const [socketDouble, setSocketDouble] = useState(null);

  // 몇 번째 라운드인지
  const [socketCurrentRound, setSocketCurrentRound] = useState(null);

  // 보드 정보
  const [socketBoard, setSocketBoard] = useState(null);

  // 카드 정보
  const [socketCards, setSocketCards] = useState(null);

  // 게임 공지 메시지
  const [gameSocketNotifi, setGameSocketNotifi] = useState({});

  // 땅 구매 후 정보
  const [buyLandSocketData, setBuyLandSocketData] = useState({});

  // 유저 업데이트 정보
  const [socketUserUpdate, setSocketUserUpdate] = useState(null);

  // 타일 업데이트 정보
  const [socketTileUpdate, setSocketTileUpdate] = useState(null);

  // 기지 건설 후 정보
  const [buildBaseSocketData, setBuildBaseSocketData] = useState(null);

  // 틀린 비밀번호 입력 시
  const [socketStatus, setSocketStatus] = useState(null);

  // 승자
  const [socketWinner, setSocketWinner] = useState(null);
  // 파산자
  const [socketRemovedPlayer, setSocketRemovedPlayer] = useState(null);

  const location = useLocation();

  const stompClientRef = useRef(null);

  const roomId = useSelector((state) => state.burumabul.roomId);
  const userId = useSelector((state) => state.user.userId);
  const rawToken = localStorage.getItem("token");
  const token = rawToken ? rawToken.trim() : "";

  useEffect(() => {
    if (!roomId) {
      console.warn("방 ID가 없습니다.");
      return;
    }

    console.log("🌐 STOMP Client 생성 중...");
    const stompClient = new Client({
      webSocketFactory: () => {
        console.log("🌍 SockJS WebSocket 팩토리 실행됨!");
        return new SockJS(`${import.meta.env.VITE_SOCKET_LOCAL_API_BASE_URL}`);
        // return new SockJS(`${import.meta.env.VITE_SOCKET_API_BASE_URL}`);
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
              setChatMessage(receivedData);
            } else if (receivedData.type === "room") {
              setRoomSocketData(receivedData.roomResponse);
              setRoomNotifi(receivedData.message);
            } else if (receivedData.type === "create") {
              setGamePlaySocketData(receivedData.data);
              setGameSocketNotifi(receivedData.message);
              setSocketNext(receivedData.data.nextAction);
              setCurrentPlayerSocketIndex(receivedData.data.currentPlayerIndex);
              setSocketCurrentRound(receivedData.data.round);
              setSocketBoard(receivedData.data.board);
              setSocketCards(receivedData.data.cards);
            } else if (receivedData.type === "start-turn") {
              setGamePlaySocketData(receivedData.data);
              setGameSocketNotifi(receivedData.message);
              setSocketNext(receivedData.data.nextAction);
              setCurrentPlayerSocketIndex(receivedData.data.currentPlayerIndex);
            } else if (receivedData.type === "buy-land") {
              setBuyLandSocketData(receivedData.buyLandResponse);
              setSocketUserUpdate(receivedData.buyLandResponse.updatedPlayer);
              setSocketTileUpdate(receivedData.buyLandResponse.updatedTile);
              setSocketNext(receivedData.buyLandResponse.nextAction);
              setGameSocketNotifi(receivedData.message);
            } else if (receivedData.type === "roll-dice") {
              setRollDiceSocketData(receivedData.diceRollResponse);
              setSocketFirstDice(receivedData.diceRollResponse.firstDice);
              setSocketSecondDice(receivedData.diceRollResponse.secondDice);
              setSocketDouble(receivedData.diceRollResponse.double);
              setSocketNext(receivedData.diceRollResponse.nextAction);
              setGameSocketNotifi(receivedData.message);
            } else if (receivedData.type === "just-roll-dice") {
              setSocektRoll(receivedData.data);
              setGameSocketNotifi(receivedData.message);
            } else if (receivedData.type === "build-base") {
              setBuildBaseSocketData(receivedData.data);
              setGameSocketNotifi(receivedData.message);
              setSocketNext(receivedData.data.nextAction);
            } else if (receivedData.type === "turn-end") {
              setCurrentPlayerSocketIndex(receivedData.data.currentPlayerIndex);
              setSocketNext(receivedData.data.nextAction);
              setSocketCurrentRound(receivedData.data.round);
              setGameSocketNotifi(receivedData.message);
              setSocketWinner(receivedData.data.winner);
              setSocketRemovedPlayer(receivedData.data.removedPlayer);
            }
            if (receivedData.status) {
              setSocketStatus(receivedData.status);
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
        destination: `/app/game/blue-marble/rooms/${roomId}/user/${userId}/join`,
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
          body: JSON.stringify(message), // 이미 JSON.stringify된 메시지
          headers: {
            "content-type": "application/json;charset=UTF-8",
          },
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
          destination: `/app/game/blue-marble/rooms/${roomId}/update`,
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
        destination: `/app/game/blue-marble/rooms/${roomId}/user/${userId}/delete`,
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
          destination: `/app/game/blue-marble/game-plays/create`,
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

  // 주사위 던졌다는 알림
  const roll = useCallback((rollInfo) => {
    if (!stompClientRef.current?.connected) {
      console.warn("웹소켓에 연결되어 있지 않습니다.");
      return;
    }
    try {
      console.log("주사위를 굴렸다는 알림");
      stompClientRef.current.publish({
        destination: `app/game/blue-marble/game-plays/${roomId}/just-roll-dice`,
        body: JSON.stringify(rollInfo),
      });
      console.log("주사위를 굴렸다는 알림");
    } catch (error) {
      console.error("주사위 굴렸다는 알림 실패: ", error);
      setError("주사위 굴리기 알림에 실패함");
    }
  });

  // 부루마불 주사위 굴리기
  const rollDice = useCallback(
    (diceResult) => {
      if (!stompClientRef.current?.connected) {
        console.warn("웹소켓에 연결되어있지 않습니다.");
        return;
      }
      try {
        console.log("주사위 굴리기");
        stompClientRef.current.publish({
          destination: `/app/game/blue-marble/game-plays/${roomId}/roll-dice`,
          body: JSON.stringify(diceResult),
        });
        console.log("주사위 굴리기에 성공했습니다.");
      } catch (error) {
        console.error("주사위 굴리기에 실패했습니다. ", error);
        setError("주사위 굴리기에 실패했습니다.");
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
        console.log("땅 구매 정보", buyInfo);
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

  // 기지 생성
  const buildBase = useCallback(
    (buildInfo) => {
      if (!stompClientRef.current?.connected) {
        console.warn("웹소켓에 연결되어있지 않습니다.");
        return;
      }
      try {
        console.log("기지 건설 정보", buildInfo);
        stompClientRef.current.publish({
          destination: `/app/game/blue-marble/game-plays/${roomId}/build-base`,
          body: JSON.stringify(buildInfo),
        });
        console.log("기지 건설에 성공했습니다.");
      } catch (error) {
        console.error("기지 건설에 실패했습니다.", error);
        setError("기지 건설에 실패했습니다.");
      }
    },
    [roomId, userId]
  );

  // 턴 시작
  const startTurn = useCallback(() => {
    if (!stompClientRef.current?.connected) {
      console.warn("웹소켓에 연결되어 있지 않습니다.");
      return;
    }
    try {
      console.log("턴을 시작합니다.");
      stompClientRef.current.publish({
        destination: `/app/game/blue-marble/game-plays/${roomId}/start-turn`,
      });
      console.log("턴 시작에 성공했습니다.");
    } catch (error) {
      console.error("턴 시작에 실패했습니다. :", error);
      setError("턴 시작에 실패했습니다.");
    }
  }, [roomId, userId]);

  // 통행료 지불
  const payToll = useCallback(
    (payInfo) => {
      if (!stompClientRef.current?.connected) {
        console.warn("웹소켓에 연결되어 있지 않습니다.");
        return;
      }
      try {
        console.log("통행료를 지불합니다.");
        stompClientRef.current.publish({
          destination: `/app/game/blue-marble/game-plays/${roomId}/pay-fee`,
          body: JSON.stringify(payInfo),
        });
        console.log("통행료 지불에 성공했습니다.");
      } catch (error) {
        console.error("통행료 지불에 실패했습니다.", error);
        setError("통행료 지불에 실패했습니다.");
      }
    },
    [roomId, userId]
  );

  // 종료 조건 확인
  const checkEnd = useCallback(
    (endInfo) => {
      if (!stompClientRef.current?.connected) {
        console.warn("웹소켓에 연결되어 있지 않습니다.");
        return;
      }
      try {
        console.log("종료조건을 확인합니다.");
        stompClientRef.current.publish({
          destination: `/app/game/blue-marble/game-plays/${roomId}/check-end`,
          body: JSON.stringify(endInfo),
        });
        console.log("종료조건 확인에 성공했습니다");
      } catch (error) {
        console.error("종료조건 확인에 실패했습니다.", error);
      }
    },
    [roomId, userId]
  );

  //

  if (!userId || !token) {
    return children;
  }
  if (
    userId &&
    (location.pathname === "/burumabul/room-list" ||
      location.pathname.match(/^\/game\/burumabul(\/[\w-]+)+$/))
  ) {
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
          currentPlayerSocketIndex,
          rollDiceSocketData,
          buyLandSocketData,
          setBuyLandSocketData,
          roll,
          socketRoll,
          socketFirstDice,
          socketSecondDice,
          socketDouble,
          socketCurrentRound,
          socketBoard,
          socketCards,
          socketNext,
          socketUserUpdate,
          socketTileUpdate,
          buildBaseSocketData,
          setBuildBaseSocketData,
          socketStatus,
          setSocketStatus,
          enterWaitingRoom,
          chatWaitingRoom,
          changePassword,
          enterSecretWaitingRoom,
          leaveGame,
          buyLand,
          rollDice,
          createBurumabulPlay,
          updateWaitingRoom,
          buildBase,
          startTurn,
          payToll,
          checkEnd,
        }}
      >
        {children}
      </SocketContext.Provider>
    );
  }
  return children;
};

export default SocketLayout;
