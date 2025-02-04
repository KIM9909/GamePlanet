import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useSocket from "../../hooks/useCockroachSocket";
import GameBoard from "../../components/game/cockroachcard/GameBoard";
import GameStartScreen from "../../components/game/cockroachcard/GameStartScreen";
import GameSidebar from "../../components/sidebar/GameSidebar";
import VideoChat from "../../components/game/cockroachcard/VideoChat";
import {
  setRoomData,
  setGameData,
  setGameStarted,
  resetGame,
} from "../../sources/store/slices/CockroachSlice";
import { toast } from "react-hot-toast";

const CockroachPokerPage = () => {
  const { roomId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // States
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Refs
  const subscriptionRef = useRef(null);

  // Selectors
  const { isGameStarted, gameData, roomData, players } = useSelector(
    (state) => state.cockroach
  );
  const userId = useSelector((state) => state.user.userId);

  // Socket
  const { sendMessage, startGame, stompClient, connected } = useSocket(roomId);

  useEffect(() => {
    console.log("Redux 상태 변화:", {
      isGameStarted,
      roomData,
      userId,
      players
    });
  }, [isGameStarted, roomData, userId, players]);

  useEffect(() => {
    console.log("소켓 연결 상태:", {
      connected,
      stompClient: !!stompClient
    });
  }, [connected, stompClient]);

  const fetchPlayerNicknames = async (playerIds) => {
    const nicknameMap = new Map();
    if (userId) nicknameMap.set(userId.toString(), currentUser);

    const promises = playerIds.map(async (playerId) => {
      if (nicknameMap.has(playerId)) return;

      try {
        const profileResp = await fetch(
          `http://localhost:8090/profile/${playerId}`
        );
        if (!profileResp.ok)
          throw new Error(`Failed to fetch profile for ${playerId}`);
        const profile = await profileResp.json();
        nicknameMap.set(playerId, profile.userNickname);
      } catch (error) {
        console.error(`Failed to fetch nickname for ${playerId}:`, error);
        nicknameMap.set(playerId, playerId);
      }
    });

    await Promise.all(promises);
    return playerIds.map((id) => nicknameMap.get(id) || id);
  };

  // Profile fetch and room join effect 수정
  const fetchProfileAndJoinRoom = async () => {
    try {
      // 프로필 정보 가져오기
      const response = await fetch(`http://localhost:8090/profile/${userId}`);
      const profileData = await response.json();
      setCurrentUser(profileData.userNickname);

      // 방 정보 가져오기
      const roomCheckResponse = await fetch(
        `http://localhost:8090/game/room/${roomId}`
      );
      const currentRoomData = await roomCheckResponse.json();

      // 플레이어 닉네임 가져오기
      const playerNicknames = await fetchPlayerNicknames(
        currentRoomData.players || []
      );

      const updatedRoomInfo = {
        ...currentRoomData,
        players: playerNicknames,
        // 방 제목 우선순위 변경: 서버에서 받은 roomTitle을 우선적으로 사용
        roomTitle: currentRoomData.roomTitle || "바퀴벌레 포커",
      };

      // roomData 업데이트
      dispatch(setRoomData(updatedRoomInfo));

      setHasJoined(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error("방 입장에 실패했습니다.");
      navigate("/home");
    }
  };

  // Initial check effect
  useEffect(() => {
    if (!roomId) {
      console.log("roomId가 없어서 /home으로 리디렉션");
      navigate("/home");
      return;
    }

    if (!hasJoined && !userId && !isGameStarted) {
      console.log("최초 입장 시 userId가 없어서 /home으로 리디렉션");
      navigate("/home");
    }
  }, [roomId, userId, navigate, hasJoined, isGameStarted]);

  // Profile fetch and room join effect
  useEffect(() => {
    if (!userId || !roomId || (!hasJoined && isGameStarted)) return;

    fetchProfileAndJoinRoom();
  }, [userId, roomId]);

  // WebSocket subscription effect
  useEffect(() => {
    if (!stompClient || !connected || !currentUser) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = stompClient.subscribe(
      `/topic/game/${roomId}`,
      async (message) => {
        try {
          const response = JSON.parse(message.body);
          console.log("웹소켓 메시지 수신:", response);

          if (response.type === "UPDATE_ROOM") {
            const uniquePlayers = [...new Set(response.data.players)];
            const playerNicknames = await fetchPlayerNicknames(uniquePlayers);

            const updatedRoomData = {
              ...response.data,
              players: playerNicknames.filter((nickname) => nickname),
              roomTitle: response.data.roomTitle,
            };

            // roomData 업데이트만 하고 roomTitle은 따로 업데이트하지 않음
            dispatch(setRoomData(updatedRoomData));

              } else if (response.players && response.gameData) {
            const uniquePlayers = [...new Set(response.players)];
            const playerNicknames = await fetchPlayerNicknames(uniquePlayers);

            // 게임 데이터 업데이트 시에도 기존 방 제목 유지
            const updatedGameData = {
              ...response,
              players: playerNicknames.filter((nickname) => nickname),
              roomTitle: roomData?.roomTitle || response.roomTitle,
            };

            dispatch(setGameData(updatedGameData));

            if (response.gameData.isGameStart) {
              setIsStarting(false);
              dispatch(setGameStarted(true));
              setHasJoined(true);
            }
          }
        } catch (error) {
          console.error("웹소켓 메시지 처리 중 오류:", error);
        }
      }
    );

    // 방 입장 메시지 전송
    stompClient.publish({
      destination: `/app/game/join/${roomId}`,
      body: JSON.stringify({
        userId,
        nickname: currentUser,
      }),
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [stompClient, connected, currentUser, roomId, roomData]);

  const handleStartGame = async () => {
    if (!connected) {
      toast.error("서버와 연결되지 않았습니다.");
      return;
    }
    if (isStarting) return;

    try {
      setIsStarting(true);
      setHasJoined(true);
      await startGame();
      console.log("게임 시작 요청 전송!!");
    } catch (error) {
      console.error("게임 시작 실패:", error);
      toast.error("게임 시작에 실패했습니다.");
      setIsStarting(false);
    }
  };

  const handleUpdateRoom = (updateData) => {
    sendMessage({
      type: "UPDATE_ROOM",
      data: updateData,
    });
  };

  if (!currentUser && !isGameStarted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

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
              isCreator={roomData?.creator?.toString() === userId?.toString()}
              onUpdateRoom={handleUpdateRoom}
              gameData={gameData}
              players={players || []}
              roomData={roomData}
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
