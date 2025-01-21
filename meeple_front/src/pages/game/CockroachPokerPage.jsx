import { Card, CardList, CARD_TYPES } from '../../components/cockroachcard';
import { useState } from 'react';
import GameBoard from '../../components/cockroachcard/GameBoard';

const GamePage = () => {
    const [cards, setCards] = useState([
        { type: 'BAT', isFlipped: false },
        { type: 'COCKROACH', isFlipped: false },
        { type: 'FLY', isFlipped: false },
        { type: 'RAT', isFlipped: false },
        { type: 'SCORPION', isFlipped: false },
        { type: 'STINKBUG', isFlipped: false },
        { type: 'TOAD', isFlipped: false },
        { type: 'KING_BAT', isFlipped: false },
        { type: 'KING_COCKROACH', isFlipped: false },
        { type: 'KING_FLY', isFlipped: false },
        { type: 'KING_RAT', isFlipped: false },
        { type: 'KING_SCORPION', isFlipped: false },
        { type: 'KING_STINKBUG', isFlipped: false },
        { type: 'KING_TOAD', isFlipped: false },
        { type: 'JOCKER', isFlipped: false },
        { type: 'BLACK' , isFlipped: false}
    ]);

    

  const handleCardClick = (index) => {
    setCards(cards.map((card, i) => 
      i === index ? { ...card, isFlipped: !card.isFlipped } : card
    ));
  };

  return (
    <div>
      <CardList 
        cards={cards} 
        onCardClick={handleCardClick}
      />
      <GameBoard/>
    </div>
  );
};

export default GamePage