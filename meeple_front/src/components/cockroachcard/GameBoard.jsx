import React, { useState } from 'react';

const Card = ({ isBack = false, rotated = false }) => (
  <div 
    className={`w-16 h-24 rounded-lg ${isBack ? 'bg-blue-600' : 'bg-white border-2 border-gray-300'} 
    ${rotated ? '-rotate-90' : ''}`}
  />
);

const PenaltyCardStack = ({ count = 3 }) => (
  <div className="relative w-16 h-24">
    {Array.from({ length: count }).map((_, index) => (
      <div 
        key={index} 
        className="absolute w-16 h-24 bg-white border-2 border-gray-300 rounded-lg"
        style={{ 
          top: `${index * 20}px`,
          left: `${index * 5}px`,
          zIndex: index 
        }}
      />
    ))}
  </div>
);

const GameBoard = () => {
  const [playerCount, setPlayerCount] = useState(4);

  // 플레이어 영역 컴포넌트
  const PlayerArea = ({ position, isMe = false }) => {
    const positionClasses = {
      'bottomLeft': 'bottom-8 left-8',
      'topLeft': 'top-8 left-8',
      'topRight': 'top-8 right-8',
      'bottomRight': 'bottom-8 right-8'
    };

    return (
      <div className={`absolute ${positionClasses[position]}`}>
        <div className="space-y-8">
          {/* 벌칙 카드 영역 */}
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <PenaltyCardStack key={i} count={i} />
            ))}
          </div>
          {/* 보유 카드 영역 */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} isBack={!isMe} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 중앙 덱 영역
  const DeckArea = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="flex gap-16 items-center">
        {/* 덱 */}
        <div className="relative">
          {[4, 3, 2, 1, 0].map((index) => (
            <div 
              key={index}
              className="absolute w-16 h-24 bg-blue-600 rounded-lg"
              style={{ 
                top: `${-index * 1}px`, 
                left: `${-index * 1}px`
              }}
            />
          ))}
        </div>
        {/* 오픈 카드 */}
        <Card />
      </div>
    </div>
  );

  const renderPlayers = () => {
    const positions = [];
    // 내 자리는 항상 bottomLeft
    positions.push(<PlayerArea key="me" position="bottomLeft" isMe={true} />);
    
    if (playerCount >= 2) {
      positions.push(<PlayerArea key="p2" position="topRight" />);
    }
    if (playerCount >= 3) {
      positions.push(<PlayerArea key="p3" position="topLeft" />);
    }
    if (playerCount >= 4) {
      positions.push(<PlayerArea key="p4" position="bottomRight" />);
    }
    return positions;
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-center gap-4">
        <button 
          onClick={() => setPlayerCount(2)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          2인
        </button>
        <button 
          onClick={() => setPlayerCount(3)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          3인
        </button>
        <button 
          onClick={() => setPlayerCount(4)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          4인
        </button>
      </div>

      <div className="relative w-full h-[700px] max-w-6xl mx-auto">
        {renderPlayers()}
        <DeckArea />
      </div>
    </div>
  );
};

export default GameBoard;