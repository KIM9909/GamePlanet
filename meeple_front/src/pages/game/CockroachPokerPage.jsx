// CockroachPokerPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useSocket from "../../hooks/useCockroachSocket";
import GameBoard from "../../components/game/cockroachcard/GameBoard";
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
  const { sendMessage, startGame, stompClient, connected } = useSocket(roomId);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const subscriptionRef = useRef(null);

  // Redux state를 먼저 가져오기
  const { roomData, isGameStarted } = useSelector((state) => state.cockroach);
  const currentUser = useSelector((state) => state.user.nickname);

  // WebSocket 메시지 핸들러
  const handleWebSocketMessage = useCallback(
    (message) => {
      try {
        const response = JSON.parse(message.body);
        console.log("게임 메시지 수신:", response);
        console.log("현재 게임 상태:", isGameStarted);

        if (response.players && response.gameData) {
          console.log("게임 데이터 받음, Redux 업데이트 전:", response);
          dispatch(setGameData(response));

          if (response.gameData.isGameStart) {
            setIsStarting(false);
            dispatch(setGameStarted(true));
            toast.success("게임이 시작되었습니다!");
          }
        }
      } catch (error) {
        console.error("메시지 처리 중 오류 발생:", error);
      }
    },
    [dispatch, isGameStarted]
  );

  // WebSocket 구독 설정
  useEffect(() => {
    if (!stompClient || !roomId || !connected) return;

    console.log("WebSocket 구독 설정 시도");

    if (subscriptionRef.current) {
      console.log("이미 구독 중입니다.");
      return;
    }

    console.log("새로운 WebSocket 구독 생성");
    subscriptionRef.current = stompClient.subscribe(
      `/topic/game/${roomId}`,
      handleWebSocketMessage
    );

    return () => {
      console.log("Cleanup 실행 - gameStarted:", isGameStarted);
      // 게임이 시작된 상태면 절대 구독 해제하지 않음
      if (isGameStarted) {
        console.log("게임이 시작된 상태 - 구독 유지");
        return;
      }

      if (subscriptionRef.current) {
        console.log("게임 시작 전 상태 - 구독 해제");
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [stompClient, roomId, connected, handleWebSocketMessage, isGameStarted]);

  // 게임 시작 핸들러
  const handleStartGame = async () => {
    if (!connected) {
      toast.error("서버와 연결이 끊어졌습니다. 페이지를 새로고침해주세요.");
      return;
    }

    if (isStarting) {
      return;
    }

    try {
      setIsStarting(true);
      console.log("게임 시작 요청...");
      await startGame();
    } catch (error) {
      console.error("게임 시작 실패:", error);
      toast.error("게임 시작에 실패했습니다.");
      setIsStarting(false);
    }
  };
  return (
    <div className="h-screen w-screen flex bg-gray-900">
      {/* 사이드바 */}
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

      {/* 메인 게임 영역 */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        <div className="flex-1 overflow-hidden">
          <GameBoard
            onStartGame={handleStartGame}
            currentUser={currentUser}
            sendMessage={sendMessage}
            onGameEnd={() => dispatch(resetGame())}
          />
        </div>

        {/* 화상 채팅 영역 */}
        <div className="h-48 bg-gray-800 border-t border-gray-700">
          <VideoChat userId={currentUser} />
        </div>
      </div>

      {/* 사이드바 토글 버튼 */}
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
