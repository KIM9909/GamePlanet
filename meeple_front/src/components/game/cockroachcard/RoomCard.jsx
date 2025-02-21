// RoomCard.jsx
import React from "react";
import { Lock, Users } from "lucide-react";
import CockroachImg from "../../../assets/images/games/MainImage/Cockroach_Poker_Royal.png";

const RoomCard = ({ room, onEnterRoom }) => {
  return (
    <div className="bg-blue-900 bg-opacity-40 rounded-lg shadow-lg overflow-hidden 
                  group relative border border-blue-800 hover:border-blue-600 
                  transition-all duration-300">
      <div className="bg-blue-950 h-32 flex items-center justify-center">
        <img
          src={CockroachImg}
          alt="바퀴벌레 포커 이미지"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-xl text-white">
            {room.roomTitle}
          </h3>
          {room.isPrivate && (
            <Lock size={18} className="text-blue-400" />
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-blue-300">
            <Users size={16} />
            <span>
              {room.players.length}/{room.maxPeople}
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              room.isGameStart
                ? "bg-red-900/50 text-red-300 border border-red-800"
                : "bg-green-900/50 text-green-300 border border-green-800"
            }`}
          >
            {room.isGameStart ? "게임 중" : "대기 중"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-300">
            방장: {room.creator}
          </span>
          {room.players.length < room.maxPeople ? (
            <button
              onClick={() => onEnterRoom(room)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-all duration-300 transform hover:scale-105"
            >
              입장하기
            </button>
          ) : (
            <button className="px-4 py-2 bg-gray-500/60 text-white rounded-lg 
                           transition-all duration-300 transform cursor-not-allowed">
              입장하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;