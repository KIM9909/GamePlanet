// OpponentArea.jsx
import React, { forwardRef, useMemo } from "react";
import Card from "../Card";
import { sortPenaltyGroups } from "../utils/cardUtils";
import PenaltyCardStack from "./PenaltyCardArea";

const OpponentArea = forwardRef(
  (
    {
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
      currentUser,
    },
    ref
  ) => {
    const groupedPenaltyCards = penaltyCards.reduce((acc, card) => {
      const baseType = card.type.replace("King", "");
      if (!acc[baseType]) {
        acc[baseType] = {
          type: card.type,
          count: 0,
          royal: card.royal,
        };
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
      return isMyTurn && selectedCard && playerName !== currentUser;
    }, [
      isPassing,
      remainingPlayers,
      playerName,
      passedPlayers,
      isMyTurn,
      selectedCard,
      currentUser,
    ]);

    return (
      <div
        ref={ref}
        className={`w-64 space-y-4 
        ${!isSelectable ? "opacity-50" : ""} 
        ${
          isSelectable
            ? "cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg"
            : "cursor-not-allowed"
        }
      `}
        data-player={playerName}
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
          <div className="h-40 overflow-y-auto">
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
  }
);

OpponentArea.displayName = "OpponentArea";

export default OpponentArea;
