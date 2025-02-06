import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Timer,
  Pencil,
  Eraser,
  Trash2,
  Users,
  Lock,
  LogOut,
  Flag,
} from "lucide-react";
import Canvas from "./Canvas";
import ChatBox from "./ChatBox";
import PlayerCard from "./PlayerCard";
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

      // 방 나가기 전에 게임 상태 초기화
      dispatch(resetGameState());

      // WebSocket을 통해 방 나가기 메시지 전송 - 텍스트로 전송
      client.publish({
        destination: `/app/exit-room/${roomId}`,
        body: profileData.userNickname, // JSON.stringify 제거, 텍스트로 전송
        headers: { "content-type": "text/plain" }, // content-type을 text/plain으로 변경
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
            if (data.players) {
              // 플레이어 목록 업데이트
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

          // roomInfo가 실제로 변경되었을 때만 상태 업데이트
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
            isTurn: currentRoom.gameInfo?.currentTurn // currentTurn이 있으면 그 값을 사용
              ? player === currentRoom.gameInfo.currentTurn
              : index === 0, // 없으면 첫 번째 플레이어가 턴
            isCurrentUser: player === currentUserNickname,
          }));

          // players 정보가 실제로 변경되었을 때만 dispatch
          if (JSON.stringify(gameState.players) !== JSON.stringify(players)) {
            dispatch(updatePlayers({ players }));
          }
        }
      } catch (error) {
        console.error("방 정보 가져오기 실패:", error);
      }
    };

    // if (roomId && profileData?.userNickname && !isExiting) {
    //   fetchRoomInfo();
    //   const intervalId = setInterval(fetchRoomInfo, 2000);
    //   return () => clearInterval(intervalId);
    // }
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

    // 컴포넌트 언마운트 시 게임 상태 초기화
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

  // 제시어 가져오기
  const currentWord = useMemo(() => {
    console.log("게임 상태 체크:", {
      isGameStarted: gameState.isGameStarted,
      currentWord: gameState.currentWord,
      currentPlayerNick: currentPlayer?.nickname,
      profileNick: profileData?.userNickname,
      allPlayers: gameState.players,
    });

    if (!gameState.isGameStarted) {
      console.log("게임이 시작되지 않음");
      return "";
    }

    const isDrawer = currentPlayer?.nickname === profileData?.userNickname;

    console.log("제시어 체크:", {
      isDrawer,
      currentWord: gameState.currentWord,
      willReturn: isDrawer ? gameState.currentWord || "준비중..." : "???",
    });

    return isDrawer ? gameState.currentWord || "준비중..." : "???";
  }, [
    gameState.isGameStarted,
    gameState.currentWord,
    currentPlayer?.nickname,
    profileData?.userNickname,
  ]);

  // 상태 변경 감지
  useEffect(() => {
    console.log("상태 변경 감지:", {
      gameStarted: gameState.isGameStarted,
      currentWord: gameState.currentWord,
      players: gameState.players,
      currentPlayer: currentPlayer,
      profileData: profileData,
    });
  }, [
    gameState.isGameStarted,
    gameState.currentWord,
    gameState.players,
    currentPlayer,
    profileData,
  ]);

  const isCurrentUsersTurn = useCallback(() => {
    return currentPlayer?.nickname === getCurrentUserNickname();
  }, [currentPlayer?.nickname, getCurrentUserNickname]);

  // // 현재 사용자가 방장인지 확인
  // const isCreator = roomInfo?.creator === profileData?.userNickname;

  // 게임 시작 처리 함수
  const handleStartGame = useCallback(async () => {
    if (!roomId || !client) return;

    try {
      console.log("[StartGame] 게임 시작 요청 전송");

      // 게임 시작 전에 초기 상태 리셋
      dispatch(resetGameState());

      // WebSocket을 통해 게임 시작 요청 전송
      client.publish({
        destination: `/app/start-game/${roomId}`,
        body: "", // 빈 body 추가
        headers: {
          "content-type": "text/plain", // JSON이 아닌 text/plain으로 변경
        },
      });
    } catch (error) {
      console.error("[StartGame] 게임 시작 요청 실패:", error);
    }
  }, [roomId, client, dispatch]);

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
            isCreator={isCreator} // 수정된 isCreator 전달
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
          {gameState?.players?.map((player) => {
            // console.log("Rendering PlayerCard:", player);
            return (
              <PlayerCard
                key={player.id}
                userId={player.id}
                userNickname={player.nickname}
                isCurrentTurn={player.isTurn}
                score={player.score}
              />
            );
          })}
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
  isCurrentUserDrawer, // 추가
}) => {
  const [timeLeft, setTimeLeft] = useState(roomInfo?.timeLimit || 90);

  useEffect(() => {
    let timer;

    if (roomInfo?.isGameStarted) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            // 출제자일 때만 타임아웃 요청 보내기
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

  // 새로운 턴이 시작될 때마다 타이머 리셋
  useEffect(() => {
    if (roomInfo?.isGameStarted) {
      setTimeLeft(roomInfo?.timeLimit || 90);
    }
  }, [word, roomInfo?.timeLimit]);

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg border-b border-gray-700">
      {/* 왼쪽: 방 제목과 잠금 아이콘 */}
      <div className="flex items-center space-x-2 min-w-[200px]">
        <h2 className="text-xl font-bold truncate">{roomInfo?.roomTitle}</h2>
        {roomInfo?.isPrivate && (
          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </div>

      {/* 중앙: 게임 상태 정보 */}
      <div className="flex items-center justify-center space-x-6 flex-1 mx-4">
        {/* 방장이고 게임이 시작되지 않았을 때만 시작하기 버튼 표시 */}
        {isCreator && !roomInfo?.isGameStarted && (
          <button
            onClick={handleStartGame}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors flex items-center space-x-2"
          >
            <span>게임 시작</span>
          </button>
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

      {/* 오른쪽: 플레이어 수와 나가기 버튼 */}
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
    </div>
  );
};

export default MainLayout;
