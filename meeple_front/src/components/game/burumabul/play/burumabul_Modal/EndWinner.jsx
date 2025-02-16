import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../../../layout/SocketLayout";
import { PartyPopper } from "lucide-react";

const Firework = ({ delay }) => (
  <div
    className={`absolute w-4 h-4 animate-ping rounded-full bg-yellow-400 opacity-75`}
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

  useEffect(() => {
    if (socketWinner && socketWinner.playerName) {
      setWinnerName(socketWinner.playerName);
      setShowFireworks(true);
    }
  }, [socketWinner]);

  // Generate multiple fireworks with different positions and delays
  const fireworks = Array.from({ length: 20 }, (_, i) => (
    <Firework key={i} delay={i * 200} />
  ));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white rounded-xl p-8 w-96 text-center transform transition-all duration-500 scale-100 hover:scale-105">
        {showFireworks && (
          <div className="absolute inset-0 overflow-hidden">{fireworks}</div>
        )}

        <div className="relative z-10">
          <div className="mb-6">
            <PartyPopper className="mx-auto h-16 w-16 text-yellow-500 animate-bounce" />
          </div>

          {winnerName && (
            <h1 className="text-4xl font-bold text-purple-600 mb-4 animate-pulse">
              🎉 {winnerName} 🎉
            </h1>
          )}

          <div className="text-2xl font-semibold text-gray-800 mb-4 animate-fade-in">
            승자입니다!
          </div>

          <p className="text-gray-600 mb-8">대기방으로 이동합니다</p>

          <button
            onClick={onClose}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            확인
          </button>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-200 rounded-full animate-ping" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-purple-200 rounded-full animate-ping" />
      </div>
    </div>
  );
};

export default EndWinner;
