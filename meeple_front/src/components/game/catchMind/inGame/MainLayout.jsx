import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Timer,
  Users,
  Lock,
  LogOut,
  Flag,
  Settings,
  PlayCircle,
} from "lucide-react";
import Canvas from "./Canvas";
import ChatBox from "./ChatBox";
import PlayerCard from "./PlayerCard";
import CatchMindUpdateRoomModal from "./CatchMindUpdateRoomModal";
import {
  updatePlayers,
  resetGameState,
  updateGameState,
} from "../../../../sources/store/slices/CatchMindSlice";
import { fetchProfile } from "../../../../sources/store/slices/ProfileSlice";
import { CatchMindAPI } from "../../../../sources/api/CatchMindAPI";
import useCatchSocket from "../../../../hooks/useCatchSocket";
import VideoChat from "./VideoChat";
import ExitConfirmationModal from "./ExitConfirmationModal";
import GameReviewModal from "./GameReivewModal";
import Loading from "../../../Loading";
import useSound from "./useSound";
import CountdownModal from "./CountdownModal";
import GameResultModal from "./GameResultModal";

// 비디오 컨테이너 컴포넌트 - React.memo로 최적화
const VideoContainer = React.memo(
  ({ nickname, sessionId, isCurrentUser, players, currentPlayer }) => {
    return (
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg">
        <div className="p-4">
          <VideoChat
            nickname={nickname}
            sessionId={sessionId}
            isCurrentUser={isCurrentUser}
            players={players}
            currentPlayer={currentPlayer}
          />
        </div>
      </div>
    );
  }
);

// 채팅 컨테이너 컴포넌트 - React.memo로 최적화
const ChatContainer = React.memo(({ roomId, currentUser, correctAnswer }) => {
  return (
    <div className="flex-1 bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg">
      <div className="p-4 h-full">
        <ChatBox
          roomId={roomId}
          currentUser={currentUser}
          correctAnswer={correctAnswer}
        />
      </div>
    </div>
  );
});

// 게임 정보 컴포넌트 - React.memo로 최적화
const GameInfo = React.memo(
  ({
    round,
    word,
    roomInfo,
    handleExitRoom,
    handleStartGame,
    isCreator,
    client,
    isCurrentUserDrawer,
  }) => {
    const [timeLeft, setTimeLeft] = useState(roomInfo?.timeLimit || 90);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [readyPlayers, setReadyPlayers] = useState(new Set());
    const [isReady, setIsReady] = useState(false);

    const areAllPlayersReady = useMemo(() => {
      // 방장을 제외한 플레이어 수
      const nonCreatorPlayerCount =
        roomInfo?.players?.filter((player) => player !== roomInfo.creator)
          .length || 0;
      // 준비한 플레이어 수가 방장을 제외한 플레이어 수와 같은지 확인
      return readyPlayers.size === nonCreatorPlayerCount;
    }, [readyPlayers, roomInfo?.players, roomInfo?.creator]);

    useEffect(() => {
      let timer;
      if (roomInfo?.isGameStart) {
        timer = setInterval(() => {
          setTimeLeft((prevTime) => {
            if (prevTime <= 0) {
              if (client && isCurrentUserDrawer) {
                client.publish({
                  destination: `/app/time-out/${roomInfo.roomId}`,
                  body: "",
                  headers: { "content-type": "text/plain" },
                });
              }
              return roomInfo?.timeLimit || 90;
            }
            return prevTime - 1;
          });
        }, 1000);
      } else {
        setTimeLeft(roomInfo?.timeLimit || 90);
      }

      return () => {
        if (timer) {
          clearInterval(timer);
        }
      };
    }, [
      roomInfo?.isGameStart,
      roomInfo?.timeLimit,
      roomInfo?.roomId,
      client,
      isCurrentUserDrawer,
    ]);

    useEffect(() => {
      if (roomInfo?.isGameStart) {
        setTimeLeft(roomInfo?.timeLimit || 90);
      }
    }, [word, roomInfo?.timeLimit]);

    const getTimeColor = () => {
      if (timeLeft > 30) return "text-green-400";
      if (timeLeft > 10) return "text-yellow-400";
      return "text-red-400";
    };

    return (
      <div className="relative">
        {" "}
        {/* 컨테이너에 relative 추가 */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg shadow-xl border border-gray-700">
          <CatchMindUpdateRoomModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            roomInfo={roomInfo}
            client={client}
          />
          <div className="p-6">
            <div className="flex items-center justify-between">
              {/* Room Title Section */}
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {roomInfo?.roomTitle}
                </h2>
                {roomInfo?.isPrivate && (
                  <div className="group relative">
                    <Lock className="w-5 h-5 text-yellow-400" />
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-sm px-2 py-1 rounded -bottom-8 left-1/2 transform -translate-x-1/2">
                      Private Room
                    </div>
                  </div>
                )}
              </div>

              {/* Game Controls Section */}
              <div className="flex items-center space-x-4">
                {/* Round Badge */}
                <div className="flex items-center px-4 py-1.5 bg-gray-800/50 rounded-full">
                  <Flag className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-md font-medium text-white">
                    Round {round}/{roomInfo?.quizCount || 10}
                  </span>
                </div>

                {/* Timer Badge */}
                <div
                  className={`flex items-center px-4 py-1.5 bg-gray-800/50 rounded-full ${getTimeColor()}`}
                >
                  <Timer className="w-4 h-4 mr-2" />
                  <span className="text-md font-medium">{timeLeft}s</span>
                </div>
              </div>

              {/* Right Controls Section */}
              <div className="flex items-center space-x-4">
                {/* Players Count */}
                <div className="flex items-center px-3 py-1.5 bg-gray-800/50 rounded-full">
                  <Users className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-md text-gray-200">
                    {roomInfo?.players?.length || 0}/{roomInfo?.maxPeople}
                  </span>
                </div>

                {/* Creator Controls */}
                {!roomInfo?.isGameStart && (
                  <div className="flex space-x-2">
                    {isCreator ? (
                      <>
                        {roomInfo?.players?.length > 1 ? (
                          <button
                            onClick={handleStartGame}
                            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            <span>Start Game</span>
                          </button>
                        ) : (
                          <button
                            className="flex items-center px-4 py-2 bg-green-300 text-white rounded-lg cursor-not-allowed opacity-70 hover:bg-green-300"
                            disabled
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            <span>Start Game</span>
                          </button>
                        )}
                        <button
                          onClick={() => setIsUpdateModalOpen(true)}
                          className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors duration-200 border border-gray-600"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          <span>Settings</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Exit Button */}
                {!roomInfo?.isGameStart && (
                  <button
                    onClick={handleExitRoom}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Exit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Floating Word Display */}
        {word && (
          <div className="absolute left-1/2 -bottom-[120px] transform -translate-x-1/2 z-50">
            <div className="px-6 py-3 bg-blue-800/60 backdrop-blur-sm rounded-2xl border-2 border-blue-400/70 shadow-lg">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {word}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roomId } = useParams();
  const [roomInfo, setRoomInfo] = useState(null);
  const [isInitialJoin, setIsInitialJoin] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const gameState = useSelector((state) => state.catchmind);
  const profileData = useSelector((state) => state.profile.profileData);
  const userId = useSelector((state) => state.user.userId);
  const sessionId = useSelector((state) => state.catchmind.sessionId);

  const isCreator = gameState.creator === profileData?.userNickname;
  const {
    connected,
    connectionStatus,
    sendMessage,
    client,
    joinRoom,
    countdown,
    gameResults,
    showResults,
    handleCloseResults,
  } = useCatchSocket(roomId);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasPlayedGame, setHasPlayedGame] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (connectionStatus === "connected" && !isInitialJoin) {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [connectionStatus, isInitialJoin]);

  // 모달 닫기 핸들러
  const handleCloseExitModal = () => {
    setIsExitModalOpen(false);
  };

  // 나가기 확인 핸들러
  const handleConfirmExit = () => {
    handleExitRoom();
    setIsExitModalOpen(false);
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (gameState.isGameStart) {
        e.preventDefault();
        setIsExitModalOpen(true);
        e.returnValue = "";
      }
    };

    const handlePopState = (e) => {
      if (gameState.isGameStart) {
        e.preventDefault();
        setIsExitModalOpen(true);
        // 현재 URL을 history stack에 다시 추가
        window.history.pushState(null, "", window.location.pathname);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // 초기 history state 추가
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [gameState.isGameStart]);

  // 현재 턴인 플레이어 찾기
  const currentPlayer = useSelector((state) =>
    state.catchmind.players.find((p) => p.isTurn)
  );

  // 현재 유저가 출제자인지 확인
  const isCurrentUserDrawer = useMemo(() => {
    return currentPlayer?.nickname === profileData?.userNickname;
  }, [currentPlayer?.nickname, profileData?.userNickname]);

  const getCurrentUserNickname = useCallback(() => {
    return profileData?.userNickname || "Player 1";
  }, [profileData?.userNickname]);

  // 방 나가기 처리
  const handleExitRoom = useCallback(async () => {
    if (!roomId || !profileData?.userNickname || isExiting || !client) return;

    try {
      setIsExiting(true);

      // 게임을 플레이했다면 리뷰 모달 표시
      if (hasPlayedGame) {
        setIsReviewModalOpen(true);
        return; // 리뷰 모달에서 처리 후 나가기를 진행
      }

      dispatch(resetGameState());

      client.publish({
        destination: `/app/exit-room/${roomId}`,
        body: profileData.userNickname,
        headers: { "content-type": "text/plain" },
      });

      setTimeout(() => {
        setIsExiting(false);
        navigate("/catch-mind");
      }, 500);
    } catch (error) {
      setIsExiting(false);
    }
  }, [
    roomId,
    profileData?.userNickname,
    client,
    navigate,
    isExiting,
    dispatch,
    hasPlayedGame,
  ]);

  const handleReviewClose = useCallback(() => {
    setIsReviewModalOpen(false);

    // 리뷰 모달이 닫힌 후 방 나가기 처리
    dispatch(resetGameState());

    if (client) {
      client.publish({
        destination: `/app/exit-room/${roomId}`,
        body: profileData.userNickname,
        headers: { "content-type": "text/plain" },
      });
    }

    setTimeout(() => {
      setIsExiting(false);
      navigate("/catch-mind");
    }, 500);
  }, [client, dispatch, navigate, profileData?.userNickname, roomId]);

  const { play: playCountdown } = useSound(
    "https://meeple-file-server-2.s3.ap-northeast-2.amazonaws.com/static-files/gameCountDown.mp3"
  );

  // 게임 시작 처리 함수
  const handleStartGame = useCallback(async () => {
    if (!roomId || !client) return;

    try {
      // 시작 메시지 전송
      client.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify({
          message: "🎮 게임이 곧 시작됩니다!",
          sender: "SYSTEM",
          isNotice: true,
        }),
        headers: { "content-type": "application/json" },
      });

      // 카운트다운 시작 (3)
      client.publish({
        destination: `/topic/catch-mind/${roomId}`,
        body: JSON.stringify({
          type: "countdown",
          count: 3,
        }),
        headers: { "content-type": "application/json" },
      });

      // 2초 카운트다운
      setTimeout(() => {
        client.publish({
          destination: `/topic/catch-mind/${roomId}`,
          body: JSON.stringify({
            type: "countdown",
            count: 2,
          }),
          headers: { "content-type": "application/json" },
        });
      }, 1000);

      // 1초 카운트다운
      setTimeout(() => {
        client.publish({
          destination: `/topic/catch-mind/${roomId}`,
          body: JSON.stringify({
            type: "countdown",
            count: 1,
          }),
          headers: { "content-type": "application/json" },
        });
      }, 2000);

      // START! 표시 및 게임 시작
      setTimeout(() => {
        client.publish({
          destination: `/topic/catch-mind/${roomId}`,
          body: JSON.stringify({
            type: "countdown",
            count: 0,
          }),
          headers: { "content-type": "application/json" },
        });

        dispatch(resetGameState());
        dispatch(updateGameState({ isGameStart: true }));

        client.publish({
          destination: `/app/start-game/${roomId}`,
          body: "",
          headers: {
            "content-type": "text/plain",
          },
        });

        // 게임 시작 메시지
        client.publish({
          destination: `/app/chat/${roomId}`,
          body: JSON.stringify({
            message: "🎨 게임이 시작되었습니다! 행운을 빕니다!",
            sender: "SYSTEM",
            isNotice: true,
          }),
          headers: { "content-type": "application/json" },
        });
      }, 3000);
    } catch (error) {
      console.error("Game start error:", error);
    }
  }, [roomId, client, dispatch]);

  // gameState 변경 감지를 위한 useEffect 추가
  useEffect(() => {
    if (gameState.isGameStart) {
      setHasPlayedGame(true);
    }
  }, [gameState.isGameStart]);

  // 제시어 가져오기
  const currentWord = useMemo(() => {
    if (!gameState.isGameStart) {
      return "";
    }

    const isDrawer = currentPlayer?.nickname === profileData?.userNickname;
    return isDrawer ? gameState.currentWord || "준비중..." : "???";
  }, [
    gameState.isGameStart,
    gameState.currentWord,
    currentPlayer?.nickname,
    profileData?.userNickname,
  ]);

  // WebSocket을 통한 방 업데이트 구독
  useEffect(() => {
    if (roomId && connected) {
      sendMessage({
        destination: `/topic/catch-mind/${roomId}`,
        subscribe: true,
        callback: (message) => {
          try {
            const data = JSON.parse(message.body);

            if (data.type === "roomInfo" && data.roomInfo) {
              const updatedRoomInfo = {
                ...data.roomInfo,
                isGameStart:
                  data.roomInfo.isGameStarted ||
                  data.roomInfo.isGameStart ||
                  false,
              };
              setRoomInfo(updatedRoomInfo);

              if (data.roomInfo.players) {
                const players = data.roomInfo.players.map((player, index) => ({
                  id: index + 1,
                  nickname: player,
                  score: 0,
                  isTurn: index === 0,
                  isCurrentUser: player === profileData?.userNickname,
                }));
                dispatch(updatePlayers({ players }));
              }
            }

            if (data.type === "players") {
              const players = data.players.map((player, index) => ({
                id: index + 1,
                nickname: player,
                score: 0,
                isTurn: index === 0,
                isCurrentUser: player === profileData?.userNickname,
              }));
              dispatch(updatePlayers({ players }));
              setRoomInfo((prev) => ({ ...prev, players: data.players }));
            }

            if (data.type === "updateRoom" && data.roomInfo) {
              setRoomInfo((prev) => ({
                ...prev,
                ...data.roomInfo,
              }));
            }
          } catch (error) {}
        },
      });
    }
  }, [roomId, dispatch, profileData?.userNickname, sendMessage]);

  // 최초 방 입장 처리
  useEffect(() => {
    const handleInitialJoin = async () => {
      if (!isInitialJoin || !profileData?.userNickname || !roomId) return;

      try {
        setIsLoading(true);
        const joinData = await CatchMindAPI.joinRoom(
          roomId,
          profileData.userNickname,
          roomInfo?.password || ""
        );

        if (joinRoom && typeof joinRoom === "function") {
          await joinRoom(joinData);
          setIsInitialJoin(false);
        }
      } catch (error) {
        console.error("Join room error:", error);
        setIsLoading(false);
        navigate("/catch-mind");
      }
    };

    handleInitialJoin();

    return () => {
      dispatch(resetGameState());
    };
  }, [
    roomId,
    profileData?.userNickname,
    roomInfo?.password,
    isInitialJoin,
    dispatch,
    joinRoom,
    navigate,
  ]);

  // 프로필 정보 가져오기
  useEffect(() => {
    if (userId) {
      dispatch(fetchProfile(userId));
    }
  }, [userId, dispatch]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <CountdownModal count={countdown} isVisible={countdown !== null} />
      <GameResultModal
        isOpen={showResults}
        onClose={handleCloseResults}
        results={gameResults || []}
      />
      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onClose={handleCloseExitModal}
        onConfirm={handleConfirmExit}
      />
      <div className="flex-1 p-4">
        <div className="h-full flex flex-col space-y-4">
          <GameInfo
            round={gameState?.currentRound || 1}
            word={currentWord}
            roomInfo={{
              roomId: roomId,
              roomTitle: gameState.roomTitle,
              isPrivate: gameState.isPrivate,
              timeLimit: gameState.timeLimit,
              maxPeople: gameState.maxPeople,
              quizCount: gameState.quizCount,
              players: gameState.players.map((p) => p.nickname),
              isGameStart: gameState.isGameStart,
            }}
            handleExitRoom={handleExitRoom}
            handleStartGame={handleStartGame}
            isCreator={isCreator}
            client={client}
            isCurrentUserDrawer={isCurrentUserDrawer}
          />

          <div className="flex-1 bg-white/5 rounded-lg border border-gray-700 shadow-lg">
            <div className="p-4 h-full">
              <div className="h-full bg-white rounded-xl border border-gray-200 shadow-lg">
                <Canvas />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/3 flex flex-col gap-4 p-4 border-l border-gray-700">
        <VideoContainer
          nickname={getCurrentUserNickname()}
          sessionId={sessionId}
          isCurrentUser={true}
          players={gameState.players}
          currentPlayer={currentPlayer}
        />

        <ChatContainer
          roomId={roomId}
          currentUser={getCurrentUserNickname()}
          correctAnswer={gameState?.currentWord || ""}
        />
      </div>
      <GameReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleReviewClose}
        gameInfoId={3} // 캐치마인드 게임의 gameInfoId를 여기에 입력
      />
    </div>
  );
};

export default MainLayout;
