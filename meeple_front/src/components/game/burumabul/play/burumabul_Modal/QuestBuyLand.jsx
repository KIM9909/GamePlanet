import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const QuestBuyLand = ({ setIsBuyLand, onClose, cardId, cardInfo }) => {
  const [flippedCards, setFlippedCards] = useState({});
  const [cardInfoma, setCardInfoma] = useState(null);

  useEffect(() => {
    setCardInfoma(cardId);
  }, [cardInfo]);

  const handleYes = () => {
    setIsBuyLand(true);
    onClose();
  };

  const handleNo = () => {
    setIsBuyLand(false);
    onClose();
  };

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
            className="relative bg-white w-[450px] h-96 p-4 rounded-xl shadow-lg"
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
                className="absolute w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-6 flex flex-col items-center justify-center shadow-xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <h2 className="text-2xl font-bold text-indigo-700 mb-4">
                  {cardInfo.name}
                </h2>
                <p className="text-gray-700 text-center mb-6">
                  {cardInfo.description}
                </p>
                <p className="text-indigo-500 mt-4 animate-bounce">
                  Click to flip!
                </p>
              </motion.div>

              {/* 뒷면 */}
              <motion.div
                className="absolute w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 flex flex-col gap-4 items-center justify-center shadow-xl"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="bg-white bg-opacity-90 p-6 rounded-lg w-full">
                  <div className="space-y-3">
                    <p className="text-indigo-800 font-medium">
                      땅 매입 비용:{" "}
                      <span className="text-gray-700">
                        {cardInfo.seedCount}
                      </span>
                    </p>
                    <p className="text-indigo-800 font-medium">
                      기지 건설 비용:{" "}
                      <span className="text-gray-700">
                        {cardInfo.baseConstructionCost} 마불
                      </span>
                    </p>
                    <p className="text-indigo-800 font-medium">
                      본부 사용료:{" "}
                      <span className="text-gray-700">
                        {cardInfo.headquartersUsageFee} 마불
                      </span>
                    </p>
                    <p className="text-indigo-800 font-medium">
                      기지 사용료:{" "}
                      <span className="text-gray-700">
                        {cardInfo.baseUsageFee} 마불
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 w-full">
                  <p className="text-white text-center text-lg font-medium mb-4">
                    땅을 구매하시겠습니까?
                  </p>
                  <div className="flex justify-around gap-4">
                    <button
                      className="w-1/2 bg-gray-500 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:bg-gray-600 hover:shadow-lg transform hover:-translate-y-1"
                      onClick={handleNo}
                    >
                      안 살래요
                    </button>
                    <button
                      className="w-1/2 bg-indigo-600 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-1"
                      onClick={handleYes}
                    >
                      살래요
                    </button>
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

export default QuestBuyLand;
