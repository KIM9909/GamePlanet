import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Timer, Users, Lock, LogOut, Flag } from "lucide-react";
import Canvas from "./Canvas";
import ChatBox from "./ChatBox";
import PlayerCard from "./PlayerCard";
import CatchMindUpdateRoomModal from "./CatchMindUpdateRoomModal";
import {
  updatePlayers,
  resetGameState,
} from "../../../../sources/store/slices/CatchMindSlice";
import { fetchProfile } from "../../../../sources/store/slices/ProfileSlice";
import { CatchMindAPI } from "../../../../sources/api/CatchMindAPI";
import useCatchSocket from "../../../../hooks/useCatchSocket";

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roomId } = useParams();
  const [roomInfo, setRoomInfo] = useState(null);
  const [isInitialJoin, setIsInitialJoin] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const gameState = useSelector((state) => state.catchmind);
  const profileData = useSelector((state) => state.profile.profileData);
  const userId = useSelector((state) => state.user.userId);

  // creator 체크를 redux store 기반으로 수정
  const isCreator = gameState.creator === profileData?.userNickname;

  // useCatchSocket hook 사용
  const { sendMessage, client, joinRoom } = useCatchSocket(roomId);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 드로잉 도구 상태 관리
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedWidth, setSelectedWidth] = useState(2);
  const [isEraser, setIsEraser] = useState(false);
  const [clearCanvas, setClearCanvas] = useState(null);

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
      console.log("[ExitRoom] Starting exit process");

      dispatch(resetGameState());

      client.publish({
        destination: `/app/exit-room/${roomId}`,
        body: profileData.userNickname,
        headers: { "content-type": "text/plain" },
      });

      setTimeout(() => {
        setIsExiting(false);
        console.log("[ExitRoom] Navigating to lobby");
        navigate("/catch-mind");
      }, 500);
    } catch (error) {
      console.error("[ExitRoom] Error during exit:", error);
      setIsExiting(false);
    }
  }, [
    roomId,
    profileData?.userNickname,
    client,
    navigate,
    isExiting,
    dispatch,
  ]);

  // WebSocket을 통한 방 업데이트 구독
  useEffect(() => {
    if (roomId) {
      sendMessage({
        destination: `/topic/catch-mind/${roomId}`,
        subscribe: true,
        callback: (message) => {
          try {
            const data = JSON.parse(message.body);

            // 플레이어 목록 업데이트
            if (data.players) {
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

            // 방 정보 업데이트 처리
            if (data.type === "updateRoom" && data.roomInfo) {
              setRoomInfo((prev) => ({
                ...prev,
                ...data.roomInfo,
              }));
            }
          } catch (error) {
            console.error("메시지 파싱 오류:", error);
          }
        },
      });
    }
  }, [roomId, dispatch, profileData?.userNickname, sendMessage]);

  // 컴포넌트 언마운트시 정리
  useEffect(() => {
    return () => {
      if (isExiting) {
        console.log("[ExitRoom] Component cleanup initiated");
      }
    };
  }, [isExiting]);

  // 프로필 정보 가져오기
  useEffect(() => {
    if (userId) {
      dispatch(fetchProfile(userId));
    }
  }, [userId, dispatch]);

  // 방 정보 가져오기
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const response = await CatchMindAPI.getRoomList();
        const currentRoom = response.find(
          (room) => room.roomId === parseInt(roomId)
        );

        if (currentRoom) {
          const cleanedRoom = {
            ...currentRoom,
            players: Array.isArray(currentRoom.players)
              ? [...new Set(currentRoom.players.filter(Boolean))]
              : [],
          };

          setRoomInfo((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cleanedRoom)) {
              return cleanedRoom;
            }
            return prev;
          });

          const currentUserNickname = getCurrentUserNickname();
          const players = cleanedRoom.players.map((player, index) => ({
            id: index + 1,
            nickname: player,
            score: currentRoom.gameInfo?.playerScore?.[player] || 0,
            isTurn: currentRoom.gameInfo?.currentTurn
              ? player === currentRoom.gameInfo.currentTurn
              : index === 0,
            isCurrentUser: player === currentUserNickname,
          }));

          if (JSON.stringify(gameState.players) !== JSON.stringify(players)) {
            dispatch(updatePlayers({ players }));
          }
        }
      } catch (error) {
        console.error("방 정보 가져오기 실패:", error);
      }
    };
  }, [
    roomId,
    profileData?.userNickname,
    isExiting,
    dispatch,
    getCurrentUserNickname,
  ]);

  // 최초 방 입장 처리
  useEffect(() => {
    const handleInitialJoin = async () => {
      if (!isInitialJoin || !profileData?.userNickname || !roomId) return;

      try {
        const joinData = await CatchMindAPI.joinRoom(
          roomId,
          profileData.userNickname,
          roomInfo?.password || ""
        );

        if (joinRoom && typeof joinRoom === "function") {
          joinRoom(joinData);
          setIsInitialJoin(false);
        }
      } catch (error) {
        console.error("방 입장 처리 실패:", error);
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
  ]);

  // 게임 시작 처리 함수
  const handleStartGame = useCallback(async () => {
    if (!roomId || !client) return;

    try {
      console.log("[StartGame] 게임 시작 요청 전송");
      dispatch(resetGameState());

      client.publish({
        destination: `/app/start-game/${roomId}`,
        body: "",
        headers: {
          "content-type": "text/plain",
        },
      });
    } catch (error) {
      console.error("[StartGame] 게임 시작 요청 실패:", error);
    }
  }, [roomId, client, dispatch]);

  // 제시어 가져오기
  const currentWord = useMemo(() => {
    if (!gameState.isGameStarted) {
      return "";
    }

    const isDrawer = currentPlayer?.nickname === profileData?.userNickname;
    return isDrawer ? gameState.currentWord || "준비중..." : "???";
  }, [
    gameState.isGameStarted,
    gameState.currentWord,
    currentPlayer?.nickname,
    profileData?.userNickname,
  ]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-1 p-4">
        <div className="h-full flex flex-col bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
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
              isGameStarted: gameState.isGameStarted,
            }}
            handleExitRoom={handleExitRoom}
            handleStartGame={handleStartGame}
            isCreator={isCreator}
            client={client}
            isCurrentUserDrawer={isCurrentUserDrawer}
          />
          <div className="flex-1 p-6">
            <div className="h-full bg-white rounded-xl border border-gray-200">
              <Canvas />
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/3 flex flex-col gap-4 p-4 border-l border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          {gameState?.players?.map((player) => (
            <PlayerCard
              key={player.id}
              userId={player.id}
              userNickname={player.nickname}
              isCurrentTurn={player.isTurn}
              score={player.score}
              isCurrentUser={player.isCurrentUser}
            />
          ))}
        </div>

        <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <ChatBox
            roomId={roomId}
            currentUser={getCurrentUserNickname()}
            correctAnswer={gameState?.currentWord || ""}
          />
        </div>
      </div>
    </div>
  );
};

const GameInfo = ({
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

  useEffect(() => {
    let timer;

    if (roomInfo?.isGameStarted) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            if (client && isCurrentUserDrawer) {
              console.log("출제자가 타임아웃 요청을 보냅니다.");
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
    roomInfo?.isGameStarted,
    roomInfo?.timeLimit,
    roomInfo?.roomId,
    client,
    isCurrentUserDrawer,
  ]);

  useEffect(() => {
    if (roomInfo?.isGameStarted) {
      setTimeLeft(roomInfo?.timeLimit || 90);
    }
  }, [word, roomInfo?.timeLimit]);

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg border-b border-gray-700">
      <div className="flex items-center space-x-2 min-w-[200px]">
        <h2 className="text-xl font-bold truncate">{roomInfo?.roomTitle}</h2>
        {roomInfo?.isPrivate && (
          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center justify-center space-x-6 flex-1 mx-4">
        {/* 방장이고 게임이 시작되지 않았을 때 버튼들 표시 */}
        {isCreator && !roomInfo?.isGameStarted && (
          <div className="flex items-center space-x-4">
            <button
              onClick={handleStartGame}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors flex items-center space-x-2"
            >
              <span>게임 시작</span>
            </button>
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors flex items-center space-x-2"
            >
              <span>방 정보 수정</span>
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-full">
          <Flag className="w-4 h-4 text-blue-400" />
          <span className="font-medium">
            Round {round}/{roomInfo?.quizCount || 10}
          </span>
        </div>

        <div className="flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-full">
          <Timer className="w-4 h-4 text-blue-400" />
          <span className="font-medium">{timeLeft}초</span>
        </div>

        {word && (
          <div className="px-6 py-2 bg-blue-500/20 rounded-full border border-blue-400/30">
            <span className="font-medium text-blue-100">제시어: {word}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 min-w-[200px] justify-end">
        <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1.5 rounded-full">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-gray-200">
            {roomInfo?.players?.length || 0}/{roomInfo?.maxPeople}
          </span>
        </div>
        <button
          onClick={handleExitRoom}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>나가기</span>
        </button>
      </div>

      {/* 방 정보 수정 모달 */}
      <CatchMindUpdateRoomModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        roomInfo={roomInfo}
        client={client}
      />
    </div>
  );
};

export default MainLayout;
