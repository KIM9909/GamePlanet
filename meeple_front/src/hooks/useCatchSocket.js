import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import {
  updatePlayers,
  updatePlayerScore,
  updateGameState,
  setCurrentWord,
  setGameStarted,
  resetGameState,
  incrementRound,
  // currentRound,
} from "../sources/store/slices/CatchMindSlice";
import store from "../sources/store/Store";

/**
 * WebSocket을 통한 실시간 채팅 기능을 제공하는 Custom Hook
 * STOMP 프로토콜을 사용하여 서버와 통신
 *
 * @param {string} roomId - 게임방 ID
 * @returns {Object} WebSocket 관련 상태와 메서드들
 */
const useCatchSocket = (roomId) => {
  const dispatch = useDispatch();
  // Redux store에서 현재 게임 상태 가져오기
  const currentGameState = useSelector((state) => state.catchmind);
  // STOMP 클라이언트 참조
  const clientRef = useRef(null);

  // subscriptions 관리를 위한 ref 추가
  const subscriptionRef = useRef(null);
  const connectingRef = useRef(false); // 연결 중인지 확인하는 ref 추가

  // 상태 관리
  const [messages, setMessages] = useState([]); // 채팅 메시지 목록
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // 연결 상태
  const reconnectTimeoutRef = useRef(null); // 재연결 타이머 참조
  const currentUserNickname = useSelector(
    (state) => state.profile.profileData?.userNickname
  );
  const [countdown, setCountdown] = useState(null);
  const [gameResults, setGameResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleCloseResults = useCallback(() => {
    setShowResults(false);
    setGameResults(null);
  }, []);

  const countdownSoundRef = useRef(null);
  useEffect(() => {
    countdownSoundRef.current = new Audio(
      "https://meeple-file-server-2.s3.ap-northeast-2.amazonaws.com/static-files/gameCountDown.mp3"
    );
    countdownSoundRef.current.volume = 0.3;
    return () => {
      if (countdownSoundRef.current) {
        countdownSoundRef.current.pause();
        countdownSoundRef.current = null;
      }
    };
  }, []);

  const playCountdownSound = useCallback(() => {
    if (countdownSoundRef.current) {
      countdownSoundRef.current.currentTime = 0;
      countdownSoundRef.current.play().catch((error) => {
        console.error("Error playing countdown sound:", error);
      });
    }
  }, []);

  const correctSoundRef = useRef(null);
  useEffect(() => {
    correctSoundRef.current = new Audio(
      "https://meeple-file-server-2.s3.ap-northeast-2.amazonaws.com/static-files/coin.mp3"
    );
    correctSoundRef.current.volume = 0.3;
    return () => {
      if (correctSoundRef.current) {
        correctSoundRef.current.pause();
        correctSoundRef.current = null;
      }
    };
  }, []);

  const playCorrectSound = useCallback(() => {
    if (correctSoundRef.current) {
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch((error) => {
        console.error("Error playing sound:", error);
      });
    }
  }, []);
  /**
   * WebSocket 연결을 설정하는 함수
   */
  const connect = useCallback(() => {
    try {
      if (clientRef.current?.connected) {
        return; // 이미 연결되어 있다면 종료
      }

      // 이미 연결된 경우 중복 연결 방지
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
          clientRef.current = null;
        } catch (error) {}
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
      });

      /**
       * 연결 성공 시 핸들러
       */
      client.configure({
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          setConnectionStatus("connected");

          if (!roomId) {
            return;
          }
          /**
           * 게임 상태 구독 설정
           * /topic/catch-mind/{roomId} 채널을 구독하여 게임 상태 변경을 수신
           * 플레이어 정보, 턴 변경, 게임 진행 상태 등을 처리
           */
          const subscription = (subscriptionRef.current = client.subscribe(
            `/topic/catch-mind/${roomId}`,
            (message) => {
              try {
                const data = JSON.parse(message.body);

                if (data.type === "countdown") {
                  setCountdown(data.count);
                  if (data.count === 3) {
                    // 카운트다운 시작할 때만 사운드 재생
                    playCountdownSound();
                  }
                  if (data.count === 0) {
                    // START! 메시지를 0.5초 후에 제거
                    setTimeout(() => {
                      setCountdown(null);
                    }, 500);
                  }
                  return;
                }

                if (
                  data.type === "message" &&
                  data.message.content === "🎮 게임이 곧 시작됩니다!"
                ) {
                  // 카운트다운 사운드 재생
                  playCountdownSound();
                }

                if (data.type === "updateRoom" && data.roomInfo) {
                  // 방 정보 업데이트
                  dispatch(
                    updateGameState({
                      roomTitle: data.roomInfo.roomTitle,
                      isPrivate: data.roomInfo.isPrivate,
                      password: data.roomInfo.password,
                      maxPeople: data.roomInfo.maxPeople,
                      timeLimit: data.roomInfo.timeLimit,
                      quizCount: data.roomInfo.quizCount,
                    })
                  );
                }

                // 타임아웃 처리
                if (data.type === "timeOut" && data.gameData) {
                  // 메시지 추가
                  setMessages((prev) => [
                    ...prev,
                    {
                      sender: "SYSTEM",
                      content: "시간이 초과되었습니다! 다음 턴으로 넘어갑니다.",
                      timestamp: new Date(),
                      isNotice: true,
                    },
                  ]);

                  // 다음 퀴즈 정보로 업데이트
                  dispatch(
                    updateGameState({
                      currentWord: data.gameData.quiz,
                      remainQuizCount: data.gameData.remainQuizCount,
                      // currentTurn: data.message.nextTurn,
                    })
                  );

                  // 현재 플레이어 목록 가져오기
                  const currentPlayers = store.getState().catchmind.players;

                  // 플레이어들의 현재 턴 상태 업데이트
                  const updatedPlayers = currentPlayers.map((player) => ({
                    ...player,
                    isTurn: player.nickname === data.gameData.nextTurn,
                  }));

                  // 플레이어 정보 업데이트
                  dispatch(
                    updatePlayers({
                      players: updatedPlayers,
                    })
                  );

                  return;
                }

                //useCatchSocket.js 의 result 핸들러 부분

                if (data.type === "result" && Array.isArray(data.result)) {
                  // 게임 상태를 종료 상태로 변경
                  dispatch(setGameStarted(false));

                  // 게임 결과 저장 및 모달 표시
                  setGameResults(data.result);
                  setShowResults(true);

                  // 게임 종료 메시지 추가
                  setMessages((prev) => [
                    ...prev,
                    {
                      sender: "SYSTEM",
                      content: "🎮 게임이 종료되었습니다! 🏆",
                      timestamp: new Date(),
                      isNotice: true,
                    },
                  ]);

                  // 게임 종료 후 처리
                  const cleanupGame = async () => {
                    try {
                      // 1. 캔버스 초기화 메시지 전송
                      if (clientRef.current?.connected) {
                        clientRef.current.publish({
                          destination: `/app/drawing/${roomId}`,
                          body: JSON.stringify({
                            type: "clear",
                            roomId: parseInt(roomId),
                          }),
                          headers: { "content-type": "application/json" },
                        });
                      }

                      // 2. 게임 상태 초기화
                      dispatch(resetGameState());
                      dispatch(
                        updateGameState({
                          currentWord: null,
                          remainQuizCount: 0,
                          currentRound: 1,
                          quizCategory: null,
                          isGameStart: false,
                        })
                      );

                      // 3. 플레이어 점수 초기화
                      const resetPlayers = currentGameState.players.map(
                        (player) => ({
                          ...player,
                          score: 0,
                          isTurn: false,
                          rank: null,
                        })
                      );
                      dispatch(updatePlayers({ players: resetPlayers }));

                      // 4. 추가 메시지 표시
                      setMessages((prev) => [
                        ...prev,
                        {
                          sender: "SYSTEM",
                          content: "🎨 새 게임을 시작할 수 있습니다!",
                          timestamp: new Date(),
                          isNotice: true,
                        },
                      ]);
                    } catch (error) {
                      setMessages((prev) => [
                        ...prev,
                        {
                          sender: "SYSTEM",
                          content: "⚠️ 게임 초기화 중 오류가 발생했습니다.",
                          timestamp: new Date(),
                          isNotice: true,
                        },
                      ]);
                    }
                  };

                  // 잠시 대기 후 정리 작업 시작
                  setTimeout(cleanupGame, 2000);

                  return;
                }

                // gameInfo 타입 처리 추가
                if (data.type === "gameInfo" && data.gameInfo) {
                  // 게임 시작 상태 설정
                  dispatch(setGameStarted(true));

                  // 현재 Redux store의 players 상태 확인
                  const currentPlayers = store.getState().catchmind.players;

                  let updatedPlayers = currentPlayers;

                  // players 배열이 비어있다면 roomInfo에서 플레이어 목록을 다시 가져옴
                  if (currentPlayers.length === 0 && data.roomInfo?.players) {
                    updatedPlayers = data.roomInfo.players.map(
                      (playerName, index) => ({
                        id: index + 1,
                        nickname: playerName,
                        score: 0,
                        isTurn: playerName === data.gameInfo.currentTurn,
                        isCurrentUser: playerName === currentUserNickname,
                      })
                    );
                  } else {
                    // 기존 플레이어 정보를 유지하면서 턴만 업데이트
                    updatedPlayers = currentPlayers.map((player) => ({
                      ...player,
                      isTurn: player.nickname === data.gameInfo.currentTurn,
                    }));
                  }

                  // 플레이어 정보 업데이트
                  dispatch(updatePlayers({ players: updatedPlayers }));

                  // 게임 상태 업데이트
                  dispatch(
                    updateGameState({
                      currentWord: data.gameInfo.quiz,
                      remainQuizCount: data.gameInfo.remainQuizCount,
                      currentTurn: data.gameInfo.currentTurn,
                      isGameStart: true,
                    })
                  );

                  // 출제자 지정 메시지 추가
                  setMessages((prev) => [
                    ...prev,
                    {
                      sender: "SYSTEM",
                      content: `👉 ${data.gameInfo.currentTurn}님이 출제자로 지정되었습니다!`,
                      timestamp: new Date(),
                      isNotice: true,
                    },
                  ]);

                  return;
                }

                // 메시지 타입 처리
                if (data.type === "message") {
                  if (data.message.clearChat) {
                    // clearChat 플래그가 있으면 채팅 초기화
                    setMessages([
                      {
                        sender: "SYSTEM",
                        content:
                          "🔄 게임이 초기화되었습니다. 새 게임을 시작할 수 있습니다!",
                        timestamp: new Date(),
                        isNotice: true,
                      },
                    ]);
                    return;
                  }

                  setMessages((prev) => [
                    ...prev,
                    {
                      sender: data.message.sender,
                      content: data.message.content,
                      timestamp: data.message.timestamp,
                      isCorrect: data.message.correct, // 서버에서 오는 correct 사용
                      isNotice: data.message.notice, // 서버에서 오는 notice 사용
                      score: data.message.score,
                      remainQuizCount: data.message.remainQuizCount,
                    },
                  ]);

                  // 정답을 맞췄을 때의 처리
                  if (data.message.correct) {
                    playCorrectSound();

                    // 점수 업데이트
                    dispatch(
                      updatePlayerScore({
                        nickname: data.message.sender,
                        score: data.message.score,
                      })
                    );

                    // 현재 퀴즈 데이터가 있는지 확인
                    if (data.message.quiz) {
                      dispatch(
                        updateGameState({
                          currentWord: data.message.quiz,
                          remainQuizCount: data.message.remainQuizCount,
                          currentTurn: data.message.nextTurn,
                        })
                      );
                    }
                  }
                }

                // players 타입 처리 추가
                if (data.type === "players") {
                  // 플레이어 정보만 업데이트
                  dispatch(
                    updatePlayers({
                      players: data.players.map((playerName, index) => ({
                        id: index + 1,
                        nickname: playerName,
                        score: 0, // 기본 점수 설정
                        isTurn: false, // 기본적으로 턴은 false로 설정
                        isCurrentUser: playerName === currentUserNickname,
                      })),
                    })
                  );

                  // 방이 비어있을 때 처리
                  if (data.players.length === 0) {
                    if (clientRef.current) {
                      try {
                        clientRef.current.deactivate();
                        clientRef.current = null;
                      } catch (error) {}
                    }

                    setConnectionStatus("disconnected");
                    setMessages([]);
                    dispatch(updatePlayers({ players: [] }));

                    setTimeout(() => {
                      window.location.href = "/catch-mind";
                    }, 500);
                  }
                  return; // players 타입 처리 후 리턴
                }

                if (data.type === "roomInfo" && data.roomInfo) {
                  // 게임이 시작되지 않은 상태라면 점수를 0으로 초기화
                  if (!data.roomInfo.isGameStart) {
                    if (
                      data.roomInfo.players &&
                      Array.isArray(data.roomInfo.players)
                    ) {
                      const updatedPlayers = data.roomInfo.players.map(
                        (playerName, index) => ({
                          id: index + 1,
                          nickname: playerName,
                          score: 0, // 게임 시작 전에는 항상 0으로 초기화
                          isTurn: false,
                          isCurrentUser: playerName === currentUserNickname,
                        })
                      );

                      dispatch(updatePlayers({ players: updatedPlayers }));
                    }
                  }

                  // 게임 상태 업데이트
                  dispatch(
                    updateGameState({
                      currentWord: null,
                      currentRound: 1,
                      remainQuizCount: 0,
                      creator: data.roomInfo.creator,
                      roomTitle: data.roomInfo.roomTitle,
                      maxPeople: data.roomInfo.maxPeople,
                      timeLimit: data.roomInfo.timeLimit,
                      quizCount: data.roomInfo.quizCount,
                      isPrivate: data.roomInfo.isPrivate,
                      password: data.roomInfo.password,
                      roomId: data.roomInfo.roomId,
                      sessionId: data.roomInfo.sessionId,
                      isGameStart: false, // 방 정보를 새로 받을 때는 게임 시작 상태를 false로
                    })
                  );

                  return;
                }

                // drawing 관련 메시지는 무시
                if (data.type === "clear" || data.type === "draw") {
                  return;
                }

                if (data.gameInfo && data.gameInfo.currentWord) {
                  dispatch(setCurrentWord(data.gameInfo.currentWord));
                }

                // 게임 시작 응답 처리
                if (data.quizList && data.sequence) {
                  dispatch(resetGameState());
                  dispatch(setGameStarted(true));

                  // 첫 번째 퀴즈로 게임 상태 초기화
                  const firstQuiz = data.quizList[0];
                  const firstPlayer = data.sequence[0];

                  // 초기 게임 상태 설정
                  dispatch(
                    updateGameState({
                      currentWord: firstQuiz.quiz,
                      currentRound: 1,
                      quizCategory: firstQuiz.quizCategory,
                      remainQuizCount: data.quizList.length - 1,
                      currentTurn: firstPlayer, // 첫 번째 플레이어를 현재 턴으로 설정
                    })
                  );

                  // 플레이어 턴 업데이트
                  const updatedPlayers = currentGameState.players.map(
                    (player) => ({
                      ...player,
                      isTurn: player.nickname === firstPlayer,
                      score: 0, // 점수 초기화
                    })
                  );

                  dispatch(updatePlayers({ players: updatedPlayers }));

                  // 턴 지정 메시지 추가
                  setMessages((prev) => [
                    ...prev,
                    {
                      sender: "SYSTEM",
                      content: `👉 ${firstPlayer}님이 첫 출제자로 지정되었습니다!`,
                      timestamp: new Date(),
                      isNotice: true,
                    },
                  ]);

                  return;
                }

                if (data.players && data.gameInfo) {
                  const newTurn = data.gameInfo.currentTurn;
                  const previousTurn = currentGameState.players.find(
                    (p) => p.isTurn
                  )?.nickname;

                  // 턴 변경 시에는 게임 상태 업데이트를 하지 않음
                  if (previousTurn !== newTurn && previousTurn !== null) {
                    // 플레이어 정보만 업데이트
                    const updatedPlayers = data.players.map((playerName) => ({
                      ...currentGameState.players.find(
                        (p) => p.nickname === playerName
                      ),
                      isTurn: playerName === newTurn,
                    }));

                    dispatch(updatePlayers({ players: updatedPlayers }));
                  }

                  // 방이 비어있을 때 처리
                  if (data.players.length === 0) {
                    if (clientRef.current) {
                      try {
                        fetch(
                          `${
                            import.meta.env.VITE_API_BASE_URL
                          }/catch-mind/delete-room?roomId=${roomId}`,
                          // `${
                          //   import.meta.env.VITE_LOCAL_API_BASE_URL
                          // }/catch-mind/delete-room?roomId=${roomId}`,
                          { method: "DELETE" }
                        );

                        clientRef.current.deactivate();
                        clientRef.current = null;
                      } catch (error) {}
                    }

                    setConnectionStatus("disconnected");
                    setMessages([]);
                    dispatch(updatePlayers({ players: [] }));

                    setTimeout(() => {
                      window.location.href = "/catch-mind";
                    }, 500);
                  }
                }
              } catch (error) {}
            }
          ));
          client.onDisconnect = () => {
            try {
              subscription.unsubscribe();
            } catch (error) {}
            setConnectionStatus("disconnected");
          };
        },
      });

      // 에러 핸들러들 설정
      client.onStompError = (frame) => {
        setConnectionStatus("error");
        handleReconnect();
      };

      client.onWebSocketError = (event) => {
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
      setConnectionStatus("error");
      handleReconnect();
    }
  }, [roomId, dispatch, playCorrectSound]);

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

    // 구독 해제
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      } catch (error) {}
    }

    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnectionStatus("disconnected");
        setMessages([]);
      } catch (error) {}
    }
  }, []);

  /**
   * 메시지 전송 함수
   * @param {Object} messageData - 전송할 메시지 데이터
   */
  const sendMessage = useCallback(
    (messageData) => {
      if (!roomId) {
        return;
      }

      if (!clientRef.current?.connected) {
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
        handleReconnect();
      }
    },
    [roomId, connect, handleReconnect]
  );

  // roomId가 있을 때 WebSocket 연결 설정
  useEffect(() => {
    if (roomId) {
      connect();

      return () => {
        if (subscriptionRef.current) {
          try {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
          } catch (error) {}
        }

        if (clientRef.current) {
          try {
            clientRef.current.deactivate();
            clientRef.current = null;
          } catch (error) {}
        }
        setConnectionStatus("disconnected");
      };
    }
  }, [roomId, connect]);

  // 방 입장 함수 추가
  const joinRoom = useCallback(
    (joinData) => {
      if (!clientRef.current?.connected) {
        connect();
        // 연결 후 입장 시도
        setTimeout(() => {
          if (clientRef.current?.connected) {
            clientRef.current.publish({
              destination: "/app/join-room",
              body: JSON.stringify(joinData),
              headers: { "content-type": "application/json" },
            });
          }
        }, 1000);
        return;
      }

      try {
        clientRef.current.publish({
          destination: "/app/join-room",
          body: JSON.stringify(joinData),
          headers: { "content-type": "application/json" },
        });
      } catch (error) {
        handleReconnect();
      }
    },
    [connect, handleReconnect]
  );

  // 필요한 상태와 메서드들 반환
  return {
    connected: connectionStatus === "connected",
    connectionStatus,
    sendMessage,
    messages,
    joinRoom,
    client: clientRef.current,
    countdown,
    gameResults,
    showResults,
    handleCloseResults,
  };
};

export default useCatchSocket;
