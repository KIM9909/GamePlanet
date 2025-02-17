import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import drawCardBg from "../../../../../assets/burumabul_images/drawCardBg.jpg";

const PickedCardModal = ({ onClose, cardInfo }) => {
  const [flippedCards, setFlippedCards] = useState({});
  const [cardInfoma, setCardInfoma] = useState(null);

  useEffect(() => {
    setCardInfoma(cardInfo);
  }, [cardInfo]);

  const handleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  return (
    <>
      {cardInfo && (
        <>
          <motion.div
            key={cardInfo.id}
            className="relative bg-gray-900 bg-opacity-80 w-96 h-80 p-4 rounded-lg"
          >
            <motion.div
              className="relative w-full h-full cursor-pointer"
              animate={{ rotateY: flippedCards[cardInfo.id] ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => handleFlip(cardInfo.id)}
            >
              {/* 앞면 */}
              <motion.div
                className="absolute w-full h-full bg-gradient-to-br rounded-xl p-6 flex flex-col items-center justify-center shadow-xl"
                style={{
                  backfaceVisibility: "hidden",
                  backgroundImage: `url(${drawCardBg})`,
                }}
              >
                <h2 className="text-2xl text-cyan-500 font-bold">
                  {cardInfo.name}
                </h2>
                <p className="text-gray-400 mt-8">Click!</p>
              </motion.div>

              {/* 뒷면 */}
              <motion.div
                className="absolute w-full h-full bg-gray-900 border-2 border-cyan-400 rounded-xl p-6 flex flex-col gap-4 items-center justify-center shadow-xl"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="p-3 rounded flex flex-col justify-center items-center">
                  <div className="mt-3">
                    <p className="text-white">{cardInfo.description}</p>
                  </div>
                  <div className="mt-4 w-20 h-8 flex justify-center items-center text-white rounded-lg bg-cyan-400 hover:bg-cyan-700">
                    <button onClick={onClose}>확인</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </>
  );
};

export default PickedCardModal;
