import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const QuestBuildBase = ({ setIsBuildBase, onClose, cardId, cardInfo }) => {
  const [cardInfoma, setCardInfoma] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    setCardInfoma(cardId);
  }, [cardInfo]);

  const handleYes = () => {
    setIsBuildBase(true);
    onClose();
  };
  const handleNo = () => {
    setIsBuildBase(false);
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
            className="relative bg-gray-900 border-2 border-cyan-500 w-[550px] h-[450px] p-4 rounded-xl shadow-lg"
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
                className="absolute w-full h-full bg-gray-700 border-2 border-cyan-500 bg-opacity-80 rounded-xl p-6 flex flex-col items-center justify-center shadow-xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <h2 className="text-2xl font-bold text-cyan-500 mb-4">
                  {cardInfo.name}
                </h2>
                <p className="text-white text-center mb-6">
                  {cardInfo.description}
                </p>
                <p className="text-cyan-500  mt-4 animate-bounce">
                  Click to flip!
                </p>
              </motion.div>

              {/* 뒷면 */}
              <motion.div
                className="absolute w-full h-full bg-cyan-400 bg-opacity-70 rounded-xl p-6 flex flex-col gap-4 items-center justify-center shadow-xl"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="bg-white bg-opacity-90 p-6 rounded-lg w-full">
                  <div className="space-y-3 flex flex-col justify-center items-center">
                    <p className="text-cyan-800 font-medium">
                      땅 매입 비용:{" "}
                      <span className="text-gray-700">
                        {cardInfo.seedCount}
                      </span>
                    </p>
                    <p className="text-cyan-800 font-medium">
                      기지 건설 비용:{" "}
                      <span className="text-gray-700">
                        {cardInfo.baseConstructionCost} 마불
                      </span>
                    </p>
                    <p className="text-cyan-800 font-medium">
                      본부 사용료:{" "}
                      <span className="text-gray-700">
                        {cardInfo.headquartersUsageFee} 마불
                      </span>
                    </p>
                    <p className="text-cyan-800 font-medium">
                      기지 사용료:{" "}
                      <span className="text-gray-700">
                        {cardInfo.baseUsageFee} 마불
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 w-full">
                  <p className="text-white text-center text-lg font-medium mb-4">
                    기지를 건설하시겠습니까?
                  </p>
                  <div className="flex justify-around gap-4">
                    {/* <button
                      className="w-1/2 bg-gray-500 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:bg-gray-600 hover:shadow-lg transform hover:-translate-y-1"
                      onClick={handleNo}
                    >
                      안 할래요
                    </button> */}
                    <button
                      className="w-1/2 bg-cyan-400 border-2 border-white text-white px-6 py-2 rounded-lg transition-all duration-300 hover:bg-cyan-700 hover:shadow-lg transform hover:-translate-y-1"
                      onClick={handleYes}
                    >
                      할래요
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

export default QuestBuildBase;
