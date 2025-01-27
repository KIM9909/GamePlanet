import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import GiveCardModal from "./GiveCardModal";
import GuessCardModal from "./GuessCardModal";
import PenaltyCardSelectModal from "./PenaltyCardSelectModal";
import ActiveCardArea from "./ActiveCardArea";
import Card from "./Card";

const ANIMAL_ORDER = [
  "Bat",
  "Rat",
  "Fly",
  "Cockroach",
  "Scorpion",
  "Toad",
  "Stinkbug",
  "Joker",
  "Black",
];

const sortCards = (cards) => {
  return [...cards].sort((a, b) => {
    const typeA = a.type.replace("King", "");
    const typeB = b.type.replace("King", "");

    if (typeA === typeB) {
      return a.type.includes("King") ? 1 : -1;
    }

    return ANIMAL_ORDER.indexOf(typeA) - ANIMAL_ORDER.indexOf(typeB);
  });
};

const sortPenaltyGroups = (groups) => {
  return Object.values(groups).sort((a, b) => {
    const typeA = a.type.replace("King", "");
    const typeB = b.type.replace("King", "");
    return ANIMAL_ORDER.indexOf(typeA) - ANIMAL_ORDER.indexOf(typeB);
  });
};

const getKoreanName = (type) => {
  const nameMap = {
    Bat: "박쥐",
    Rat: "쥐",
    Fly: "파리",
    Cockroach: "바퀴벌레",
    Scorpion: "전갈",
    Toad: "두꺼비",
    Stinkbug: "노린재",
    Joker: "조커",
    Black: "블랙",
  };

  if (type.startsWith("King")) {
    const baseName = type.replace("King", "");
    return `${nameMap[baseName]}:킹`;
  }

  return nameMap[type] || type;
};

const PenaltyCardStack = ({ type, count = 3, isRoyal }) => {
  const baseType = type.startsWith("King") ? type.replace("King", "") : type;

  return (
    <div className="relative w-16 h-24 flex-shrink-0">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="absolute border-2 border-gray-300 rounded-lg"
          style={{
            top: `${index * 8}px`,
            left: `${index * 4}px`,
            zIndex: index,
            width: "100%",
            height: "100%",
          }}
        >
          <Card type={type} isRoyal={isRoyal} />
        </div>
      ))}
    </div>
  );
};

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

  // 선택 가능 여부 판단 로직 수정
  const isSelectable = useMemo(() => {
    return (
      isPassing &&
      remainingPlayers.includes(playerName) &&
      !passedPlayers.includes(playerName)
    );
  }, [isPassing, remainingPlayers, playerName, passedPlayers]);

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

const MyArea = ({
  penaltyCards = [],
  handCards = [],
  isMyTurn,
  selectedCard,
  handleCardClick,
}) => {
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
    <div className="absolute bottom-4 left-0 right-0 px-8">
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
          <Card
            key={i}
            type={card.type}
            isRoyal={card.royal}
            onClick={isMyTurn ? handleCardClick : undefined}
            selectedCard={selectedCard}
          />
        ))}
      </div>
    </div>
  );
};

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

const GameBoard = ({
  playerCount = 4,
  onStartGame,
  gameData,
  currentUser,
  sendMessage,
}) => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [showGiveCardModal, setShowGiveCardModal] = useState(false);
  const [showGuessModal, setShowGuessModal] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  const [showPenaltyCardModal, setShowPenaltyCardModal] = useState(false);
  const [currentLoser, setCurrentLoser] = useState(null);
  const [penaltyCardCount, setPenaltyCardCount] = useState(0);
  const [passedPlayers, setPassedPlayers] = useState([]);
  const [passCount, setPassCount] = useState(0);

  // 남은 플레이어 계산
  const remainingPlayers = useMemo(() => {
    if (!gameData?.players || !gameData?.gameData?.gameState) return [];

    const { cardSender, passedPlayers = [] } = gameData.gameData.gameState;

    return gameData.players.filter(
      (player) => player !== cardSender && !passedPlayers.includes(player)
    );
  }, [gameData]);

  useEffect(() => {
    if (gameData?.gameData?.gameState?.currentTurn) {
      setIsMyTurn(gameData.gameData.gameState.currentTurn === currentUser);
    }
  }, [gameData, currentUser]);

  const handleStartGame = () => {
    setIsGameStarted(true);
    if (onStartGame) {
      onStartGame();
    }
  };

  const handleCardClick = (card) => {
    if (!isMyTurn) return;
    setSelectedCard(card);
  };

  const handlePlayerClick = (playerNickname) => {
    if (!isPassing && (!isMyTurn || !selectedCard)) return;
    if (playerNickname === currentUser) return;

    setSelectedPlayer(playerNickname);
    setShowGiveCardModal(true);
  };

  const handleGiveCard = (claimData) => {
    const giveCardData = {
      to: selectedPlayer,
      from: currentUser,
      card: selectedCard,
      animal: claimData.animal,
      isKing: claimData.isKing,
      isNagative: claimData.isNegative,
    };

    console.log("카드 전달 데이터:", giveCardData);

    setSelectedCard(null);
    setSelectedPlayer(null);
    setShowGiveCardModal(false);
    setIsPassing(false);
  };

  const handleModalClose = () => {
    setShowGiveCardModal(false);
    setSelectedPlayer(null);
  };
  const handlePass = () => {
    const players = gameData.players;
    const currentCard = gameData.gameData.gameState;

    const newPassedPlayers = [
      ...(gameData.gameData.gameState.passedPlayers || []),
      currentUser,
    ];

    if (remainingPlayers.length === 0) {
      console.log("마지막 플레이어는 무조건 맞춰야 합니다!");
      setShowGuessModal(true);
      return;
    }

    setIsPassing(true);
    setSelectedCard({
      type: currentCard.currentCard.type,
      isRoyal: currentCard.currentCard.royal,
    });
    setPassedPlayers(newPassedPlayers);
    setPassCount((prev) => prev + 1);
    setIsMyTurn(false);

    console.log("PASS 후 상태:", {
      isPassing: true,
      selectedCard: currentCard.currentCard,
      passedPlayers: newPassedPlayers,
      remainingPlayers,
    });
  };

  const handleGuess = async (guess) => {
    const currentCard = gameData.gameData.gameState.currentCard;
    const loser = determineLoser(guess);
    const claimedAnimal = gameData.gameData.gameState.claimedAnimal;

    console.log("추측 데이터:", {
      guess,
      currentCard,
      loser,
      claimedAnimal,
      isKing: gameData.gameData.gameState.isKing,
    });

    if (currentCard.type === "Black" || currentCard.type === "Joker") {
      const loserHand = playerCards[loser] || [];
      const validLoserHand = loserHand.filter((card) => card && card.type);
      const hasClaimedCard = validLoserHand.some(
        (card) => card.type === claimedAnimal
      );

      setCurrentLoser(loser);
      setShowPenaltyCardModal(true);
      setPenaltyCardCount(hasClaimedCard ? 1 : 2);
    } else {
      await sendPenaltyCard(loser, currentCard);
    }

    setShowGuessModal(false);
  };

  const handlePenaltyCardSelect = useCallback(
    async (selectedCards) => {
      console.log("패널티 카드 선택:", {
        user: currentLoser,
        selectedCards,
        isBlack: gameData.gameData.gameState.currentCard.type === "Black",
      });

      await sendMessage({
        type: "MULTI_CARD",
        data: {
          user: currentLoser,
          cards: selectedCards,
          isBlack: gameData.gameData.gameState.currentCard.type === "Black",
        },
      });
      setShowPenaltyCardModal(false);
    },
    [currentLoser, gameData, sendMessage]
  );

  const determineLoser = (guess) => {
    const { cardSender, cardReceiver, currentCard, claimedAnimal, isKing } =
      gameData.gameData.gameState;

    if (currentCard.type === "Black") {
      return guess === "Black" ? cardSender : cardReceiver;
    }

    const isCorrectClaim =
      currentCard.type === claimedAnimal && currentCard.royal === isKing;
    if (
      (isCorrectClaim && guess === "FALSE") ||
      (!isCorrectClaim && guess === "TRUE")
    ) {
      return cardReceiver;
    } else {
      return cardSender;
    }
  };

  const sendPenaltyCard = async (loser, currentCard) => {
    try {
      console.log("일반 패널티 카드 처리:", {
        loser,
        cardType: currentCard.type,
        isRoyal: currentCard.royal,
      });

      await sendMessage({
        type: "SINGLE_CARD_PENALTY",
        data: {
          loser,
          cardType: currentCard.type,
          isRoyal: currentCard.royal,
        },
      });

      if (currentCard.royal && gameData.gameData.publicDeck.length > 0) {
        const openCard =
          gameData.gameData.publicDeck[gameData.gameData.publicDeck.length - 1];
        console.log("왕 카드 추가 패널티:", {
          loser,
          openCard,
        });
        await sendMessage({
          type: "SINGLE_CARD_PENALTY",
          data: {
            loser,
            cardType: openCard.type,
            isRoyal: openCard.royal,
          },
        });
      }
    } catch (error) {
      console.error("패널티 카드 처리 실패:", error);
    }
  };

  // 새로운 카드가 전달될 때마다 PASS 관련 상태 초기화
  useEffect(() => {
    if (gameData?.gameData?.gameState?.currentCard) {
      setPassedPlayers(new Set());
      setPassCount(0); // PASS 카운트 초기화
    }
  }, [gameData?.gameData?.gameState?.currentCard]);

  if (!isGameStarted) {
    return (
      <div className="relative w-full h-[800px] max-w-[1600px] mx-auto bg-gray-700/10 rounded-3xl flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-white">바퀴벌레 포커</h2>
          <p className="text-gray-200">현재 {playerCount}인 게임</p>
          <button
            onClick={handleStartGame}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            게임 시작
          </button>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="relative w-full h-[800px] max-w-[1600px] mx-auto bg-gray-700/10 rounded-3xl flex items-center justify-center">
        <div className="text-xl text-gray-200">게임 데이터 로딩 중...</div>
      </div>
    );
  }

  const {
    players = [],
    gameData: { playerCards = {}, publicDeck = [], userTableCards = {} } = {},
  } = gameData || {};

  return (
    <div className="p-4">
      <div className="relative w-full h-[800px] max-w-[1600px] mx-auto bg-gray-700/10 rounded-3xl">
        {playerCount === 2 ? (
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <OpponentArea
              playerNumber={2}
              penaltyCards={userTableCards[players[1]] || []}
              handCards={playerCards[players[1]] || []}
              playerName={players[1]}
              isMyTurn={isMyTurn || isPassing}
              selectedCard={selectedCard}
              handlePlayerClick={handlePlayerClick}
              isPassing={isPassing}
              passedPlayers={gameData?.gameData?.gameState?.passedPlayers || []}
              cardSender={gameData?.gameData?.gameState?.cardSender}
              remainingPlayers={remainingPlayers}
            />
          </div>
        ) : (
          <div className="absolute top-4 left-4 right-4">
            {playerCount === 3 ? (
              <div className="flex justify-between">
                <div className="w-[calc(40%-1rem)]">
                  <OpponentArea
                    playerNumber={2}
                    penaltyCards={userTableCards[players[1]] || []}
                    handCards={playerCards[players[1]] || []}
                    playerName={players[1]}
                    isMyTurn={isMyTurn || isPassing}
                    selectedCard={selectedCard}
                    handlePlayerClick={handlePlayerClick}
                    isPassing={isPassing}
                    passedPlayers={
                      gameData?.gameData?.gameState?.passedPlayers || []
                    }
                    cardSender={gameData?.gameData?.gameState?.cardSender}
                    remainingPlayers={remainingPlayers}
                  />
                </div>
                <div className="w-[calc(40%-1rem)]">
                  <OpponentArea
                    playerNumber={3}
                    penaltyCards={userTableCards[players[2]] || []}
                    handCards={playerCards[players[2]] || []}
                    playerName={players[2]}
                    isMyTurn={isMyTurn || isPassing}
                    selectedCard={selectedCard}
                    handlePlayerClick={handlePlayerClick}
                    isPassing={isPassing}
                    passedPlayers={
                      gameData?.gameData?.gameState?.passedPlayers || []
                    }
                    cardSender={gameData?.gameData?.gameState?.cardSender}
                    remainingPlayers={remainingPlayers}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-between">
                <div className="w-[calc(33%-1rem)]">
                  <OpponentArea
                    playerNumber={2}
                    penaltyCards={userTableCards[players[1]] || []}
                    handCards={playerCards[players[1]] || []}
                    playerName={players[1]}
                    isMyTurn={false}
                    selectedCard={selectedCard}
                    handlePlayerClick={handlePlayerClick}
                    isPassing={isPassing}
                    passedPlayers={passedPlayers}
                    cardSender={gameData?.gameData?.gameState?.cardSender}
                    remainingPlayers={remainingPlayers}
                  />
                </div>
                <div className="w-[calc(33%-1rem)]">
                  <OpponentArea
                    playerNumber={3}
                    penaltyCards={userTableCards[players[2]] || []}
                    handCards={playerCards[players[2]] || []}
                    playerName={players[2]}
                    isMyTurn={false}
                    selectedCard={selectedCard}
                    handlePlayerClick={handlePlayerClick}
                    isPassing={isPassing}
                    passedPlayers={passedPlayers}
                    cardSender={gameData?.gameData?.gameState?.cardSender}
                    remainingPlayers={remainingPlayers}
                  />
                </div>
                <div className="w-[calc(33%-1rem)]">
                  <OpponentArea
                    playerNumber={4}
                    penaltyCards={userTableCards[players[3]] || []}
                    handCards={playerCards[players[3]] || []}
                    playerName={players[3]}
                    isMyTurn={false}
                    selectedCard={selectedCard}
                    handlePlayerClick={handlePlayerClick}
                    isPassing={isPassing}
                    passedPlayers={passedPlayers}
                    cardSender={gameData?.gameData?.gameState?.cardSender}
                    remainingPlayers={remainingPlayers}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DeckArea openCard={publicDeck[publicDeck.length - 1]} />

        <MyArea
          penaltyCards={userTableCards[players[0]] || []}
          handCards={playerCards[players[0]] || []}
          isMyTurn={isMyTurn && !isPassing}
          selectedCard={selectedCard}
          handleCardClick={handleCardClick}
        />

        <ActiveCardArea
          currentCard={gameData?.gameData?.gameState?.currentCard}
          cardSender={gameData?.gameData?.gameState?.cardSender}
          cardReceiver={gameData?.gameData?.gameState?.cardReceiver}
          currentUser={currentUser}
          handlePass={handlePass}
          setShowGuessModal={setShowGuessModal}
          gameData={gameData}
          isPassing={isPassing}
        />
      </div>

      <GiveCardModal
        isOpen={showGiveCardModal}
        onClose={handleModalClose}
        selectedCard={selectedCard}
        selectedPlayer={selectedPlayer}
        onSubmit={handleGiveCard}
        isPassing={isPassing}
      />

      {showGuessModal && gameData?.gameData?.gameState && (
        <GuessCardModal
          isOpen={showGuessModal}
          onClose={() => setShowGuessModal(false)}
          onSubmit={handleGuess}
          currentCard={gameData.gameData.gameState.currentCard}
          claimedAnimal={gameData.gameData.gameState.claimedAnimal}
          isKing={gameData.gameData.gameState.isKing}
          from={gameData.gameData.gameState.cardSender}
          to={gameData.gameData.gameState.cardReceiver}
          isNegative={gameData.gameData.gameState.isNegative}
        />
      )}

      {showPenaltyCardModal && currentLoser === currentUser && (
        <PenaltyCardSelectModal
          isOpen={showPenaltyCardModal}
          onClose={() => setShowPenaltyCardModal(false)}
          handCards={playerCards[currentLoser] || []}
          onSubmit={handlePenaltyCardSelect}
          count={penaltyCardCount}
          claimedAnimal={gameData.gameData.gameState.claimedAnimal}
        />
      )}
    </div>
  );
};

export default GameBoard;
