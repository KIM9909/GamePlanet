import React, {Suspense} from 'react';
import {motion} from 'framer-motion';
import { CARD_TYPES } from './constants/cardTypes';
import styled from 'styled=components';
import tw from 'twin.macro';

const CardContainer = styled(motion.div)`${tw`relative w-24 h-36`}perspective: 1000px;`;
const CardInner = styled(motion.div)`${tw`relative w-full h-full`}transform-style: preserve-3d;`;
const CardFace = styled(motion.div)`${tw`absolute w-full h-full`}backface-visibility: hidden;
    &.back {transform: rotateY(180deg);}`;


const Card = ({type, isFlipped, onClick, isDraggable = false }) => {
    const CardFront = React.lazy(() => import(`/src/assets/image/cockroachpoker/${CARD_TYPES[type]}.svg`));
    const CardBack = React.lazy(() => import('/src/assets/image/cockroachpoker/CardBack.svg'));

    return (
        <CardContainer
            whileHover={{ scale: 1.05}}
            whileTap={{ scale: 0.95}}
            drag={isDraggable}
            dragConstraints={{ left : 0, right : 0, top : 0, bottom:0 }}
        >
            <CardInner
                animate={{ rotateY : isFlipped ? 180 : 0}}
                transition={{ duration : 0.6 , type : "spring"}}
                onClick={onClick}
            >
                <CardFace>
                    <Suspense fallback={<div>로딩중...</div>}>
                        <CardFront/>
                    </Suspense>
                </CardFace>
                <CardFace calssName="back">
                    <Suspense fallback={<div>로딩중...</div>}>
                        <CardBack/>
                    </Suspense>
                </CardFace>
            </CardInner>
        </CardContainer>
    );
    
};

export default Card;