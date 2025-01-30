import React from "react";
import Card from "../Card";

const DeckArea = ({ openCard }) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative">
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

        {openCard && (
          <div
            className="absolute"
            style={{
              top: "-30px",
              left: "20px",
              zIndex: 10,
              transform: "rotate(5deg)",
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
