import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import GiveCardModal from "./modal/GiveCardModal";
import GuessCardModal from "./modal/GuessCardModal";
import PenaltyCardSelectModal from "./modal/PenaltyCardSelectModal";
import ActiveCardArea from "./areas/ActiveCardArea";
import Card from "./Card";
import GameStartScreen from "./GameStartScreen";
import UpdateRoomModal from "./modal/UpdateRoomModal";
import GameEndModal from "./modal/GameEndModal";
import MyArea from "./areas/MyArea";
import DeckArea from "./areas/DeckArea";
import OpponentArea from "./areas/OpponentArea";

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

const GameBoard = ({
  playerCount = 4,
  onStartGame,
  gameData,
  setGameData,
  currentUser,
  sendMessage,
  stompClient,
  roomId,
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
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [gameEndInfo, setGameEndInfo] = useState({ loser: "", reason: "" });

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
      const isCurrentTurn =
        gameData.gameData.gameState.currentTurn === currentUser;
      setIsMyTurn(isCurrentTurn);

      // 내 턴인데 패가 비어있으면 게임 종료
      if (isCurrentTurn) {
        const myHand = gameData?.gameData?.playerCards[currentUser] || [];
        if (myHand.length === 0) {
          sendMessage({
            type: "HAND_CHECK",
            data: {
              player: currentUser,
            },
          });
        }
      }
    }
  }, [gameData, currentUser, sendMessage]);

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

  const handleGameEnd = useCallback(
    async (gameFinishResult) => {
      console.log("게임 종료:", gameFinishResult);

      await sendMessage({
        type: "GAME_END",
        data: {
          loser: gameFinishResult.loser,
          reason: gameFinishResult.reason,
        },
      });
    },
    [sendMessage]
  );

  const checkGameFinish = useCallback(
    (userName, tableCards) => {
      // 1. 같은 카드 4장 체크
      const cardCount = {};
      tableCards.forEach((card) => {
        const type = card.type;
        cardCount[type] = (cardCount[type] || 0) + card.count;

        if (cardCount[type] >= 4) {
          const result = {
            isFinished: true,
            reason: `${getKoreanName(type)} 카드 4장 모음`,
            loser: userName,
          };
          handleGameEnd(result);
          return result;
        }
      });

      // 2. 모든 종류 카드 1장씩 체크
      const REQUIRED_TYPES = [
        "Bat",
        "Rat",
        "Fly",
        "Cockroach",
        "Scorpion",
        "Toad",
        "Stinkbug",
      ];
      const playerCardTypes = new Set(
        tableCards.map((card) => card.type.replace("King", ""))
      );

      const hasAllTypes = REQUIRED_TYPES.every((type) =>
        playerCardTypes.has(type)
      );
      if (hasAllTypes) {
        const result = {
          isFinished: true,
          reason: "모든 종류의 카드를 1장씩 모음",
          loser: userName,
        };
        handleGameEnd(result);
        return result;
      }

      return { isFinished: false };
    },
    [handleGameEnd]
  );

  const handleGuess = async (guess) => {
    const currentCard = gameData.gameData.gameState.currentCard;
    const loser = determineLoser(guess);
    const claimedAnimal = gameData.gameData.gameState.claimedAnimal;
    const loserTableCards = gameData.gameData.userTableCards[loser] || [];

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
      // 패널티 카드를 낼 수 없는 경우만 체크
      const myHand = gameData?.gameData?.playerCards[currentUser] || [];
      const requiredCards = penaltyCardCount;

      if (myHand.length < requiredCards) {
        await sendMessage({
          type: "HAND_CHECK",
          data: {
            player: currentUser,
          },
        });
        return;
      }

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
    [currentLoser, gameData, sendMessage, currentUser, penaltyCardCount]
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
      await sendMessage({
        type: "SINGLE_CARD_PENALTY",
        data: {
          loser,
          cardType: currentCard.type,
          isRoyal: currentCard.royal,
        },
      });

      // 게임 종료 체크
      const loserTableCards = gameData.gameData.userTableCards[loser] || [];
      const gameFinishResult = checkGameFinish(loser, loserTableCards);
      if (gameFinishResult.isFinished) {
        console.log("게임 종료:", gameFinishResult);
        return;
      }

      // 킹 카드일 경우 추가 패널티
      if (currentCard.royal && gameData.gameData.publicDeck.length > 0) {
        const openCard =
          gameData.gameData.publicDeck[gameData.gameData.publicDeck.length - 1];
        console.log("왕 카드 추가 패널티:", { loser, openCard });

        await sendMessage({
          type: "SINGLE_CARD_PENALTY",
          data: {
            loser,
            cardType: openCard.type,
            isRoyal: openCard.royal,
          },
        });

        // 추가 패널티 후 다시 게임 종료 체크
        const updatedTableCards = gameData.gameData.userTableCards[loser] || [];
        const finalGameFinishResult = checkGameFinish(loser, updatedTableCards);
        if (finalGameFinishResult.isFinished) {
          console.log("게임 종료 (추가 패널티 후):", finalGameFinishResult);
          return;
        }
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

  // WebSocket 메시지 처리
  useEffect(() => {
    if (!stompClient) return;

    const subscription = stompClient.subscribe(
      `/topic/game/${roomId}`,
      (message) => {
        const data = JSON.parse(message.body);

        // 게임 종료 메시지 처리
        if (data.type === "HAND_CHECK" && data.isEnd) {
          let reason;
          // 현재 게임 상태에 따라 reason 설정
          if (
            gameData?.gameData?.gameState?.currentCard?.type === "Black" ||
            gameData?.gameData?.gameState?.currentCard?.type === "Joker"
          ) {
            reason = "패널티 카드를 낼 수 없음";
          } else {
            reason = "낼 카드가 없음";
          }

          setGameEndInfo({
            loser: data.loser,
            reason: reason,
          });
          setShowGameEndModal(true);
        } else {
          // 모든 게임 데이터 업데이트
          setGameData(data);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [stompClient, roomId, setGameData, gameData]);

  const handleUpdateRoom = (updateData) => {
    sendMessage({
      type: "UPDATE_ROOM",
      data: updateData,
    });
  };

  if (!isGameStarted) {
    return (
      <>
        <GameStartScreen
          playerCount={playerCount}
          onStart={handleStartGame}
          roomTitle={
            gameData?.roomName || gameData?.roomTitle || "바퀴벌레 포커"
          }
          maxPeople={gameData?.maxPeople || 4}
        />
        {currentUser === gameData?.creator && (
          <button
            onClick={() => setUpdateModalOpen(true)}
            className="absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            방 설정
          </button>
        )}
        <UpdateRoomModal
          isOpen={isUpdateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          onUpdateRoom={handleUpdateRoom}
          initialData={gameData}
        />
      </>
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
                    isMyTurn={isMyTurn}
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
                    isMyTurn={isMyTurn}
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
                    isMyTurn={isMyTurn}
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

      <GameEndModal
        isOpen={showGameEndModal}
        onClose={() => setShowGameEndModal(false)}
        loser={gameEndInfo.loser}
        reason={gameEndInfo.reason}
      />
    </div>
  );
};

export default GameBoard;
