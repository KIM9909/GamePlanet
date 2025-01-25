import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Card = ({ type = null, isBack = false, isRoyal = false }) => {
  if (isBack || !type) {
    return (
      <div className="flex-shrink-0 w-16 h-24 rounded-lg relative group cursor-pointer overflow-hidden">
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
      <div className="flex-shrink-0 w-16 h-24 rounded-lg relative group cursor-pointer overflow-hidden">
        <img
          src={`/src/assets/image/cockroachpoker/${cardImageType}.svg`}
          alt={type}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100">
          <span className="text-sm text-white">{type}</span>
        </div>
      </div>
    );
  }

  // 일반/킹 카드 처리
  const cardImageType = isRoyal ? `King${type}Card` : `${type}Card`;
  const displayName = isRoyal ? `King ${type}` : type;

  return (
    <div className="flex-shrink-0 w-16 h-24 rounded-lg relative group cursor-pointer overflow-hidden">
      <img
        src={`/src/assets/image/cockroachpoker/${cardImageType}.svg`}
        alt={displayName}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100">
        <span className="text-sm text-white">{displayName}</span>
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
      <div className="absolute -top-8 left-0 w-full text-center">
        <div className="text-sm font-semibold bg-white/90 px-2 py-1 rounded shadow-sm">
          {count}장
        </div>
      </div>
    </div>
  );
};

const DraggableArea = ({ children, maxWidth = "w-96" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef(null);

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 100;
      containerRef.current.scrollLeft += direction * scrollAmount;
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className={`relative group ${maxWidth}`}>
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white/100 rounded-full p-1.5 shadow-lg z-10 -translate-x-1/2"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div
        ref={containerRef}
        className="overflow-x-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="flex gap-2 pb-8 px-4">{children}</div>
      </div>

      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white/100 rounded-full p-1.5 shadow-lg z-10 translate-x-1/2"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-100" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent opacity-0 group-hover:opacity-100" />
    </div>
  );
};

const OpponentArea = ({ playerNumber, penaltyCards = [], handCards = [] }) => {
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

  return (
    <div className="w-64 space-y-4">
      <div className="text-center text-sm font-medium text-gray-600">
        Player {playerNumber}
      </div>
      <div className="space-y-4">
        <DraggableArea maxWidth="w-64">
          {Object.values(groupedPenaltyCards).map((stack, i) => (
            <PenaltyCardStack
              key={i}
              type={stack.type}
              count={stack.count}
              isRoyal={stack.royal}
            />
          ))}
        </DraggableArea>
        <DraggableArea maxWidth="w-64">
          {handCards.map((card, i) => (
            <Card key={i} isBack={true} type={null} />
          ))}
        </DraggableArea>
      </div>
    </div>
  );
};

const MyArea = ({ penaltyCards = [], handCards = [] }) => {
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

  return (
    <div className="absolute bottom-0 left-0 right-0 p-8 space-y-8">
      <DraggableArea maxWidth="w-full">
        {Object.values(groupedPenaltyCards).map((stack, i) => (
          <PenaltyCardStack
            key={i}
            type={stack.type}
            count={stack.count}
            isRoyal={stack.royal}
          />
        ))}
      </DraggableArea>
      <DraggableArea maxWidth="w-full">
        {handCards.map((card, i) => (
          <Card key={i} isBack={false} type={card.type} isRoyal={card.royal} />
        ))}
      </DraggableArea>
    </div>
  );
};

const DeckArea = ({ openCard }) => {
  return (
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-2 border-gray-200">
      <div className="flex gap-16 items-center relative">
        {/* 덱 영역 */}
        <div className="relative">
          <div className="absolute -top-3 -left-3 w-[72px] h-[104px] bg-white/50 rounded-lg -rotate-6" />
          <div className="absolute -top-2 -left-2 w-[72px] h-[104px] bg-white/70 rounded-lg rotate-3" />
          {[4, 3, 2, 1, 0].map((index) => (
            <div
              key={index}
              className="absolute"
              style={{
                top: `${-index * 2}px`,
                left: `${-index * 2}px`,
                zIndex: index,
              }}
            >
              <Card isBack={true} />
            </div>
          ))}
        </div>

        {/* 간격선 */}
        <div className="w-px h-28 bg-gray-300/50" />

        {/* 오픈 카드 영역 */}
        <div className="relative">
          <div className="absolute inset-0 -m-2 bg-white/70 rounded-lg" />
          <Card
            type={openCard?.type}
            isBack={!openCard}
            isRoyal={openCard?.royal}
          />
        </div>
      </div>

      {/* 설명 레이블 */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-600 text-white px-3 py-1 rounded-full text-sm shadow-sm">
        덱 & 오픈카드
      </div>
    </div>
  );
};

const GameBoard = ({ playerCount = 4, onStartGame, gameData }) => {
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleStartGame = () => {
    setIsGameStarted(true);
    if (onStartGame) {
      onStartGame();
    }
  };

  if (!isGameStarted) {
    return (
      <div className="relative w-full h-[800px] max-w-[1600px] mx-auto bg-green-50 rounded-3xl flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">바퀴벌레 포커</h2>
          <p className="text-gray-600">현재 {playerCount}인 게임</p>
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
      <div className="relative w-full h-[800px] max-w-[1600px] mx-auto bg-green-50 rounded-3xl flex items-center justify-center">
        <div className="text-xl text-gray-600">게임 데이터 로딩 중...</div>
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
      <div className="relative w-full h-[800px] max-w-[1600px] mx-auto bg-green-50 rounded-3xl">
        {/* 상단 플레이어 영역 */}
        {playerCount === 2 ? (
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <OpponentArea
              playerNumber={2}
              penaltyCards={userTableCards[players[1]] || []}
              handCards={playerCards[players[1]] || []}
            />
          </div>
        ) : (
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            {playerCount === 3 ? (
              <>
                <OpponentArea
                  playerNumber={2}
                  penaltyCards={userTableCards[players[1]] || []}
                  handCards={playerCards[players[1]] || []}
                />
                <OpponentArea
                  playerNumber={3}
                  penaltyCards={userTableCards[players[2]] || []}
                  handCards={playerCards[players[2]] || []}
                />
                <div className="w-64" />
              </>
            ) : (
              <>
                <OpponentArea
                  playerNumber={2}
                  penaltyCards={userTableCards[players[1]] || []}
                  handCards={playerCards[players[1]] || []}
                />
                <OpponentArea
                  playerNumber={3}
                  penaltyCards={userTableCards[players[2]] || []}
                  handCards={playerCards[players[2]] || []}
                />
                <OpponentArea
                  playerNumber={4}
                  penaltyCards={userTableCards[players[3]] || []}
                  handCards={playerCards[players[3]] || []}
                />
              </>
            )}
          </div>
        )}

        {/* 중앙 덱 영역 */}
        <DeckArea openCard={publicDeck[publicDeck.length - 1]} />

        {/* 내 영역 */}
        <MyArea
          penaltyCards={userTableCards[players[0]] || []}
          handCards={playerCards[players[0]] || []}
        />
      </div>
    </div>
  );
};

// 화상 채팅 UI 컴포넌트 추가
const VideoChat = ({ playerCount }) => {
  return (
    <div
      className="grid gap-2 h-full p-2"
      style={{
        gridTemplateColumns: `repeat(${playerCount}, 1fr)`,
      }}
    >
      {Array(playerCount)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-lg flex items-center justify-center"
          >
            <div className="text-gray-500 text-sm">Player {i + 1}</div>
          </div>
        ))}
    </div>
  );
};

export default GameBoard;
