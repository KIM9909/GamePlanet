import React from "react";
import Card from "../Card";

const DeckArea = ({ openCard, isAnimating }) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative">
        {/* 덱 카드들 */}
        {[4, 3, 2, 1, 0].map((index) => (
          <div
            key={index}
            className="absolute"
            style={{
              top: `${-index * 1}px`,
              left: `${-index * 1}px`,
              zIndex: index,
            }}
          >
            <Card isBack={true} />
          </div>
        ))}

        {/* 오픈 카드 (애니메이션 포함) */}
        {openCard && (
          <div
            className={`absolute transition-all duration-300 ${
              isAnimating ? 'opacity-0 translate-y-8' : 'opacity-100'
            }`}
            style={{
              top: "-30px",
              left: "20px",
              zIndex: 10,
              transform: `rotate(5deg)`,
            }}
          >
            <Card
              type={openCard.type}
              isBack={false}
              isRoyal={openCard.royal}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckArea;
