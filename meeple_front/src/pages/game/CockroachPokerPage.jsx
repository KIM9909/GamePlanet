import React, { useState } from "react";
import { useParams } from "react-router-dom";
import useSocket from "../../hooks/useSocket";
import GameBoard from "../../components/cockroachcard/GameBoard";
import GameSidebar from "../../components/sidebar/GameSidebar";

const CockroachPokerPage = () => {
  const { roomId } = useParams();
  const { connected, sendMessage, startGame } = useSocket(roomId);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [playerCount, setPlayerCount] = useState(4);
  const [gameData, setGameData] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleStartGame = async () => {
    try {
      const response = await startGame();
      if (response && response.data) {
        setGameData(response.data);
      }
    } catch (error) {
      console.error("게임 시작 실패:", error);
    }
  };

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
          />
        </div>

        {/* 인원 선택 버튼 */}
        <div className="flex justify-center gap-2 py-2 bg-gray-800">
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => setPlayerCount(count)}
              className={`px-3 py-1 text-sm rounded 
                ${
                  playerCount === count
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
            >
              {count}인
            </button>
          ))}
        </div>

        {/* 화상 채팅 영역 */}
        <div className="h-48 bg-gray-800 border-t border-gray-700">
          <div className="text-white p-4">화상 채팅 영역 (개발 예정)</div>
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
