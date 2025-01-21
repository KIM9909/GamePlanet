import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { CARD_TYPES } from './constants/cardTypes';
import styled from 'styled-components';

const CardContainer = styled(motion.div)`
  position: relative;
  width: 6rem;
  height: 9rem;
  perspective: 1000px;
`;

const CardInner = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
`;

const CardFace = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  
  & > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  &.back {
    transform: rotateY(180deg);
  }
`;

const Card = ({ type, isFlipped, onClick, isDraggable = false }) => {
    return (
        <CardContainer
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            drag={isDraggable}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        >
            <CardInner
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                onClick={onClick}
            >
                <CardFace>
                    <img 
                        src={`/src/assets/image/cockroachpoker/${CARD_TYPES[type]}.svg`} 
                        alt={`${type} card front`} 
                    />
                </CardFace>
                <CardFace className="back">
                    <img 
                        src="/src/assets/image/cockroachpoker/CardBack.svg" 
                        alt="card back" 
                    />
                </CardFace>
            </CardInner>
        </CardContainer>
    );
};

export default Card;