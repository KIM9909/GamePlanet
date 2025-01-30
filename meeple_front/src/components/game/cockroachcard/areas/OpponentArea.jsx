import React, { useMemo } from "react";
import Card from "../Card";
import { sortPenaltyGroups } from "../utils/cardUtils";
import PenaltyCardStack from "../PenaltyCardStack";

const OpponentArea = ({
  playerNumber,
  penaltyCards = [],
  handCards = [],
  playerName,
  isMyTurn,
  selectedCard,
  handlePlayerClick,
  isPassing,
  passedPlayers,
  cardSender,
  remainingPlayers,
}) => {
  const groupedPenaltyCards = penaltyCards.reduce((acc, card) => {
    const baseType = card.type.startsWith("King")
      ? card.type.replace("King", "")
      : card.type;
    if (!acc[baseType]) {
      acc[baseType] = { type: card.type, count: 0 };
    }
    acc[baseType].count += card.count;
    return acc;
  }, {});

  const sortedPenaltyGroups = sortPenaltyGroups(groupedPenaltyCards);

  const isSelectable = useMemo(() => {
    if (isPassing) {
      return (
        remainingPlayers.includes(playerName) &&
        !passedPlayers.includes(playerName)
      );
    }
    return isMyTurn && selectedCard !== null && playerName !== cardSender;
  }, [
    isPassing,
    remainingPlayers,
    playerName,
    passedPlayers,
    isMyTurn,
    selectedCard,
    cardSender,
  ]);

  return (
    <div
      className={`w-64 space-y-4 
        ${!isSelectable ? "opacity-50" : ""} 
        ${
          isSelectable
            ? "cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg"
            : "cursor-not-allowed"
        }
      `}
      onClick={() => {
        if (!isSelectable) return;
        handlePlayerClick(playerName);
      }}
    >
      <div className="px-3 py-1.5 bg-gray-800/90 rounded-lg">
        <div className="text-center text-sm font-medium text-white">
          {playerName}
        </div>
      </div>
      <div className="space-y-4">
        <div
          className="h-40 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(107, 114, 128, 0.5) rgba(31, 41, 55, 0.3)",
            msOverflowStyle: "-ms-autohiding-scrollbar",
          }}
        >
          <div className="flex flex-wrap justify-center gap-2 p-2">
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

        <div className="relative h-24">
          {handCards.length > 4 ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="flex">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="relative"
                    style={{
                      marginLeft: i === 0 ? "0" : "-12px",
                    }}
                  >
                    <Card isBack={true} type={null} />
                  </div>
                ))}
              </div>
              <div className="ml-2 px-3 py-1 bg-gray-800/80 text-white text-sm rounded-lg">
                +{handCards.length - 4}
              </div>
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              {handCards.map((_, i) => (
                <Card key={i} isBack={true} type={null} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpponentArea;
