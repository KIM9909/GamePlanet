/*
1. 전체 게임 화면 레이아웃 구성
2. WebSocket 연결 관리
3. 게임 상태 관리 (시작, 종료, 라운드 변경 등)
4. Socket.io 이벤트 핸들러
5. 참가자 상태 관리
6. 현재 라운드 표시
7. 제한 시간 타이머
8. 제시어 표시 (출제자에게만)
*/
import React, { useState, useEffect } from "react";
import Canvas from "./Canvas";
import ChatBox from "./ChatBox";
import PlayerCard from "./PlayerCard";
import { Timer, Pencil, Eraser, Trash2, Users } from "lucide-react";
import { UserAPI } from "../../../sources/api/UserAPI";

const GameInfo = ({ round, timer, word }) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg border-b border-gray-700">
      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
        <Users className="w-5 h-5 text-blue-400" />
        <span className="text-lg font-medium text-gray-100">
          Round {round}/10
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Timer className="w-5 h-5 text-blue-400" />
        <span className="text-2xl font-bold text-gray-100">{timer}</span>
      </div>
      <div className="px-4 py-1 bg-blue-500/10 rounded-full border border-blue-400/20">
        <span className="text-lg font-medium text-blue-100">
          제시어: {word}
        </span>
      </div>
    </div>
  );
};

const DrawingTools = () => {
  return (
    <div className="flex items-center justify-center gap-6 py-3 px-6 bg-gray-800 border-t border-gray-700 rounded-b-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-blue-400" />
          <input
            type="color"
            className="w-8 h-8 rounded cursor-pointer bg-gray-700 border border-gray-600"
          />
        </div>
        <select className="px-3 py-1.5 border border-gray-600 rounded-lg bg-gray-700 text-gray-200">
          <option>1px</option>
          <option>2px</option>
          <option>4px</option>
          <option>8px</option>
        </select>
      </div>
      <div className="h-6 w-px bg-gray-600" />
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-1.5 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600">
          <Eraser className="w-4 h-4" />
          지우개
        </button>
        <button className="flex items-center gap-2 px-4 py-1.5 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600">
          <Trash2 className="w-4 h-4" />
          전체 지우기
        </button>
      </div>
    </div>
  );
};

const MainLayout = () => {
  const [currentTurn] = useState(1);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerProfiles = async () => {
      try {
        // 임시로 players ID 배열 (실제로는 게임 서버/웹소켓에서 받아와야 함)
        const playerIds = [9, 10, 11, 12];

        // 각 player의 프로필 정보를 병렬로 불러오기
        const playerProfiles = await Promise.all(
          playerIds.map(async (userId) => {
            const profile = await UserAPI.getProfile(userId);
            return {
              userId: userId,
              score: 0, // 게임 진행 상황에 따라 업데이트 필요
              userNickname: profile.userNickname,
            };
          })
        );

        setPlayers(playerProfiles);
      } catch (error) {
        setError("플레이어 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerProfiles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* 메인 게임 영역 (캔버스) */}
      <div className="flex-1 p-4">
        <div className="h-full flex flex-col bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
          <GameInfo round={1} timer={90} word="사과" />
          <div className="flex-1 p-6">
            <div className="h-full bg-white rounded-xl border border-gray-200">
              <Canvas />
            </div>
          </div>
          <DrawingTools />
        </div>
      </div>

      {/* 우측 - 플레이어 & 채팅 영역 */}
      <div className="w-1/3 flex flex-col gap-4 p-4 border-l border-gray-700">
        {/* 플레이어 영역 */}
        <div className="grid grid-cols-2 gap-3">
          {players.map((player) => (
            <PlayerCard
              key={player.userId}
              userId={player.userId}
              userNickname={player.userNickname}
              isCurrentTurn={player.userId === currentTurn}
              score={player.score}
            />
          ))}
        </div>

        {/* 채팅 영역 */}
        <div className="flex-1 bg-white rounded-lg border border-gray-700 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="px-4 py-2 bg-gray-700 border-b border-gray-200">
              <h2 className="font-medium text-white">채팅</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ChatBox />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
