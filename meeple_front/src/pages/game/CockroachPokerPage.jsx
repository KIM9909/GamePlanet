import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useSocket from "../../hooks/useSocket";
import GameBoard from "../../components/game/cockroachcard/GameBoard";
import GameSidebar from "../../components/sidebar/GameSidebar";
import VideoChat from "../../components/videochat/VideoChat";

const CockroachPokerPage = () => {
  const { roomId } = useParams();
  const { connected, sendMessage, startGame } = useSocket(roomId);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [gameData, setGameData] = useState(null);
  const currentUser = "user1"; // 실제로는 로그인 정보나 context에서 가져와야 함

  // 방 정보 가져오기
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const response = await fetch(`/api/game/room/${roomId}`);
        const data = await response.json();
        setGameData(data); // 여기서 room_name이 포함된 데이터를 받아옴
      } catch (error) {
        console.error("방 정보 가져오기 실패:", error);
      }
    };

    fetchRoomInfo();
  }, [roomId]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleStartGame = async () => {
    // 실제 서버 연동 코드 (현재는 주석처리)
    /*
    try {
      const response = await startGame();
      if (response && response.data) {
        setGameData(response.data);
      }
    } catch (error) {
      console.error("게임 시작 실패:", error);
    }
    */

    // 테스트용 임시 데이터
    const mockGameData = {
      players: ["user1", "user2", "user3", "user4"],
      gameData: {
        gameState: {
          currentTurn: "user2",
          currentPhase: "GUESS_OR_FORWARD",
          currentCard: {
            type: "Black",
            royal: false,
          },
          cardSender: "user3",
          cardReceiver: "user1",
          claimedAnimal: "Stinkbug",
          isKing: false,
          isNegative: false,
          passedPlayers: ["user2", "user3"], // PASS한 플레이어들
          passCount: 2, // 현재까지 PASS 횟수
        },
        playerCards: {
          user1: [
            { type: "Rat", royal: true },
            { type: "Bat", royal: false },
            { type: "Bat", royal: false },
            { type: "Fly", royal: false },
            { type: "Black", royal: false },
            { type: "Cockroach", royal: true },
            { type: "Scorpion", royal: false },
            { type: "Toad", royal: false },
            { type: "Joker", royal: false },
          ],
          user2: Array(8).fill(null),
          user3: Array(8).fill(null),
          user4: Array(8).fill(null),
        },
        publicDeck: [
          { type: "Scorpion", royal: false },
          { type: "Toad", royal: true },
          { type: "Stinkbug", royal: false },
        ],
        userTableCards: {
          user1: [
            { type: "Bat", count: 2 },
            { type: "Rat", count: 1, royal: true },
            { type: "Cockroach", count: 2 },
            { type: "Scorpion", count: 1 },
            { type: "Toad", count: 1, royal: true },
          ],
          user2: [
            { type: "Bat", count: 2 },
            { type: "Rat", count: 1, royal: true },
            { type: "Fly", count: 1 },
          ],
          user3: [
            { type: "Cockroach", count: 3 },
            { type: "Scorpion", count: 1, royal: true },
            { type: "Scorpion", count: 1 },
            { type: "Toad", count: 2 },
            { type: "Stinkbug", count: 1 },
            { type: "Rat", count: 2 },
          ],
          user4: [
            { type: "Bat", count: 1, royal: true },
            { type: "Rat", count: 2 },
            { type: "Fly", count: 2 },
            { type: "Cockroach", count: 1 },
          ],
        },
      },
    };

    setGameData(mockGameData);
  };

  const playerCount = gameData?.players?.length || 0;

  return (
    <div className="h-screen w-screen flex bg-gray-900">
      {/* 사이드바 */}
      <div
        className={`transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-72" : "w-0"} 
        relative z-50`}
      >
        <div
          className={`fixed top-0 left-0 h-full transition-transform duration-300 ease-in-out transform 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <GameSidebar />
          <button
            onClick={toggleSidebar}
            className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-12 
              bg-gray-800 rounded-r text-white hover:bg-gray-700 
              focus:outline-none flex items-center justify-center"
          >
            {isSidebarOpen ? "←" : "→"}
          </button>
        </div>
      </div>

      {/* 메인 게임 영역 */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "ml-0" : "ml-0"}`}
      >
        {/* 게임 보드 */}
        <div className="flex-1 overflow-hidden">
          <GameBoard
            playerCount={playerCount}
            onStartGame={handleStartGame}
            gameData={gameData}
            currentUser={currentUser}
            sendMessage={sendMessage}
          />
        </div>

        {/* 화상 채팅 영역 */}
        <div className="h-48 bg-gray-800 border-t border-gray-700">
          <VideoChat playerCount={playerCount} />
        </div>
      </div>

      {/* 토글 버튼 (사이드바가 닫혀있을 때) */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 -translate-y-1/2 w-12 h-12 
            bg-gray-800 rounded-r text-white hover:bg-gray-700 
            focus:outline-none flex items-center justify-center
            z-50"
        >
          →
        </button>
      )}
    </div>
  );
};

export default CockroachPokerPage;
