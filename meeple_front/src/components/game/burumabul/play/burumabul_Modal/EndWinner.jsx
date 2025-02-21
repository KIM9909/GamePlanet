import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../../../layout/SocketLayout";
import { PartyPopper } from "lucide-react";
import UserAPI from "../../../../../sources/api/UserAPI";

const Firework = ({ delay }) => (
  <div
    className={`absolute w-4 h-4 animate-ping rounded-full bg-cyan-400 opacity-75`}
    style={{
      animationDelay: `${delay}ms`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  />
);

const EndWinner = ({ onClose }) => {
  const { socketWinner } = useContext(SocketContext);
  const [winnerName, setWinnerName] = useState("");
  const [showFireworks, setShowFireworks] = useState(false);
  const { getProfile } = UserAPI;

  useEffect(() => {
    if (socketWinner && socketWinner.playerId) {
      const getNickname = async (playerId) => {
        try {
          const response = await getProfile(playerId);
          setWinnerName(response.userNickname);
        } catch (error) {
          console.error("승자 닉네임 조회 중 오류");
        }
      };
      getNickname(socketWinner.playerId);
      setShowFireworks(true);
    }

    const timer = setTimeout(() => {
      onClose();
    }, 5000);
  }, [socketWinner]);

  // Generate multiple fireworks with different positions and delays
  const fireworks = Array.from({ length: 20 }, (_, i) => (
    <Firework key={i} delay={i * 200} />
  ));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-gray-900 bg-opacity-80 border-2 border-cyan-500 rounded-xl p-8 w-96 text-center transform transition-all duration-500 scale-100 hover:scale-105">
        {showFireworks && (
          <div className="absolute inset-0 overflow-hidden">{fireworks}</div>
        )}

        <div className="relative z-10">
          <div className="mb-6">
            <PartyPopper className="mx-auto h-16 w-16 text-cyan-500 animate-bounce" />
          </div>

          {winnerName && (
            <h1 className="text-4xl font-bold text-cyan-400 mb-4 animate-pulse">
              🎉 {winnerName} 🎉
            </h1>
          )}

          <div className="text-2xl font-semibold text-white mb-4 animate-fade-in">
            승자입니다!
          </div>

          <p className="text-white mb-8">대기방으로 이동합니다</p>

          {/* <button
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            확인
          </button> */}
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-200 rounded-full animate-ping" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-purple-200 rounded-full animate-ping" />
      </div>
    </div>
  );
};

export default EndWinner;
