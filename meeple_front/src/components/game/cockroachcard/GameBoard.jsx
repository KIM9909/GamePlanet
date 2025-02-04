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
import {
  ANIMAL_ORDER,
  sortCards,
  sortPenaltyGroups,
  getKoreanName,
  normalizeCardData
} from "./utils/cardUtils";
import handleKingCardPenalty from "./handleKingCardPenalty";

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
  roomData,
  onGameEnd,
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

  const penaltyStackRefs = useRef({});

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
    console.log("GameBoard handleStartGame called");
    setIsGameStarted(true);
    if (onStartGame) {
      onStartGame();
    }
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

  const handleGiveCard = (claimData) => {
    const normalizedCard = normalizeCardData(selectedCard);

    const giveCardData = {
      to: selectedPlayer,
      from: currentUser,
      card: {
        type: normalizedCard.type,
        royal: normalizedCard.royal, // normalizedCard에서 royal 값 사용
      },
      animal: claimData.animal,
      isKing: claimData.isKing,
      isNagative: claimData.isNegative,
    };

    // PASS인 경우와 일반 카드 주기를 구분하되, 같은 데이터 구조 사용
    sendMessage({
      type: isPassing ? "PASS_CARD" : "GIVE_CARD",
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

  const handleModalClose = () => {
    setShowGiveCardModal(false);
    setSelectedPlayer(null);
  };

 // handleGameEnd 함수에서
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
      
      setGameData(prev => ({
        ...prev,
        gameData: {
          ...prev.gameData,
          gameState: updatedGameState
        }
      }));
    }, 1000); // 1초 후에 초기화
  },
  [sendMessage, gameData]
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
    const currentCard = normalizeCardData(gameData.gameData.gameState.currentCard);
    const currentLoser = determineLoser(guess);
    const claimedAnimal = gameData.gameData.gameState.claimedAnimal;
    const isClaimedKing = gameData.gameData.gameState.isKing;
  
    await sendMessage({
      type: "GUESS_CARD",
      data: {
        from: currentUser,
        to: currentLoser,
        card: currentCard,
        correct: false,
      },
    });
  
    // 게임 상태 초기화 
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
  
    // Black/Joker 카드 처리 로직...
    if (currentCard.type === "Black" || currentCard.type === "Joker") {
      // 기존 Black/Joker 처리 로직 유지
      // ...
    } else {
      // 일반 카드 처리 (여기에 왕카드 로직 추가)
      const loserTableCards = gameData.gameData.userTableCards[currentLoser] || [];
      
      // 1. 먼저 ActiveArea의 현재 카드를 테이블에 추가
      const newPenaltyCard = {
        type: currentCard.royal ? `King${currentCard.type}` : currentCard.type,
        count: 1,
        royal: currentCard.royal,
      };
  
      const updatedTableCards = [...loserTableCards];
      const existingCardIndex = updatedTableCards.findIndex(
        (card) =>
          card.type === (currentCard.royal ? `King${currentCard.type}` : currentCard.type) &&
          card.royal === currentCard.royal
      );
  
      if (existingCardIndex !== -1) {
        updatedTableCards[existingCardIndex].count += 1;
      } else {
        updatedTableCards.push(newPenaltyCard);
      }
  
      // 2. 만약 현재 카드가 왕카드라면 오픈카드도 추가로 패널티
      if (currentCard.royal) {
        const openCard = gameData.gameData.publicDeck[gameData.gameData.publicDeck.length - 1];
        if (openCard) {
          const existingOpenCardIndex = updatedTableCards.findIndex(
            (card) =>
              card.type === (openCard.royal ? `King${openCard.type}` : openCard.type) &&
              card.royal === openCard.royal
          );
  
          if (existingOpenCardIndex !== -1) {
            updatedTableCards[existingOpenCardIndex].count += 1;
          } else {
            updatedTableCards.push({
              type: openCard.type,
              count: 1,
              royal: openCard.royal
            });
          }
  
          // 공개 덱에서 사용된 카드 제거
          const updatedDeck = [...gameData.gameData.publicDeck];
          updatedDeck.pop();
  
          // 게임 데이터 업데이트 (덱 포함)
          const updatedGameData = {
            ...gameData,
            gameData: {
              ...gameData.gameData,
              gameState: updatedGameState,
              userTableCards: {
                ...gameData.gameData.userTableCards,
                [currentLoser]: updatedTableCards,
              },
              publicDeck: updatedDeck
            },
          };
  
          setGameData(updatedGameData);
  
          // 서버에 패널티 카드 추가 알림
          await sendMessage({
            type: "KING_PENALTY",
            data: {
              loser: currentLoser,
              activeCard: currentCard,
              openCard: openCard
            }
          });
  
          // 만약 오픈 카드도 왕카드라면 추가 패널티 처리
          if (openCard.royal) {
            await handleKingCardPenalty(updatedGameData, setGameData, currentLoser, sendMessage);
          }
        }
      } else {
        // 일반 카드인 경우 기본 업데이트
        const updatedGameData = {
          ...gameData,
          gameData: {
            ...gameData.gameData,
            gameState: updatedGameState,
            userTableCards: {
              ...gameData.gameData.userTableCards,
              [currentLoser]: updatedTableCards,
            },
          },
        };
  
        setGameData(updatedGameData);
      }
  
      // 게임 종료 체크
      const gameFinishResult = checkGameFinish(currentLoser, updatedTableCards);
      if (gameFinishResult.isFinished) {
        setShowGuessModal(false);
        setGameEndInfo({
          loser: gameFinishResult.loser,
          reason: gameFinishResult.reason,
        });
        setShowGameEndModal(true);
        return;
      }
    }
  
    setShowGuessModal(false);
  };
  const handlePenaltyCardSelect = useCallback(
    async (selectedCards) => {
      // 패널티 카드를 낼 수 없는 경우 체크
      const loserHand = gameData?.gameData?.playerCards[currentLoser] || [];
      const requiredCards = penaltyCardCount;
  
      if (loserHand.length < requiredCards) {
        await sendMessage({
          type: "HAND_CHECK",
          data: {
            player: currentLoser,
          }
        });
        return;
      }
  
      // 선택된 카드들을 패자의 핸드에서 제거
      const updatedHand = loserHand.filter(
        (card) =>
          !selectedCards.some(
            (selectedCard) =>
              selectedCard.type === card.type &&
              selectedCard.royal === card.royal
          )
      );
  
      // 첫 번째 게임 데이터 업데이트 (핸드 카드 제거)
      const firstUpdateGameData = {
        ...gameData,
        gameData: {
          ...gameData.gameData,
          playerCards: {
            ...gameData.gameData.playerCards,
            [currentLoser]: updatedHand,
          }
        }
      };
  
      // 패자의 테이블 카드 업데이트
      const loserTableCards = gameData.gameData.userTableCards[currentLoser] || [];
  
      const updateTableCards = (cards, selectedCard) => {
        const cardType = selectedCard.royal
          ? `King${selectedCard.type}`
          : selectedCard.type;
        const existingCardIndex = cards.findIndex(
          (card) => card.type === cardType && card.royal === selectedCard.royal
        );
  
        if (existingCardIndex !== -1) {
          cards[existingCardIndex].count += 1;
        } else {
          cards.push({
            type: cardType,
            count: 1,
            royal: selectedCard.royal,
            isNew: true // 애니메이션을 위한 플래그
          });
        }
        return [...cards];
      };
  
      const updatedLoserTableCards = selectedCards.reduce(
        (acc, card) => updateTableCards(acc, card),
        [...loserTableCards]
      );
  
      // 게임 데이터 최종 업데이트
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
            [currentLoser]: updatedLoserTableCards,
          },
        },
      }));
  
      // 선택된 카드 중 왕 카드가 있는지 확인
      const kingCards = selectedCards.filter(card => card.royal);
      if (kingCards.length > 0) {
        // 각 왕 카드마다 패널티 처리
        for (const kingCard of kingCards) {
          await handleKingCardPenalty(gameData, setGameData, currentLoser, sendMessage);
        }
      }
  
      // 서버로 메시지 전송
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
    [currentLoser, gameData, sendMessage, penaltyCardCount, setGameData]
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

  const sendPenaltyCard = async (loser, currentCard) => {
    try {
      await sendMessage({
        type: "SINGLE_CARD_PENALTY",
        data: {
          loser,
          cardType: currentCard.type,
          royal: currentCard.royal,
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
            royal: openCard.royal,
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

  // WebSocket 메시지 처리 수정
  useEffect(() => {
    if (!stompClient || !gameData) return;

    const handleGameMessage = (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log("Received game message:", data);

        switch (data.type) {
          case "SINGLE_CARD_PENALTY":
            // 패널티 카드 처리
            break;
          case "GIVE_CARD":
            // 카드 주기 처리
            break;
          case "GUESS_RESULT":
            // 추측 결과 처리
            break;
          case "HAND_CHECK":
            // 핸드 체크 처리
            break;
          default:
            console.log("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error handling game message:", error);
      }
    };

    // 게임 메시지 구독은 useSocket에서 처리하므로 여기서는 제거

    return () => {
      // cleanup 로직
    };
  }, [stompClient, gameData, currentUser]);


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
  
  // 현재 유저를 제외한 다른 플레이어들을 가져옵니다
  const opponents = players.filter(player => player !== currentUser);
  
  return (
    <div className="p-4">
      <div className="relative w-full h-[800px] max-w-[1600px] mx-auto bg-gray-700/10 rounded-3xl">
        {/* 상대방 영역 */}
        <div className="absolute top-4 left-0 right-0">
          <div className={`flex justify-between ${opponents.length === 1 ? 'justify-center' : 'px-4'}`}>
            {opponents.map((opponent, index) => (
              <div 
                key={opponent} 
                className={`${
                  opponents.length === 1 
                    ? 'w-64' 
                    : opponents.length === 2 
                      ? 'w-[calc(40%-1rem)]'
                      : 'w-[calc(33%-1rem)]'
                }`}
              >
                <OpponentArea
                  ref={(el) => (penaltyStackRefs.current[opponent] = el)}
                  playerNumber={index + 2}
                  penaltyCards={userTableCards[opponent] || []}
                  handCards={playerCards[opponent] || []}
                  playerName={opponent}
                  isMyTurn={isMyTurn || isPassing}
                  selectedCard={selectedCard}
                  handlePlayerClick={handlePlayerClick}
                  isPassing={isPassing}
                  passedPlayers={gameData?.gameData?.gameState?.passedPlayers || []}
                  cardSender={gameData?.gameData?.gameState?.cardSender}
                  remainingPlayers={remainingPlayers}
                  currentUser={currentUser}
                />
              </div>
            ))}
          </div>
        </div>
  
        <DeckArea openCard={publicDeck[publicDeck.length - 1]} />
  
        {/* 내 영역 */}
        <MyArea
          ref={(el) => (penaltyStackRefs.current[currentUser] = el)}
          penaltyCards={userTableCards[currentUser] || []}
          handCards={playerCards[currentUser] || []}
          isMyTurn={isMyTurn && !isPassing}
          selectedCard={selectedCard}
          handleCardClick={handleCardClick}
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
