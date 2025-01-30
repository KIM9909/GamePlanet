import React from "react";
import VideoChat from "./VideoChat";

/**
 * 개별 플레이어 카드 컴포넌트
 * 플레이어의 비디오, 닉네임, 점수, 현재 턴 여부를 표시
 */
const PlayerCard = ({ userId, userNickname, isCurrentTurn, score = 0 }) => {
  return (
    <div
      className={`bg-gray-800 rounded-lg overflow-hidden transition-all ${
        isCurrentTurn
          ? "ring-2 ring-blue-400 shadow-lg shadow-blue-500/20"
          : "border border-gray-700"
      }`}
    >
      {/* 비디오 영역 */}
      <div className="relative w-full pt-[56.25%]">
        <div className="absolute inset-0">
          <VideoChat userId={userId} />
          {/* 현재 출제자 표시 */}
          {isCurrentTurn && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-md z-50">
              출제자
            </div>
          )}
        </div>
      </div>
      {/* 플레이어 정보 영역 */}
      <div className="p-3 bg-gray-700/50 backdrop-blur-sm border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-200">{userNickname}</span>
          <span className="text-sm text-blue-400 font-bold">{score}점</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
