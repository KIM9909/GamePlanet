import { Card, CardList, CARD_TYPES } from '../../components/cockroachcard';
import { useState } from 'react';

const GamePage = () => {
  const [cards, setCards] = useState([
    { type: 'BAT', isFlipped: false },
    { type: 'COCKROACH', isFlipped: true },
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
    </div>
  );
};