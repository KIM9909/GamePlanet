import React, { forwardRef } from "react";
import Card from "../Card";
import { sortCards, sortPenaltyGroups } from "../utils/cardUtils";
import PenaltyCardStack from "../PenaltyCardStack";

const MyArea = forwardRef(({
  penaltyCards = [],
  handCards = [],
  isMyTurn,
  selectedCard,
  handleCardClick,
  currentUser,
}, ref) => {
  const groupedPenaltyCards = penaltyCards.reduce((acc, card) => {
    const baseType = card.type.replace("King", "");
    if (!acc[baseType]) {
      acc[baseType] = {
        type: card.type,
        count: 0,
        royal: card.type.includes("King"),
      };
    }
    acc[baseType].count += card.count;
    return acc;
  }, {});

  const sortedPenaltyGroups = sortPenaltyGroups(groupedPenaltyCards);

  return (
    <div
      ref={ref}
      className="absolute bottom-4 left-0 right-0 px-8"
      data-player={currentUser}
    >
      <div className="mb-6">
        <div className="flex justify-center gap-4 flex-wrap">
          {sortedPenaltyGroups.map((stack, i) => (
            <PenaltyCardStack
              key={i}
              type={stack.type}
              count={stack.count}
              isRoyal={stack.royal}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4 flex-wrap">
        {sortCards(handCards).map((card, i) => (
          <div
            key={i}
            className="transition-all duration-300 ease-in-out"
            style={{
              opacity: selectedCard?.type === card.type ? 0 : 1,
              transform: selectedCard?.type === card.type ? "scale(0.9)" : "scale(1)",
            }}
          >
            <Card
              type={card.type}
              isRoyal={card.royal}
              onClick={(card, e) => handleCardClick(card, e)}
              selectedCard={selectedCard}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

MyArea.displayName = 'MyArea';

export default MyArea;