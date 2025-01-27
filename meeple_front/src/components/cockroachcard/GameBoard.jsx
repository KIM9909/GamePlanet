import React, { useState, useRef, useEffect } from "react";
import GiveCardModal from "./GiveCardModal";
import GuessCardModal from "./GuessCardModal";

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
    // 기본 타입 추출 (King 제거)
    const typeA = a.type.replace("King", "");
    const typeB = b.type.replace("King", "");

    // 같은 동물이면 일반 카드가 먼저 오도록
    if (typeA === typeB) {
      return a.type.includes("King") ? 1 : -1;
    }

    // 동물 순서대로 정렬
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

const Card = ({
  type = null,
  isBack = false,
  isRoyal = false,
  onClick,
  selectedCard,
  isActive = false,
}) => {
  if (isBack || !type) {
    return (
      <div
        className="flex-shrink-0 w-16 h-24 rounded-lg relative group cursor-pointer overflow-hidden 
           shadow-[0_0_0_1px_rgba(255,255,255,0.3)] hover:shadow-[0_0_0_2px_rgba(255,255,255,0.5)]
           transition-shadow duration-200"
      >
        <img
          src="/src/assets/image/cockroachpoker/CardBack.svg"
          alt="Card Back"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // 특수 카드(Joker, Black) 처리
  if (type === "Joker" || type === "Black") {
    const cardImageType = type === "Joker" ? "JockerCard" : "BlackCard";
    return (
      <div
        onClick={() => onClick?.({ type })}
        className={`flex-shrink-0 w-16 h-24 rounded-lg relative group cursor-pointer overflow-hidden
          ${selectedCard?.type === type ? "ring-2 ring-blue-500" : ""} ${
          isActive ? "ring-2 ring-green-500" : ""
        }`}
      >
        <img
          src={`/src/assets/image/cockroachpoker/${cardImageType}.svg`}
          alt={type}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100">
          <span className="text-sm text-white">{getKoreanName(type)}</span>
        </div>
      </div>
    );
  }

  // 일반/킹 카드 처리
  const cardImageType = isRoyal ? `King${type}Card` : `${type}Card`;
  const displayName = isRoyal ? `King${type}` : type;

  return (
    <div
      data-card-id={type}
      onClick={() => onClick?.({ type, isRoyal })}
      className={`
        flex-shrink-0 w-16 h-24 rounded-lg relative group cursor-pointer overflow-hidden
        transition-all duration-300 ease-in-out
        ${selectedCard?.type === type ? "ring-2 ring-blue-500" : ""}
        ${isActive ? "shadow-lg shadow-blue-500/50" : ""}
      `}
    >
      <img
        src={`/src/assets/image/cockroachpoker/${cardImageType}.svg`}
        alt={displayName}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100">
        <span className="text-sm text-white">{getKoreanName(displayName)}</span>
      </div>
    </div>
  );
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

  return (
    <div
      className={`w-64 space-y-4 
        ${!isMyTurn && !isPassing ? "opacity-50" : ""} 
        ${
          isMyTurn || isPassing
            ? "cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg"
            : ""
        }
        ${
          isPassing ? "ring-2 ring-green-500" : ""
        }  // PASS 모드일 때 녹색 테두리
      `}
      onClick={() => (isMyTurn || isPassing) && handlePlayerClick(playerName)}
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

        {/* 핸드 카드 영역 */}
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
  // 벌칙 카드 그룹화 및 정렬
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
      {/* 벌칙 카드 영역 */}
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

      {/* 핸드 카드 영역 */}
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

// 현재 전달 중인 카드를 보여주는 컴포넌트
const ActiveCardArea = ({
  currentCard,
  cardSender,
  cardReceiver,
  currentUser,
  handlePass,
  setShowGuessModal,
  gameData,
  isPassing,
}) => {
  if (!currentCard) return null;

  const shouldShowFront = () => {
    if (cardSender === currentUser || isPassing) return true;
    return false;
  };

  return (
    <div className="absolute top-[60%] right-4 w-72 active-card-area">
      <div className="bg-gray-800/90 p-4 rounded-lg space-y-4">
        <div className="text-sm text-gray-300 text-center">
          {cardSender} → {cardReceiver}
        </div>
        <div className="relative flex justify-center">
          <Card
            type={shouldShowFront() ? currentCard.type : null}
            isBack={!shouldShowFront()}
            isRoyal={currentCard.royal}
            isActive={true}
          />
        </div>

        {/* 내가 받는 카드일 때만 버튼 표시 */}
        {cardReceiver === currentUser && (
          <div className="flex justify-center gap-4 mt-4">
            {/* PASS 모드가 아닐 때만 PASS 버튼 활성화 */}
            {!isPassing && (
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                onClick={handlePass}
              >
                PASS
              </button>
            )}
            {/* PASS 모드일 때는 GUESS 버튼 비활성화 */}
            <button
              className={`px-4 py-2 ${
                isPassing
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500"
              } text-white rounded`}
              onClick={() => !isPassing && setShowGuessModal(true)}
              disabled={isPassing}
            >
              GUESS
            </button>
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
  const [isPassing, setIsPassing] = useState(false); // PASS 모드 상태 추가

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
    if (playerNickname === currentUser) return; // 자기 자신은 선택 불가

    setSelectedPlayer(playerNickname);
    setShowGiveCardModal(true);
    // PASS 모드일 때는 isPassing을 false로 설정하지 않음
    if (!isPassing) {
      setIsPassing(false);
    }
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

    // 카드 전달이 완료되면 모든 상태 초기화
    setSelectedCard(null);
    setSelectedPlayer(null);
    setShowGiveCardModal(false);
    setIsPassing(false); // 카드 전달이 완료되면 PASS 모드 해제
  };

  const handleModalClose = () => {
    // 모달만 닫고 플레이어 선택으로 돌아가기
    setShowGiveCardModal(false);
    setSelectedPlayer(null);
    // isPassing 상태는 유지
  };

  const handlePass = () => {
    // PASS 모드 활성화
    setIsPassing(true);
    // 현재 전달받은 카드를 선택된 카드로 설정 (isRoyal 속성도 함께 전달)
    setSelectedCard({
      type: gameData.gameData.gameState.currentCard.type,
      isRoyal: gameData.gameData.gameState.currentCard.royal,
    });

    // 핸드카드 선택 비활성화를 위해 isMyTurn false로 설정
    setIsMyTurn(false);
  };

  const handleGuess = async (isTrue) => {
    const currentCard = gameData.gameData.gameState.currentCard;
    const openCard =
      gameData.gameData.publicDeck[gameData.gameData.publicDeck.length - 1];
    const loser = determineLoser(isTrue);

    try {
      if (currentCard.type === "Black" || currentCard.type === "Joker") {
        // 특수 카드(블랙/조커)인 경우 multicard API 사용
        await sendMessage({
          type: "MULTI_CARD_PENALTY",
          data: {
            loser,
            cardType: currentCard.type,
            isRoyal: currentCard.royal,
          },
        });
      } else {
        // 일반/왕 카드인 경우
        await sendMessage({
          type: "SINGLE_CARD_PENALTY",
          data: {
            loser,
            cardType: currentCard.type,
            isRoyal: currentCard.royal,
          },
        });

        // 왕 카드인 경우 공개 카드도 패널티로 추가
        if (currentCard.royal && openCard) {
          await sendMessage({
            type: "SINGLE_CARD_PENALTY",
            data: {
              loser,
              cardType: openCard.type,
              isRoyal: openCard.royal,
            },
          });
        }
      }
    } catch (error) {
      console.error("패널티 카드 처리 실패:", error);
    }

    setShowGuessModal(false);
  };

  // 패자 결정 함수
  const determineLoser = (isTrue) => {
    const { cardSender, cardReceiver, currentCard, claimedAnimal, isKing } =
      gameData.gameData.gameState;

    // 실제 카드와 선언이 일치하는지 확인
    const isCorrectClaim =
      currentCard.type === claimedAnimal && currentCard.royal === isKing;

    // 선언이 맞았는데 거짓이라고 했거나, 선언이 틀렸는데 진실이라고 한 경우 추측한 사람이 패배
    if ((isCorrectClaim && !isTrue) || (!isCorrectClaim && isTrue)) {
      return cardReceiver; // 추측한 사람(카드 받은 사람)이 패배
    } else {
      return cardSender; // 선언한 사람(카드 보낸 사람)이 패배
    }
  };

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

  // gameData가 없으면 로딩 표시
  if (!gameData) {
    return (
      <div className="relative w-full h-[800px] max-w-[1600px] mx-auto bg-gray-700/10 rounded-3xl flex items-center justify-center">
        <div className="text-xl text-gray-200">게임 데이터 로딩 중...</div>
      </div>
    );
  }

  // 서버에서 받은 게임 데이터 사용
  const {
    players = [],
    gameData: { playerCards = {}, publicDeck = [], userTableCards = {} } = {},
  } = gameData || {};

  return (
    <div className="p-4">
      <div className="relative w-full h-[800px] max-w-[1600px] mx-auto bg-gray-700/10 rounded-3xl">
        {/* 상단 플레이어 영역 */}
        {playerCount === 2 ? (
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <OpponentArea
              playerNumber={2}
              penaltyCards={userTableCards[players[1]] || []}
              handCards={playerCards[players[1]] || []}
              playerName={players[1]}
              isMyTurn={isMyTurn || isPassing} // PASS 모드일 때도 클릭 가능하도록
              selectedCard={selectedCard}
              handlePlayerClick={handlePlayerClick}
              isPassing={isPassing} // PASS 모드 전달
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
                    isMyTurn={isMyTurn || isPassing} // PASS 모드일 때도 클릭 가능하도록
                    selectedCard={selectedCard}
                    handlePlayerClick={handlePlayerClick}
                    isPassing={isPassing} // PASS 모드 전달
                  />
                </div>
                <div className="w-[calc(40%-1rem)]">
                  <OpponentArea
                    playerNumber={3}
                    penaltyCards={userTableCards[players[2]] || []}
                    handCards={playerCards[players[2]] || []}
                    playerName={players[2]}
                    isMyTurn={isMyTurn || isPassing} // PASS 모드일 때도 클릭 가능하도록
                    selectedCard={selectedCard}
                    handlePlayerClick={handlePlayerClick}
                    isPassing={isPassing} // PASS 모드 전달
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
                    isMyTurn={isMyTurn || isPassing} // PASS 모드일 때도 클릭 가능하도록
                    selectedCard={selectedCard}
                    handlePlayerClick={handlePlayerClick}
                    isPassing={isPassing} // PASS 모드 전달
                  />
                </div>
                <div className="w-[calc(33%-1rem)]">
                  <OpponentArea
                    playerNumber={3}
                    penaltyCards={userTableCards[players[2]] || []}
                    handCards={playerCards[players[2]] || []}
                    playerName={players[2]}
                    isMyTurn={isMyTurn || isPassing} // PASS 모드일 때도 클릭 가능하도록
                    selectedCard={selectedCard}
                    handlePlayerClick={handlePlayerClick}
                    isPassing={isPassing} // PASS 모드 전달
                  />
                </div>
                <div className="w-[calc(33%-1rem)]">
                  <OpponentArea
                    playerNumber={4}
                    penaltyCards={userTableCards[players[3]] || []}
                    handCards={playerCards[players[3]] || []}
                    playerName={players[3]}
                    isMyTurn={isMyTurn || isPassing} // PASS 모드일 때도 클릭 가능하도록
                    selectedCard={selectedCard}
                    handlePlayerClick={handlePlayerClick}
                    isPassing={isPassing} // PASS 모드 전달
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 중앙 덱 영역 */}
        <DeckArea openCard={publicDeck[publicDeck.length - 1]} />

        {/* 내 영역 */}
        <MyArea
          penaltyCards={userTableCards[players[0]] || []}
          handCards={playerCards[players[0]] || []}
          isMyTurn={isMyTurn && !isPassing} // PASS 모드일 때는 핸드카드 선택 불가
          selectedCard={selectedCard}
          handleCardClick={handleCardClick}
        />

        {/* 현재 전달 중인 카드 영역 */}
        <ActiveCardArea
          currentCard={gameData?.gameData?.gameState?.currentCard}
          cardSender={gameData?.gameData?.gameState?.cardSender}
          cardReceiver={gameData?.gameData?.gameState?.cardReceiver}
          currentUser={currentUser}
          currentPhase={gameData?.gameData?.gameState?.currentPhase}
          handlePass={handlePass}
          setShowGuessModal={setShowGuessModal}
          gameData={gameData}
          isPassing={isPassing}
        />
      </div>

      <GiveCardModal
        isOpen={showGiveCardModal}
        onClose={handleModalClose} // 새로운 핸들러 사용
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
    </div>
  );
};

export default GameBoard;
