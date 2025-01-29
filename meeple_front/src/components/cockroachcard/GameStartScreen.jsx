import React from "react";
import BatCard from "../../assets/image/cockroachpoker/BatCard.svg";
import CockroachCard from "../../assets/image/cockroachpoker/CockroachCard.svg";
import RatCard from "../../assets/image/cockroachpoker/RatCard.svg";
import ScorpionCard from "../../assets/image/cockroachpoker/ScorpionCard.svg";
import ToadCard from "../../assets/image/cockroachpoker/ToadCard.svg";
import CockroachPokerLogo from "../../assets/image/cockroachpoker/cockroachpoker.svg";

const GameStartScreen = ({
  playerCount,
  onStart,
  roomTitle = "바퀴벌레 포커",
}) => {
  console.log("GameStartScreen roomTitle:", roomTitle); // 전달받은 값 확인
  return (
    <div className="relative w-full h-[800px] max-w-[1600px] mx-auto bg-gray-800/95 rounded-3xl flex items-center justify-center overflow-hidden">
      {/* 메인 로고 배경 */}
      <div className="absolute inset-0 opacity-30">
        <img
          src={CockroachPokerLogo}
          className="w-full h-full object-cover animate-rotate-slow"
          alt="Cockroach Poker Logo"
        />
      </div>

      {/* 움직이는 카드 배경 */}
      <div className="absolute inset-0 opacity-5">
        <div className="animate-float-slow">
          <img
            src={CockroachCard}
            className="absolute top-10 left-20 w-32 h-32 transform -rotate-12"
            alt="Cockroach"
          />
          <img
            src={BatCard}
            className="absolute top-20 right-32 w-40 h-40 transform rotate-12"
            alt="Bat"
          />
        </div>
        <div className="animate-float-medium">
          <img
            src={RatCard}
            className="absolute bottom-20 left-40 w-36 h-36 transform rotate-45"
            alt="Rat"
          />
          <img
            src={ScorpionCard}
            className="absolute top-40 right-20 w-32 h-32 transform -rotate-45"
            alt="Scorpion"
          />
        </div>
        <div className="animate-float-fast">
          <img
            src={ToadCard}
            className="absolute bottom-32 right-40 w-32 h-32 transform rotate-180"
            alt="Toad"
          />
          <img
            src={CockroachCard}
            className="absolute top-1/2 left-1/3 w-32 h-32 transform rotate-90"
            alt="Cockroach"
          />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div
        className="relative z-10 text-center space-y-8 p-12 bg-gray-800/80 rounded-2xl backdrop-blur-lg 
          border border-gray-700/50 shadow-2xl animate-fade-in
          hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] transition-shadow duration-300"
      >
        <div className="space-y-4">
          <h2
            className="text-5xl font-bold text-white mb-2 animate-glow
              bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text"
          >
            {roomTitle}
          </h2>
          <div className="flex justify-center gap-4 mb-6">
            <img
              src={CockroachCard}
              className="w-16 h-16 transform hover:scale-110 transition-all duration-300 
                  animate-slide-in hover:rotate-12 hover:shadow-lg"
              style={{ animationDelay: "0.1s" }}
              alt="Cockroach"
            />
            <img
              src={BatCard}
              className="w-16 h-16 transform hover:scale-110 transition-transform"
              alt="Bat"
            />
            <img
              src={RatCard}
              className="w-16 h-16 transform hover:scale-110 transition-transform"
              alt="Rat"
            />
          </div>
          <p className="text-2xl text-yellow-400 font-semibold animate-pulse">
            {playerCount}명이 입장하셨습니다
          </p>
          <div className="space-y-2 text-gray-300">
            <p className="text-lg hover:text-blue-300 transition-colors duration-300">
              거짓말과 심리전으로 가득한
            </p>
            <p className="text-lg hover:text-blue-300 transition-colors duration-300">
              카드게임에 오신 것을 환영합니다!
            </p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 
              text-white text-xl rounded-xl animate-shimmer bg-[length:200%_100%]
              hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]
              transition-all duration-300 transform hover:scale-105"
        >
          <span>게임 시작</span>
        </button>
      </div>
    </div>
  );
};

export default GameStartScreen;
