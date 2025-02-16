import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import seedCardBg from "../../../../../assets/burumabul_images/seedCardBg.jpg";

const SeedCard = ({ cardList, onClose }) => {
  const [flippedCards, setFlippedCards] = useState({});
  const containerRef = useRef(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // 컴포넌트가 마운트되었을 때만 Portal 사용
  }, []);

  const [cards, setCards] = useState(cardList);

  useEffect(() => {
    setCards(cardList);
  }, [cardList]);

  const handleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <button
        className="absolute top-6 right-6 bg-gray-800 rounded-full p-3 shadow-lg hover:bg-gray-700 transition-all duration-300 hover:scale-110 active:scale-95"
        onClick={onClose}
      >
        <X size={24} className="text-white" />
      </button>

      <motion.div
        ref={containerRef}
        className="flex gap-6 p-8 overflow-x-auto scrollbar-hide w-[85vw] max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className="relative w-52 h-80 perspective-1000 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative w-full h-full cursor-pointer"
              animate={{ rotateY: flippedCards[card.id] ? 180 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => handleFlip(card.id)}
            >
              <motion.div
                className="absolute w-full h-full bg-gray-900 rounded-2xl p-8 flex flex-col items-center justify-center shadow-xl border border-cyan-500/50"
                style={{
                  backfaceVisibility: "hidden",
                  backgroundImage: `url(${seedCardBg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent text-center leading-tight">
                  {card.name}
                </h2>
                <p className="text-gray-300 text-center text-sm mt-4 opacity-80">
                  Click to flip!
                </p>
              </motion.div>

              <motion.div
                className="absolute w-full h-full bg-gray-800 rounded-2xl p-8 flex flex-col gap-6 items-center justify-center shadow-xl border border-cyan-500/50"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="text-white text-center space-y-4">
                  <h3 className="font-semibold text-lg text-cyan-400">
                    건설 비용
                  </h3>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-3xl font-bold text-cyan-300">
                      {card.baseConstructionCost}
                      <span className="text-xl ml-2 font-normal text-gray-400">
                        마불
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
  return isMounted && document.getElementById("modal-root")
    ? ReactDOM.createPortal(modalContent, document.getElementById("modal-root"))
    : null;
};

export default SeedCard;

// "seedCount":150000,"baseConstructionCost":80000,"headquartersUsageFee":100000,"baseUsageFee":250000s
