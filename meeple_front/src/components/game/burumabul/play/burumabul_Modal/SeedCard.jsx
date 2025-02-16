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
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      {/* 닫기 버튼 */}
      <button
        className="absolute top-6 right-6 bg-white/90 rounded-full p-2.5 shadow-lg hover:bg-white transition-all duration-300 hover:scale-110 active:scale-95"
        onClick={onClose}
      >
        <X size={24} className="text-gray-700" />
      </button>

      {/* 카드 리스트 컨테이너 */}
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
            {/* 카드 회전 애니메이션 */}
            <motion.div
              className="relative w-full h-full cursor-pointer"
              animate={{ rotateY: flippedCards[card.id] ? 180 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => handleFlip(card.id)}
            >
              {/* 앞면 */}
              <motion.div
                className="absolute w-full h-full bg-gradient-to-br rounded-2xl p-8 flex flex-col items-center justify-center shadow-xl border border-emerald-200/20"
                style={{
                  backfaceVisibility: "hidden",
                  backgroundImage: `url(${seedCardBg})`,
                }}
              >
                <h2 className="text-2xl font-bold text-white text-center mb-4 leading-tight">
                  {card.name}
                </h2>
                <p className="text-emerald-100 text-center text-sm mt-4 opacity-80">
                  Click!
                </p>
              </motion.div>

              {/* 뒷면 */}
              <motion.div
                className="absolute w-full h-full bg-gradient-to-br bg-gray-600 rounded-2xl p-8 flex flex-col gap-6 items-center justify-center shadow-xl border border-teal-200/20"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="text-white text-center space-y-4">
                  <h3 className="font-semibold text-lg text-teal-100">
                    건설 비용
                  </h3>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-3xl font-bold">
                      {card.baseConstructionCost}
                      <span className="text-xl ml-2 font-normal text-teal-100">
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

// "seedCount":150000,"baseConstructionCost":80000,"headquartersUsageFee":100000,"baseUsageFee":250000
