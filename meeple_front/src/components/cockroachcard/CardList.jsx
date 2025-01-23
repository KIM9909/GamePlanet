import React from "react";
import Card from "./Card";
import styled from 'styled-components';

const ListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr); // 7개의 동일한 크기의 열
  gap: 1rem; // 카드 사이의 간격
  padding: 1rem;
  max-width: 1200px; // 전체 너비 제한 (필요에 따라 조정)
  margin: 0 auto; // 중앙 정렬
`;

const CardList = ({ cards, onCardClick }) => {
  return (
    <ListContainer>
      {cards.map((card, index) => (
        <Card
          key={index}
          type={card.type}
          isFlipped={card.isFlipped}
          onClick={() => onCardClick(index)}
        />
      ))}
    </ListContainer>
  );
};

export default CardList;