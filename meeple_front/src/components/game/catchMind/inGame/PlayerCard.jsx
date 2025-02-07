import React from "react";
import VideoChat from "./VideoChat";

const PlayerCard = ({ userNickname, isCurrentTurn, score }) => {
  return (
    <div
      className={`bg-gray-800 rounded-lg overflow-hidden transition-all ${
        isCurrentTurn
          ? "ring-2 ring-blue-400 shadow-lg shadow-blue-500/20"
          : "border border-gray-700"
      }`}
    >
      <div className="w-full pt-[56.25%] relative">
        <div className="absolute inset-0 overflow-hidden">
          <VideoChat nickname={userNickname} />
        </div>
        {isCurrentTurn && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-md z-50">
            출제자
          </div>
        )}
      </div>
      <div className="p-3 bg-gray-700/90 backdrop-blur-md border-t border-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-200">{userNickname}</span>
          <span className="text-sm text-blue-400 font-bold">{score}점</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
