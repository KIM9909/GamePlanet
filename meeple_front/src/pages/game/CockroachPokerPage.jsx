import React, { useState, useEffect, useRef } from "react";
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

  const subscriptionRef = useRef(null);
  const { sendMessage, startGame, stompClient, connected } = useSocket(roomId);

  const fetchProfileAndJoinRoom = async () => {
    try {
      const response = await fetch(
        // `${import.meta.env.VITE_LOCAL_API_BASE_URL}/profile/${userId}`
        `${import.meta.env.VITE_API_BASE_URL}/profile/${userId}`
      );
      const profileData = await response.json();

      dispatch(setCurrentUser(profileData.userNickname));
      console.log("현재 유저:", profileData.userNickname);

      // 방 정보 가져오기
      const roomCheckResponse = await fetch(
        // `${import.meta.env.VITE_LOCAL_API_BASE_URL}/game/room/${roomId}`
        `${import.meta.env.VITE_API_BASE_URL}/game/room/${roomId}`
      );
      const currentRoomData = await roomCheckResponse.json();

      const updatedRoomInfo = {
        ...currentRoomData,
        roomTitle: currentRoomData.roomTitle || "바퀴벌레 포커",
      };

      dispatch(setRoomData(updatedRoomInfo));
      setHasJoined(true);

      // WebSocket을 통해 방 참여 처리
      if (connected && stompClient) {
        stompClient.publish({
          destination: "/app/game/join-room",
          body: JSON.stringify({
            roomId: parseInt(roomId),
            playerName: profileData.userNickname,
            password: "",
          }),
        });
        console.log(roomId, profileData.userNickname, "");
      }
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
            dispatch(
              setRoomData({
                ...response.data,
                roomTitle: response.data.roomTitle,
              })
            );
          } else if (response.roomTitle || response.maxPeople) {
            // 방 업데이트 응답 처리 추가
            dispatch(
              setRoomData({
                ...roomData,
                ...response,
              })
            );
          } else if (response.players && response.gameData) {
            dispatch(
              setGameData({
                ...response,
                roomTitle: roomData?.roomTitle || response.roomTitle,
                currentUser,
              })
            );

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

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [stompClient, connected, currentUser, roomId, roomData, dispatch]);

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
