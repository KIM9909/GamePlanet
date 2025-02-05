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

  // 상태 관리
  const [messages, setMessages] = useState([]); // 채팅 메시지 목록
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // 연결 상태
  const reconnectTimeoutRef = useRef(null); // 재연결 타이머 참조
  const currentUserNickname = useSelector(
    (state) => state.profile.profileData?.userNickname
  );

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
        // `${import.meta.env.VITE_SOCKET_API_BASE_URL}`,
        `${import.meta.env.VITE_SOCKET_LOCAL_API_BASE_URL}`,
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

        /**
         * 채팅 메시지 구독 설정
         * /topic/catch-mind-messages/{roomId} 채널을 구독하여 채팅 메시지를 수신
         * 정답을 맞출 경우 점수 업데이트 및 턴 변경 처리
         */
        // useCatchSocket.js 수정부분

        // client.subscribe(`/topic/catch-mind-messages/${roomId}`, (message) => {
        //   try {
        //     const chatMessage = JSON.parse(message.body);
        //     console.log("수신된 채팅 메시지:", chatMessage);

        //     if (chatMessage.roomId === roomId) {
        //       setMessages((prev) => [
        //         ...prev,
        //         {
        //           sender: chatMessage.sender,
        //           content: chatMessage.content,
        //           timestamp: chatMessage.timestamp,
        //           isCorrect: chatMessage.correct,
        //           isNotice: chatMessage.notice,
        //           score: chatMessage.score,
        //         },
        //       ]);

        //       // 정답을 맞췄을 때의 처리
        //       if (chatMessage.correct) {
        //         // 점수 업데이트
        //         dispatch(
        //           updatePlayerScore({
        //             nickname: chatMessage.sender,
        //             score: chatMessage.score,
        //           })
        //         );

        //         // 현재 퀴즈 데이터가 있는지 확인
        //         if (window.quizData) {
        //           const nextIndex = window.quizData.currentIndex + 1;

        //           // 다음 퀴즈가 있는 경우
        //           if (nextIndex < window.quizData.quizList.length) {
        //             const nextQuiz = window.quizData.quizList[nextIndex];
        //             console.log("다음 퀴즈 설정 시도:", nextQuiz);
        //             console.log("현재 게임 상태:", currentGameState);
        //             // 게임 상태 업데이트 - 라운드 증가는 여기서만 처리
        //             dispatch(
        //               updateGameState({
        //                 currentWord: nextQuiz.quiz,
        //                 currentRound: currentGameState.currentRound + 1, // 라운드 증가
        //                 quizCategory: nextQuiz.quizCategory,
        //                 remainQuizCount:
        //                   window.quizData.quizList.length - nextIndex - 1,
        //               })
        //             );

        //             // 현재 인덱스 업데이트
        //             window.quizData.currentIndex = nextIndex;

        //             console.log("제시어 변경 완료. 새 제시어:", nextQuiz.quiz);
        //           } else {
        //             // 모든 퀴즈가 끝난 경우
        //             console.log("게임 종료!");
        //             dispatch(setGameStarted(false));
        //           }
        //         }
        //       }
        //     }
        //   } catch (error) {
        //     console.error("채팅 메시지 처리 중 오류:", error);
        //   }
        // });

        /**
         * 게임 상태 구독 설정
         * /topic/catch-mind/{roomId} 채널을 구독하여 게임 상태 변경을 수신
         * 플레이어 정보, 턴 변경, 게임 진행 상태 등을 처리
         */
        client.subscribe(`/topic/catch-mind/${roomId}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log("전체 게임 상태 데이터:", data);

            // gameInfo 타입 처리 추가
            if (data.type === "gameInfo" && data.gameInfo) {
              console.log("게임 정보 업데이트:", data.gameInfo);

              // 먼저 게임 시작 상태 설정
              dispatch(setGameStarted(true));

              // 현재 플레이어 목록 가져오기
              const currentPlayers = store.getState().catchmind.players;

              // 플레이어들의 현재 턴 상태 업데이트
              const updatedPlayers = currentPlayers.map((player) => ({
                ...player,
                isTurn: player.nickname === data.gameInfo.currentTurn,
                // 기존 점수와 다른 정보는 유지
              }));

              // 상태 업데이트
              dispatch(
                updateGameState({
                  currentWord: data.gameInfo.quiz,
                  remainQuizCount: data.gameInfo.remainQuizCount,
                })
              );

              // 플레이어 정보 업데이트
              dispatch(
                updatePlayers({
                  players: updatedPlayers,
                })
              );

              console.log("게임 정보 업데이트 완료:", {
                currentTurn: data.gameInfo.currentTurn,
                quiz: data.gameInfo.quiz,
                players: updatedPlayers,
              });

              return;
            }

            // 메시지 타입 처리
            if (data.type === "message") {
              console.log("채팅 메시지 수신:", data.message);

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
                // 점수 업데이트
                dispatch(
                  updatePlayerScore({
                    nickname: data.message.sender,
                    score: data.message.score,
                  })
                );

                // 현재 퀴즈 데이터가 있는지 확인
                if (data.message.quiz) {
                  console.log("새로운 퀴즈 설정:", data.message.quiz);
                  dispatch(
                    updateGameState({
                      currentWord: data.message.quiz,
                      currentRound: currentGameState.currentRound + 1,
                      remainQuizCount: data.message.remainQuizCount,
                      currentTurn: data.message.nextTurn, // 이 부분 추가
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
                console.log("Room is empty, cleaning up...");

                if (clientRef.current) {
                  try {
                    clientRef.current.deactivate();
                    clientRef.current = null;
                  } catch (error) {
                    console.error("Error during cleanup:", error);
                  }
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
              // roomInfo의 모든 데이터를 유지하면서 Redux store 업데이트
              store.dispatch(
                updateGameState({
                  currentWord: data.roomInfo.gameInfo?.currentWord,
                  currentRound: data.roomInfo.gameInfo?.currentRound,
                  quizCategory: data.roomInfo.gameInfo?.quizCategory,
                  remainQuizCount: data.roomInfo.gameInfo?.quizList?.length,
                  creator: data.roomInfo.creator, // creator 정보 추가
                  roomTitle: data.roomInfo.roomTitle,
                  maxPeople: data.roomInfo.maxPeople,
                  timeLimit: data.roomInfo.timeLimit,
                  quizCount: data.roomInfo.quizCount,
                  isPrivate: data.roomInfo.isPrivate,
                  password: data.roomInfo.password,
                  roomId: data.roomInfo.roomId,
                })
              );

              // players 업데이트
              store.dispatch(
                updatePlayers({
                  players: data.roomInfo.players.map((player, index) => ({
                    id: index + 1,
                    nickname: player,
                    score: data.roomInfo.gameInfo?.playerScore?.[player] || 0,
                    isTurn: player === data.roomInfo.gameInfo?.currentTurn,
                    isCurrentUser: player === currentUserNickname,
                  })),
                })
              );
            }

            // drawing 관련 메시지는 무시
            if (data.type === "clear" || data.type === "draw") {
              return;
            }

            if (data.gameInfo && data.gameInfo.currentWord) {
              console.log("새로운 제시어 수신:", data.gameInfo.currentWord);
              dispatch(setCurrentWord(data.gameInfo.currentWord));
            }

            // 게임 시작 응답 처리
            if (data.quizList && data.sequence) {
              console.log("게임 시작! 라운드 초기화");
              dispatch(resetGameState());
              dispatch(setGameStarted(true));

              // 첫 번째 퀴즈로 게임 상태 초기화
              const firstQuiz = data.quizList[0];
              dispatch(
                updateGameState({
                  currentWord: firstQuiz.quiz,
                  currentRound: 1,
                  quizCategory: firstQuiz.quizCategory,
                  remainQuizCount: data.quizList.length - 1,
                })
              );

              // 턴 순서 데이터 저장
              window.quizData = {
                quizList: data.quizList,
                sequence: data.sequence,
                currentIndex: 0,
              };

              // 순서대로 첫 번째 플레이어에게 턴 부여
              if (data.sequence.length > 0) {
                const firstPlayer = data.sequence[0];
                const updatedPlayers = currentGameState.players.map(
                  (player) => ({
                    ...player,
                    isTurn: player.nickname === firstPlayer,
                  })
                );
                dispatch(updatePlayers({ players: updatedPlayers }));
              }

              return;
            }

            if (data.players && data.gameInfo) {
              const newTurn = data.gameInfo.currentTurn;
              const previousTurn = currentGameState.players.find(
                (p) => p.isTurn
              )?.nickname;

              // 턴 변경 시에는 게임 상태 업데이트를 하지 않음
              if (previousTurn !== newTurn && previousTurn !== null) {
                console.log("턴 변경 감지:", previousTurn, "->", newTurn);

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
                console.log("Room is empty, cleaning up...");

                if (clientRef.current) {
                  try {
                    fetch(
                      // `${
                      //   import.meta.env.VITE_API_BASE_URL
                      // }/catch-mind/delete-room?roomId=${roomId}`,
                      `${
                        import.meta.env.VITE_LOCAL_API_BASE_URL
                      }/catch-mind/delete-room?roomId=${roomId}`,
                      { method: "DELETE" }
                    )
                      .then(() => console.log("Room deletion request sent"))
                      .catch((error) =>
                        console.error("Error deleting room:", error)
                      );

                    clientRef.current.deactivate();
                    clientRef.current = null;
                  } catch (error) {
                    console.error("Error during cleanup:", error);
                  }
                }

                setConnectionStatus("disconnected");
                setMessages([]);
                dispatch(updatePlayers({ players: [] }));

                setTimeout(() => {
                  window.location.href = "/catch-mind";
                }, 500);
              }
            }
          } catch (error) {
            console.error("게임 상태 파싱 에러:", error);
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

  // 방 입장 함수 추가
  const joinRoom = useCallback(
    (joinData) => {
      if (!clientRef.current?.connected) {
        connect();
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
        console.error("Error joining room:", error);
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
  };
};

export default useCatchSocket;
