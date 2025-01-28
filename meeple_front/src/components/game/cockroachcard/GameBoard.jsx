import React, { useState, useRef } from 'react';
import { CARD_TYPES } from './constants/cardTypes';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Card = ({ type = null, isBack = false, rotated = false }) => {
  return (
    <div 
      className={`flex-shrink-0 w-16 h-24 rounded-lg ${rotated ? '-rotate-90' : ''} 
        relative group cursor-pointer overflow-hidden`}
    >
      <img 
        src={isBack ? '/src/assets/image/cockroachpoker/CardBack.svg' 
          : `/src/assets/image/cockroachpoker/${type}.svg`} 
        alt={type || 'Card Back'}
        className="w-full h-full object-cover"
      />
      {!isBack && type && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100">
          <span className="text-sm text-white">{type.replace('Card', '')}</span>
        </div>
      )}
    </div>
  );
};

const PenaltyCardStack = ({ type, count = 3 }) => {
  const baseType = type.startsWith('King') ? type.replace('King', '') : type;
  
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
            width: '100%',
            height: '100%'
          }}
        >
          <Card type={type} />
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
        <div className="flex gap-2 pb-8 px-4">
          {children}
        </div>
      </div>

      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white/100 rounded-full p-1.5 shadow-lg z-10 translate-x-1/2"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-100"/>
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent opacity-0 group-hover:opacity-100"/>
    </div>
  );
};

const OpponentArea = ({ playerNumber, penaltyCards = [], handCards = [] }) => {
  const groupedPenaltyCards = penaltyCards.reduce((acc, card) => {
    const baseType = card.type.startsWith('King') ? card.type.replace('King', '') : card.type;
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
            />
          ))}
        </DraggableArea>
        <DraggableArea maxWidth="w-64">
          {handCards.map((card, i) => (
            <Card 
              key={i} 
              isBack={true}
              type={null}
            />
          ))}
        </DraggableArea>
      </div>
    </div>
  );
};

const MyArea = ({ penaltyCards = [], handCards = [] }) => {
  const groupedPenaltyCards = penaltyCards.reduce((acc, card) => {
    const baseType = card.type.startsWith('King') ? card.type.replace('King', '') : card.type;
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
          />
        ))}
      </DraggableArea>
      <DraggableArea maxWidth="w-full">
        {handCards.map((card, i) => (
          <Card 
            key={i} 
            isBack={false} 
            type={card.type}
          />
        ))}
      </DraggableArea>
    </div>
  );
};

const DeckArea = () => {
  const [openCard, setOpenCard] = useState(CARD_TYPES.COCKROACH);

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
                zIndex: index
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
          <Card type={openCard} />
        </div>
      </div>

      {/* 설명 레이블 */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-600 text-white px-3 py-1 rounded-full text-sm shadow-sm">
        덱 & 오픈카드
      </div>
    </div>
  );
};

const GameBoard = ({ playerCount = 4 }) => {
  const baseCardTypes = ['BAT', 'COCKROACH', 'FLY', 'RAT', 'SCORPION', 'STINKBUG', 'TOAD'];
  
  const cardCounts = baseCardTypes.reduce((acc, type) => {
    acc[CARD_TYPES[type]] = 7;
    acc[CARD_TYPES[`KING_${type}`]] = 1;
    return acc;
  }, {});

  const penaltyCardTypes = Object.entries(cardCounts)
    .map(([type]) => type);
  
  const generateRandomPenaltyCards = (count) => {
    const cards = [];
    const typeCount = {};
    
    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let card;
      
      do {
        const randomType = penaltyCardTypes[Math.floor(Math.random() * penaltyCardTypes.length)];
        const randomCount = Math.floor(Math.random() * 2) + 1;
        
        const currentTypeCount = (typeCount[randomType] || 0) + randomCount;
        
        if (currentTypeCount < 3) {
          card = { type: randomType, count: randomCount };
          typeCount[randomType] = currentTypeCount;
        }
        
        attempts++;
      } while (!card && attempts < 10);
      
      if (card) {
        cards.push(card);
      }
    }
    
    return cards;
  };

  const samplePenaltyCards = generateRandomPenaltyCards(4);
  const player2PenaltyCards = generateRandomPenaltyCards(3);
  const player3PenaltyCards = generateRandomPenaltyCards(3);
  const player4PenaltyCards = generateRandomPenaltyCards(3);

  const allCardTypes = Object.values(CARD_TYPES);
  const sampleHandCards = Array(15).fill(null).map(() => ({
    type: allCardTypes[Math.floor(Math.random() * allCardTypes.length)]
  }));

  return (
    
    <div className="p-4">
      <div className="relative w-full h-[800px] max-w-[1600px] mx-auto bg-green-50 rounded-3xl">
        {/* 상단 플레이어 영역 */}
        {playerCount === 2 ? (
          // 2인 게임일 때는 중앙 정렬
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <OpponentArea 
              playerNumber={2}
              penaltyCards={player2PenaltyCards}
              handCards={sampleHandCards.slice(0, 8)}
            />
          </div>
        ) : (
          // 3-4인 게임일 때는 균등 배치
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            {playerCount === 3 ? (
              // 3인용 레이아웃
              <>
                <OpponentArea 
                  playerNumber={3}
                  penaltyCards={player3PenaltyCards}
                  handCards={sampleHandCards.slice(0, 10)}
                />
                <OpponentArea 
                  playerNumber={2}
                  penaltyCards={player2PenaltyCards}
                  handCards={sampleHandCards.slice(0, 8)}
                />
                <div className="w-64" /> {/* 빈 공간을 만들어서 간격 맞추기 */}
              </>
            ) : (
              // 4인용 레이아웃
              <>
                <OpponentArea 
                  playerNumber={3}
                  penaltyCards={player3PenaltyCards}
                  handCards={sampleHandCards.slice(0, 10)}
                />
                <OpponentArea 
                  playerNumber={2}
                  penaltyCards={player2PenaltyCards}
                  handCards={sampleHandCards.slice(0, 8)}
                />
                <OpponentArea 
                  playerNumber={4}
                  penaltyCards={player4PenaltyCards}
                  handCards={sampleHandCards.slice(0, 12)}
                />
              </>
            )}
          </div>
        )}

        {/* 중앙 덱 영역 */}
        <DeckArea />

        {/* 내 영역 */}
        <MyArea 
          penaltyCards={samplePenaltyCards}
          handCards={sampleHandCards}
        />
      </div>
    </div>
  );
};

export default GameBoard;