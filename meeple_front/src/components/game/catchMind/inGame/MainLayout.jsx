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

/**
 * 캐치마인드 게임의 메인 레이아웃 컴포넌트
 * 게임 화면, 플레이어 비디오, 채팅 등을 포함한 전체 UI 구성
 */
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Canvas from "./Canvas";
import ChatBox from "./ChatBox";
import PlayerCard from "./PlayerCard";
import { Timer, Pencil, Eraser, Trash2, Users, Lock } from "lucide-react";
import { updatePlayerNickname } from "../../../../sources/store/slices/CatchMindSlice";
import { fetchProfile } from "../../../../sources/store/slices/ProfileSlice";
import { useParams } from "react-router-dom";
import { useState } from "react";
import API from "../../../../sources/api/CatchMindAPI";

/**
 * 게임 정보를 표시하는 컴포넌트
 * 현재 라운드, 남은 시간, 제시어 정보를 표시
 */
const GameInfo = ({ round, timer, word, roomInfo }) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg border-b border-gray-700">
      {/* 방 제목 추가 */}
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">{roomInfo?.roomTitle}</h2>
        {roomInfo?.isPrivate && <Lock className="w-4 h-4 text-gray-400" />}
      </div>

      {/* 게임 정보 */}
      <div className="flex items-center gap-6">
        {/* 라운드 정보 */}
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
          <Users className="w-5 h-5 text-blue-400" />
          <span className="text-lg font-medium text-gray-100">
            Round {round}/{roomInfo?.quizCount || 10}
          </span>
        </div>

        {/* 타이머 */}
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-400" />
          <span className="text-2xl font-bold text-gray-100">
            {timer || roomInfo?.timeLimit}초
          </span>
        </div>

        {/* 제시어 표시 */}
        {word && (
          <div className="px-4 py-1 bg-blue-500/10 rounded-full border border-blue-400/20">
            <span className="text-lg font-medium text-blue-100">
              제시어: {word}
            </span>
          </div>
        )}
      </div>

      {/* 현재 참가자 수 표시 */}
      <div className="flex items-center gap-2 text-gray-300">
        <Users className="w-4 h-4" />
        <span>
          {roomInfo?.players?.length || 0}/{roomInfo?.maxPeople}
        </span>
      </div>
    </div>
  );
};

/**
 * 그리기 도구 컴포넌트
 * 색상 선택, 선 굵기 조절, 지우개, 전체 지우기 기능 제공
 */
const DrawingTools = () => {
  return (
    <div className="flex items-center justify-center gap-6 py-3 px-6 bg-gray-800 border-t border-gray-700 rounded-b-lg">
      {/* 펜 도구 (색상 선택 & 선 굵기) */}
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
      {/* 지우기 도구 */}
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

/**
 * 캐치마인드 게임의 메인 레이아웃 컴포넌트
 * 게임 화면, 플레이어 비디오, 채팅 등을 포함한 전체 UI 구성
 */
const MainLayout = () => {
  const dispatch = useDispatch();

  // Redux 상태 가져오기
  const gameState = useSelector((state) => state.catchmind);
  const userId = useSelector((state) => state.user.userId);
  const profileData = useSelector((state) => state.profile.profileData);
  const currentPlayer = gameState.players.find((p) => p.isTurn);

  const { roomId } = useParams();
  const [roomInfo, setRoomInfo] = useState(null);

  // 방 정보 가져오기
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const response = await API.get(`/api/catch-mind/rooms/${roomId}`);
        console.log("방 정보 response:", response); // 데이터 확인
        setRoomInfo(response);
      } catch (error) {
        console.error("방 정보 가져오기 실패:", error);
      }
    };

    if (roomId) {
      fetchRoomInfo();
    }
  }, [roomId]);

  // 프로필 정보 가져오기
  useEffect(() => {
    if (userId) {
      dispatch(fetchProfile(userId));
    }
  }, [userId, dispatch]);

  // 프로필 정보로 플레이어 닉네임 업데이트
  useEffect(() => {
    if (profileData?.userNickname) {
      dispatch(
        updatePlayerNickname({
          playerId: 1, // 첫 번째 플레이어를 현재 유저로 설정
          nickname: profileData.userNickname,
        })
      );
    }
  }, [profileData, dispatch]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-1 p-4">
        <div className="h-full flex flex-col bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
          <GameInfo
            round={gameState.currentRound}
            timer={gameState.timeLimit}
            word={
              currentPlayer?.nickname === gameState.players[0].nickname
                ? gameState.currentWord
                : "???"
            }
            roomInfo={roomInfo}
          />
          {/* 캔버스 영역 */}
          <div className="flex-1 p-6">
            <div className="h-full bg-white rounded-xl border border-gray-200">
              <Canvas />
            </div>
          </div>
          <DrawingTools />
        </div>
      </div>

      {/* 오른쪽 - 플레이어 & 채팅 영역 */}
      <div className="w-1/3 flex flex-col gap-4 p-4 border-l border-gray-700">
        {/* 플레이어 카드 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          {gameState.players.map((player) => (
            <PlayerCard
              key={player.id}
              userId={player.id}
              userNickname={player.nickname || `Player ${player.id}`}
              isCurrentTurn={player.isTurn}
              score={player.score}
            />
          ))}
        </div>

        {/* 채팅 영역 */}
        <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <ChatBox
            roomId={gameState.roomId}
            currentUser={
              gameState.players[0].nickname ||
              profileData?.userNickname ||
              "Player 1"
            }
            correctAnswer={gameState.currentWord}
          />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
