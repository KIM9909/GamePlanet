import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useCockroachSocket from "../../hooks/useCockroachSocket";
import GameBoard from "../../components/game/cockroachcard/GameBoard";
import GameStartScreen from "../../components/game/cockroachcard/GameStartScreen";
import GameSidebar from "../../components/sidebar/GameSidebar";
import VideoChat from "../../components/game/cockroachcard/VideoChat";
import {
  setRoomData,
  setGameData,
  setGameStarted,
  resetGame,
  setCurrentUser,
} from "../../sources/store/slices/CockroachSlice";
import { toast } from "react-hot-toast";

const CockroachPokerPage = () => {
  const { roomId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isGameStarted, gameData, roomData, players, currentUser } =
    useSelector((state) => state.cockroach);
  const userId = useSelector((state) => state.user.userId);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const subscriptionRef = useRef(null);
  const { sendMessage, startGame, stompClient, connected } =
    useCockroachSocket(roomId);

  useEffect(() => {
    const restoreGameState = () => {
      try {
        // 게임 상태 확인
        const gameStatus = localStorage.getItem(`game_${roomId}_status`);
        const savedGameData = localStorage.getItem(`game_${roomId}_data`);

        if (gameStatus === "started" && savedGameData) {
          const parsedGameData = JSON.parse(savedGameData);
          dispatch(setGameData(parsedGameData));
          dispatch(setGameStarted(true));
        }

        // 방 정보 복원
        const savedRoomData = localStorage.getItem(`room_${roomId}_data`);
        if (savedRoomData) {
          dispatch(setRoomData(JSON.parse(savedRoomData)));
        }
      } catch (error) {
        console.error("게임 상태 복원 중 오류:", error);
      }
    };

    if (roomId && currentUser) {
      restoreGameState();
    }
  }, [roomId, currentUser]);

  // 게임 상태 복원을 위한 useEffect
  useEffect(() => {
    if (!roomId || !currentUser) return;

    const savedState = localStorage.getItem(`game_${roomId}_current_state`);
    const gameStatus = localStorage.getItem(`game_${roomId}_status`);

    if (savedState && gameStatus === "started") {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch(setGameData(parsedState));
        dispatch(setGameStarted(true));
        setHasJoined(true); // 필요한 경우
      } catch (error) {
        console.error("게임 상태 복원 실패:", error);
      }
    }
  }, [roomId, currentUser, dispatch]);

  // 프로필 및 방 참여 로직
  const fetchProfileAndJoinRoom = async () => {
    try {
      // 이미 참여했거나 재시도 횟수 초과시 중단
      if (hasJoined || retryCount > 3) return;

      // 프로필 정보 가져오기
      const response = await fetch(
        `${import.meta.env.VITE_LOCAL_API_BASE_URL}/profile/${userId}`
      );
      if (!response.ok) throw new Error("프로필을 가져오는데 실패했습니다.");
      const profileData = await response.json();
      dispatch(setCurrentUser(profileData.userNickname));

      // 방 정보 가져오기
      const roomCheckResponse = await fetch(
        `${import.meta.env.VITE_LOCAL_API_BASE_URL}/game/room/${roomId}`
      );
      if (!roomCheckResponse.ok)
        throw new Error("방 정보를 가져오는데 실패했습니다.");
      const currentRoomData = await roomCheckResponse.json();

      // 상태 업데이트
      dispatch(
        setRoomData({
          ...currentRoomData,
          roomTitle: currentRoomData.roomTitle || "바퀴벌레 포커",
        })
      );

      // WebSocket을 통한 방 참여
      if (connected && stompClient) {
        stompClient.publish({
          destination: "/app/game/join-room",
          body: JSON.stringify({
            roomId: parseInt(roomId),
            playerName: profileData.userNickname,
            password: "",
          }),
        });
        setHasJoined(true);
        setRetryCount(0); // 성공시 재시도 카운트 리셋
      } else {
        throw new Error("WebSocket 연결이 되지 않았습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      setRetryCount((prev) => prev + 1);

      if (retryCount >= 3) {
        toast.error("방 입장에 실패했습니다. 메인으로 이동합니다.");
        setTimeout(() => navigate("/home"), 1500);
      } else {
        toast.error(`방 입장 재시도 중... (${retryCount + 1}/3)`);
        // 1초 후 재시도
        setTimeout(fetchProfileAndJoinRoom, 1000);
      }
    }
  };

  // 초기 체크 및 방 참여
  useEffect(() => {
    if (!roomId) {
      console.log("roomId가 없어서 /home으로 리디렉션");
      navigate("/home");
      return;
    }

    if (!userId) {
      console.log("userId가 없어서 /home으로 리디렉션");
      navigate("/home");
      return;
    }

    if (connected && stompClient && !hasJoined) {
      fetchProfileAndJoinRoom();
    }
  }, [roomId, userId, connected, stompClient]);

  // WebSocket 구독 설정
  useEffect(() => {
    if (!stompClient || !connected || !currentUser) return;
  
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
  
    const handleGameMessage = (message) => {
      try {
        const response = JSON.parse(message.body);
        console.log("웹소켓 메시지 수신:", response);
  
        // 카드 전달 메시지 처리
        if (response.to && response.from && response.card) {
          const updatedGameData = {
            ...gameData,
            gameState: {
              ...(gameData.gameState || {}),
              cardReceiver: response.to,
              cardSender: response.from,
              currentCard: response.card,
              claimedAnimal: response.animal,
              isKing: response.king,
              currentPhase: "GUESS_OR_FORWARD",
              currentTurn: response.from,
              passCount: 0,
              passedPlayers: [],
            },
            playerCards: {
              ...gameData.playerCards,
              [response.from]: gameData.playerCards[response.from].filter(
                card => card.type !== response.card.type || card.royal !== response.card.royal
              )
            }
          };
        
          dispatch(setGameData(updatedGameData));
          localStorage.setItem(
            `game_${roomId}_current_state`,
            JSON.stringify(updatedGameData)
          );
        }
        // 방 정보 업데이트
        else if (response.type === "UPDATE_ROOM" || response.roomInfo) {
          const roomInfo = response.roomInfo || response.data;
          if (roomInfo) {
            const uniquePlayers = [...new Set(roomInfo.players || [])];
            const updateRoomData = {
              ...roomInfo,
              roomTitle: roomInfo.roomTitle,
              players: uniquePlayers,
            };
  
            dispatch(setRoomData(updateRoomData));
            localStorage.setItem(
              `room_${roomId}_data`,
              JSON.stringify(updateRoomData)
            );
          }
        }
  
        // 게임 데이터 업데이트
        else if (response.players && response.gameData) {
          const uniquePlayers = [...new Set(response.players)];
          const updatedGameData = {
            ...response,
            players: uniquePlayers,
            roomTitle: roomData?.roomTitle || response.roomTitle,
            currentUser,
            gameData: {
              ...response.gameData,
            },
          };
  
          dispatch(setGameData(updatedGameData));
          localStorage.setItem(
            `game_${roomId}_current_state`,
            JSON.stringify(updatedGameData)
          );
          localStorage.setItem(`game_${roomId}_status`, "started");
  
          if (response.gameData) {
            setIsStarting(false);
            dispatch(setGameStarted(true));
            setHasJoined(true);
          }
        }
      } catch (error) {
        console.error("웹소켓 메시지 처리 중 오류:", error);
      }
    };
  
    subscriptionRef.current = stompClient.subscribe(
      `/topic/game/${roomId}`,
      handleGameMessage
    );
  
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [stompClient, connected, currentUser, roomId, gameData, roomData, dispatch]);

  // 게임 시작 핸들러
  const handleStartGame = async () => {
    if (!connected) {
      console.log("서버와 연결되지 않았습니다.");
      return;
    }
    if (isStarting) return;

    try {
      setIsStarting(true);
      setHasJoined(true);
      await startGame();

      if (roomData) {
        localStorage.setItem(`room_${roomId}_data`, JSON.stringify(roomData));
      }
      console.log("게임 시작 요청 전송!!");
    } catch (error) {
      console.error("게임 시작 실패:", error);
      toast.error("게임 시작에 실패했습니다.");
      setIsStarting(false);
    }
  };

  const handleGameEnd = () => {
    localStorage.removeItem(`game_${roomId}_status`);
    localStorage.removeItem(`game_${roomId}_data`);
    localStorage.removeItem(`room_${roomId}_data`);
    dispatch(resetGame());
  };

  // 방 업데이트 핸들러
  const handleUpdateRoom = (updateData) => {
    sendMessage({
      type: "UPDATE_ROOM",
      data: updateData,
    });
  };

  // 로딩 화면
  if (!currentUser && !isGameStarted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  // 메인 렌더링
  return (
    <div className="h-screen w-screen flex bg-gray-900">
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-72" : "w-0"
        } relative z-50`}
      >
        <div
          className={`fixed top-0 left-0 h-full transition-transform duration-300 ease-in-out transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <GameSidebar />
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 rounded-r text-white hover:bg-gray-700 focus:outline-none flex items-center justify-center"
          >
            {isSidebarOpen ? "←" : "→"}
          </button>
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        <div className="flex-1 overflow-hidden">
          {!isGameStarted ? (
            <GameStartScreen
              playerCount={players?.length || 0}
              onStart={handleStartGame}
              roomTitle={roomData?.roomTitle || "바퀴벌레 포커"}
              maxPeople={roomData?.maxPeople || 4}
              isCreator={roomData?.creator === currentUser}
              onUpdateRoom={handleUpdateRoom}
              gameData={gameData}
              players={players || []}
              roomData={roomData}
              stompClient={stompClient}
            />
          ) : (
            <GameBoard
              playerCount={players?.length || 0}
              gameData={gameData}
              currentUser={currentUser}
              sendMessage={sendMessage}
              stompClient={stompClient}
              roomId={roomId}
              onGameEnd={() => dispatch(resetGame())}
            />
          )}
        </div>

        <div className="h-48 bg-gray-800 border-t border-gray-700">
          {connected && (
            <VideoChat
              userId={currentUser}
              playerCount={players?.length || 0}
              players={players}
            />
          )}
        </div>
      </div>

      {!isSidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 rounded-r text-white hover:bg-gray-700 focus:outline-none flex items-center justify-center z-50"
        >
          →
        </button>
      )}
    </div>
  );
};

export default CockroachPokerPage;
