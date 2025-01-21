import React from "react";
import Card from "./Card";

const CardList = ({ cards, onCardClick}) => {
    return (
        <div>
            {cards.map((card, index) => (
                <Card
                    key={`${card.type}-${index}`}
                    type={card.type}
                    isFlipped={card.isFlipped}
                    onClick={() => onCardClick(index)}
                    isDraggable={card.isDraggable}
                />
            ))}
        </div>
    )
}

export default CardList;