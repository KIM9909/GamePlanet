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
import GameEndModal from "./modal/GameEndModal";
import MyArea from "./areas/MyArea";
import DeckArea from "./areas/DeckArea";
import OpponentArea from "./areas/OpponentArea";
import useCockroachSocket from "../../../hooks/useCockroachSocket";
import { WS_ENDPOINTS } from "../../../hooks/useCockroachSocket";
import { useSelector } from "react-redux";

import { getKoreanName, normalizeCardData } from "./utils/cardUtils";

const GameBoard = ({
  onStartGame,
  gameData,
  setGameData,
  currentUser,
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
  const activeCardRef = useRef(null);
  const [penaltyAnimation, setPenaltyAnimation] = useState({
    isAnimating: false,
    card: null,
    loser: null,
    sourcePosition: null,
    targetPosition: null,
  });

  const { sendMessage } = useCockroachSocket(roomId);

  const penaltyStackRefs = useRef({});

  // 남은 플레이어 계산
  const remainingPlayers = useMemo(() => {
    if (!gameData?.players || !gameData?.gameData?.gameState) return [];

    const { cardSender, passedPlayers = [] } = gameData.gameData.gameState;

    return gameData.players.filter(
      (player) => player !== cardSender && !passedPlayers.includes(player)
    );
  }, [gameData]);

  // 1. 게임 핵심 로직------------------------------------------------------------------------
  const handleGameEnd = useCallback(
    async (gameFinishResult) => {
      console.log("게임 종료:", gameFinishResult);

      setGameEndInfo({
        loser: gameFinishResult.loser,
        reason: gameFinishResult.reason,
      });
      setShowGameEndModal(true);

      // 게임 종료 메시지 전송
      await sendMessage({
        type: "GAME_END",
        data: {
          loser: gameFinishResult.loser,
          reason: gameFinishResult.reason,
        },
      });

      // 게임 종료 후에 상태 초기화
      setTimeout(() => {
        const updatedGameState = {
          ...gameData.gameData.gameState,
          currentCard: null,
          cardSender: null,
          cardReceiver: null,
          claimedAnimal: null,
          isKing: false,
          passedPlayers: [],
          passCount: 0,
        };

        setGameData((prev) => ({
          ...prev,
          gameData: {
            ...prev.gameData,
            gameState: updatedGameState,
          },
        }));
      }, 1000); // 1초 후에 초기화
    },
    [sendMessage, gameData, setGameData]
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

  const determineLoser = (guess) => {
    const { cardSender, cardReceiver, currentCard, claimedAnimal, isKing } =
      gameData.gameData.gameState;

    // 블랙이라고 추측했는데 아닐 경우
    if (guess === "Black" && currentCard.type !== "Black") {
      return cardReceiver; // 추측한 사람이 짐
    }

    // Black 카드 처리
    if (currentCard.type === "Black") {
      return guess === "Black" ? cardSender : cardReceiver;
    }

    // Joker 카드 처리
    if (currentCard.type === "Joker") {
      if (guess === "Black") {
        return cardReceiver; // 조커를 블랙이라고 잘못 추측하면 추측한 사람이 짐
      }
      // 조커는 왕 카드로 블러핑했을 때만 거짓
      const isJokerLie = isKing;
      if (
        (guess === "TRUE" && isJokerLie) ||
        (guess === "FALSE" && !isJokerLie)
      ) {
        return cardReceiver;
      }
      return cardSender;
    }

    // 일반 카드 처리
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

  const handleGuess = async (guess) => {
    const currentCard = normalizeCardData(
      gameData.gameData.gameState.currentCard
    );
    const currentLoser = determineLoser(guess);

    // 게임 결과 서버에 전송
    await sendMessage({
      type: "SINGLE_CARD",
      data: {
        from: currentUser,
        to: currentLoser,
        card: currentCard,
        correct: false,
      },
    });

    // 블랙/조커 처리
    if (currentCard.type === "Black" || currentCard.type === "Joker") {
      setPenaltyCardCount(currentCard.type === "Black" ? 2 : 1);
      setCurrentLoser(currentLoser);
      setShowPenaltyCardModal(true);
      setShowGuessModal(false);
      return;
    }

    // 일반/왕카드 처리
    let updatedTableCards = addCardToTable(
      [...(gameData.gameData.userTableCards[currentLoser] || [])],
      currentCard
    );

    let updatedGameData = { ...gameData };

    // 왕카드 추가 패널티
    if (currentCard.royal) {
      const openCard =
        gameData.gameData.publicDeck[gameData.gameData.publicDeck.length - 1];
      if (openCard) {
        await sendMessage({
          type: "SINGLE_CARD",
          data: {
            from: currentUser,
            to: currentLoser,
            card: openCard,
            correct: false,
          },
        });

        updatedTableCards = addCardToTable(updatedTableCards, openCard);
        updatedGameData.gameData.publicDeck =
          gameData.gameData.publicDeck.slice(0, -1);
      }
    }

    // 게임 상태 업데이트
    updatedGameData.gameData = {
      ...updatedGameData.gameData,
      gameState: {
        currentCard: null,
        cardSender: null,
        cardReceiver: null,
        claimedAnimal: null,
        isKing: false,
        passedPlayers: [],
        passCount: 0,
      },
      userTableCards: {
        ...updatedGameData.gameData.userTableCards,
        [currentLoser]: updatedTableCards,
      },
    };

    setGameData(updatedGameData);

    // 게임 종료 체크
    const gameFinishResult = checkGameFinish(currentLoser, updatedTableCards);
    if (gameFinishResult.isFinished) {
      setShowGuessModal(false);
      setGameEndInfo(gameFinishResult);
      setShowGameEndModal(true);
      return;
    }

    setShowGuessModal(false);
  };

  const handleGiveCard = (claimData) => {
    const normalizedCard = normalizeCardData(selectedCard);

    const giveCardData = {
      to: selectedPlayer,
      from: currentUser,
      card: {
        type: normalizedCard.type,
        royal: normalizedCard.royal,
      },
      animal: claimData.animal,
      isKing: claimData.isKing,
      isNagative: claimData.isNegative,
      mode: claimData.mode,
    };

    sendMessage({
      type: "GIVE_CARD",
      data: giveCardData,
    });

    // 게임 상태 업데이트
    const updatedGameState = {
      ...gameData.gameData.gameState,
      cardSender: currentUser,
      cardReceiver: selectedPlayer,
      currentCard: normalizedCard, // normalizedCard 사용
      claimedAnimal: claimData.animal,
      isKing: claimData.isKing,
    };

    const updatedPlayerCards = isPassing
      ? gameData.gameData.playerCards
      : {
          ...gameData.gameData.playerCards,
          [currentUser]: gameData.gameData.playerCards[currentUser].filter(
            (card) =>
              !(
                card.type === selectedCard.type &&
                card.royal === selectedCard.royal
              )
          ),
        };

    const updatedGameData = {
      ...gameData,
      gameData: {
        ...gameData.gameData,
        gameState: updatedGameState,
        playerCards: updatedPlayerCards,
      },
    };

    setGameData(updatedGameData);
    setShowGiveCardModal(false);
    setIsPassing(false);
    setSelectedCard(null);
    setSelectedPlayer(null);
    setIsMyTurn(false);
  };

  // 2. 카드 조작 로직------------------------------------------------------------------------
  const addCardToTable = (tableCards, card) => {
    const cardType = card.royal ? `King${card.type}` : card.type;
    const existingIndex = tableCards.findIndex(
      (c) => c.type === cardType && c.royal === card.royal
    );

    if (existingIndex !== -1) {
      tableCards[existingIndex].count += 1;
    } else {
      tableCards.push({
        type: cardType,
        count: 1,
        royal: card.royal,
        isNew: true,
      });
    }

    return tableCards;
  };

  const addCardsToTable = (tableCards, newCards) => {
    return newCards.reduce(
      (acc, card) => {
        const cardType = card.royal ? `King${card.type}` : card.type;
        const existingIndex = acc.findIndex(
          (c) => c.type === cardType && c.royal === card.royal
        );

        if (existingIndex !== -1) {
          acc[existingIndex].count += 1;
        } else {
          acc.push({
            type: cardType,
            count: 1,
            royal: card.royal,
            isNew: true,
          });
        }
        return acc;
      },
      [...tableCards]
    );
  };

  const removeCardsFromHand = (handCards, selectedCards) => {
    return handCards.filter(
      (card) =>
        !selectedCards.some(
          (selectedCard) =>
            selectedCard.type === card.type && selectedCard.royal === card.royal
        )
    );
  };

  const handlePenaltyCardSelect = useCallback(
    async (selectedCards) => {
      // 핸드 체크
      if (
        gameData?.gameData?.playerCards[currentLoser]?.length <
        selectedCards.length
      ) {
        await sendMessage({
          type: "HAND_CHECK",
          data: { player: currentLoser },
        });
        return;
      }

      // 핸드에서 카드 제거 & 테이블에 카드 추가
      const updatedHand = removeCardsFromHand(
        gameData.gameData.playerCards[currentLoser],
        selectedCards
      );
      const updatedTableCards = addCardsToTable(
        gameData.gameData.userTableCards[currentLoser],
        selectedCards
      );

      // 게임 데이터 업데이트
      setGameData((prevData) => ({
        ...prevData,
        gameData: {
          ...prevData.gameData,
          playerCards: {
            ...prevData.gameData.playerCards,
            [currentLoser]: updatedHand,
          },
          userTableCards: {
            ...prevData.gameData.userTableCards,
            [currentLoser]: updatedTableCards,
          },
        },
      }));

      setShowPenaltyCardModal(false);
    },
    [currentLoser, gameData, setGameData]
  );

  // 3. 게임 진행 로직------------------------------------------------------------------------
  const handleStartGame = () => {
    sendMessage({
      type: "START_GAME",
      data: {},
    });
    setIsGameStarted(true);
    if (onStartGame) onStartGame();
  };

  const handleCardClick = (card, event) => {
    if (!isMyTurn) return;

    // 애니메이션 관련 코드 제거
    setSelectedCard(card);
  };

  const handlePlayerClick = (playerNickname) => {
    if (!isPassing && (!isMyTurn || !selectedCard)) return;
    if (playerNickname === currentUser) return;

    setSelectedPlayer(playerNickname);
    setShowGiveCardModal(true);
  };

  const handlePass = () => {
    if (remainingPlayers.length === 0) {
      console.log("마지막 플레이어는 무조건 맞춰야 합니다!");
      setShowGuessModal(true);
      return;
    }

    const currentGameState = gameData.gameData.gameState;
    const normalizedCurrentCard = normalizeCardData(
      currentGameState.currentCard
    );

    setIsPassing(true);
    setSelectedCard(normalizedCurrentCard); // 정규화된 카드 정보 사용

    setPassedPlayers([...(currentGameState.passedPlayers || []), currentUser]);

    setPassCount((prev) => prev + 1);
  };

  // 4. UI 상태 관리------------------------------------------------------------------------
  const handleModalClose = () => {
    setShowGiveCardModal(false);
    setSelectedPlayer(null);
  };

  const getOpponentCardCount = useCallback(
    (opponent) => {
      // opponent ID를 직접 사용해서 해당 플레이어의 카드 수를 반환
      return gameData?.playerCards?.[opponent]?.length || 0;
    },
    [gameData]
  );

  // 5. 상태 관리 Effects------------------------------------------------------------------------
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

  useEffect(() => {
    if (gameData?.gameData?.gameState?.currentCard) {
      setPassedPlayers(new Set());
      setPassCount(0); // PASS 카운트 초기화
    }
  }, [gameData?.gameData?.gameState?.currentCard]);

  useEffect(() => {
    console.log("Players:", gameData?.players);
    console.log("Current User:", currentUser);
    console.log("GameData:", gameData);
  }, [gameData, currentUser]);

  // Redux에서 userId 가져오기
  const userId = useSelector((state) => state.user.userId);

  // 현재 유저를 제외한 다른 플레이어들
  const opponents = useMemo(() => {
    if (!gameData?.playerCards) return [];
    // playerCards의 키(플레이어 ID)들을 배열로 변환하고 현재 사용자 제외
    return Object.keys(gameData.playerCards).filter(
      (player) => player !== currentUser
    );
  }, [gameData, currentUser]);
  console.log("상대방", opponents);
  console.log("플레이어들", gameData.playerCards[9]);

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
        {/* 상대방 영역 */}
        <div className="absolute top-4 left-0 right-0">
          <div
            className={`flex justify-between ${
              opponents.length === 1 ? "justify-center" : "px-4"
            }`}
          >
            {opponents.map((opponent, index) => (
              <div
                key={opponent}
                className={`${
                  opponents.length === 1
                    ? "w-64"
                    : opponents.length === 2
                    ? "w-[calc(40%-1rem)]"
                    : "w-[calc(33%-1rem)]"
                }`}
              >
                <OpponentArea
                  ref={(el) => (penaltyStackRefs.current[opponent] = el)}
                  playerNumber={index + 2}
                  penaltyCards={gameData?.userTableCards?.[opponent] || []}
                  handCards={Array(getOpponentCardCount(opponent)).fill({
                    isBack: true,
                  })}
                  playerName={opponent}
                  isMyTurn={isMyTurn || isPassing}
                  selectedCard={selectedCard}
                  handlePlayerClick={handlePlayerClick}
                  isPassing={isPassing}
                  passedPlayers={gameData?.gameState?.passedPlayers || []}
                  cardSender={gameData?.gameState?.cardSender}
                  remainingPlayers={remainingPlayers}
                  currentUser={currentUser}
                  gameData={gameData} // gameData.gameData를 전달
                />
              </div>
            ))}
          </div>
        </div>

        <DeckArea publicDeck={gameData?.publicDeck || []} />

        {/* 내 영역 */}
        <MyArea
          ref={(el) => (penaltyStackRefs.current[currentUser] = el)}
          penaltyCards={gameData?.userTableCards?.[currentUser] || []}
          handCards={gameData?.playerCards?.[userId] || []}
          isMyTurn={isMyTurn && !isPassing}
          selectedCard={selectedCard}
          handleCardClick={handleCardClick}
          currentUser={currentUser}
        />

        {/* 애니메이션되는 카드 영역 */}
        {penaltyAnimation.isAnimating &&
          penaltyAnimation.sourcePosition &&
          penaltyAnimation.targetPosition && (
            <div
              className="fixed z-50 transition-all duration-1000 ease-in-out pointer-events-none"
              style={{
                left: penaltyAnimation.sourcePosition.left,
                top: penaltyAnimation.sourcePosition.top,
                transform: `translate(
                ${
                  penaltyAnimation.targetPosition.left -
                  penaltyAnimation.sourcePosition.left
                }px,
                ${
                  penaltyAnimation.targetPosition.top -
                  penaltyAnimation.sourcePosition.top
                }px
              )`,
                opacity: 1,
              }}
            >
              <Card
                type={penaltyAnimation.card.type}
                isRoyal={penaltyAnimation.card.royal}
                isActive={true}
              />
            </div>
          )}

        <div ref={activeCardRef}>
          <ActiveCardArea
            currentCard={gameData?.gameData?.gameState?.currentCard}
            cardSender={gameData?.gameData?.gameState?.cardSender}
            cardReceiver={gameData?.gameData?.gameState?.cardReceiver}
            currentUser={currentUser}
            handlePass={handlePass}
            setShowGuessModal={setShowGuessModal}
            gameData={gameData}
            isPassing={isPassing}
            selectedCard={selectedCard}
          />
        </div>
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
          claimedAnimal={gameData.gameData.gameState.currentClaimedAnimal}
          isKing={gameData.gameData.gameState.currentClaimedKing}
          sendMessage={sendMessage}
          currentUser={currentUser}
          currentLoser={currentLoser}
        />
      )}

      <GameEndModal
        isOpen={showGameEndModal}
        onClose={() => setShowGameEndModal(false)}
        loser={gameEndInfo.loser}
        reason={gameEndInfo.reason}
        roomId={gameData?.roomId}
        setIsGameStarted={setIsGameStarted}
      />
    </div>
  );
};

export default GameBoard;
