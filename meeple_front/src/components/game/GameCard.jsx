import { useState } from "react";

// 게임 목록에 표시할 게임카드 컴포넌트

function GameCard({ imgUrl }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative w-72 h-72 rounded-lg shadow-lg overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 배경 이미지 */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${
          isHovered ? "opacity-50" : "opacity-100"
        }`}
        style={{ backgroundImage: `url(${imgUrl})` }}
      ></div>

      {/* 버튼 영역 */}
      {isHovered && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 ">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
            INFO
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
            PLAY
          </button>
        </div>
      )}
    </div>
  );
}

export default GameCard;
