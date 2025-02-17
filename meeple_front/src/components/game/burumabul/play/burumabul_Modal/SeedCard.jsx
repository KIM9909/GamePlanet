import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { X, Building2, Coins, Hotel, Home } from "lucide-react";
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

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="bg-gray-900/50 rounded-lg p-3 backdrop-blur-sm border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Icon className="text-cyan-400" size={16} />
        <h3 className="font-medium text-cyan-400 text-sm">{label}</h3>
      </div>
      <p className=" flex items-center justify-center text-lg font-bold text-white">
        {value.toLocaleString()}
        <span className="text-xs ml-1 font-normal text-cyan-300/70">마불</span>
      </p>
    </div>
  );

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
              {/* 앞면 */}
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

              {/* 뒷면 */}
              <motion.div
                className="absolute w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl border border-cyan-500/50 overflow-hidden"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="h-full p-3 overflow-y-auto thin-scrollbar">
                  <div className="space-y-2">
                    <h2 className="text-base font-bold text-cyan-400 text-center text-lg mb-3 bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                      {card.name}
                    </h2>

                    <InfoItem
                      icon={Building2}
                      label="땅 매입비"
                      value={card.seedCount}
                    />
                    <InfoItem
                      icon={Coins}
                      label="건설 비용"
                      value={card.baseConstructionCost}
                    />
                    <InfoItem
                      icon={Hotel}
                      label="본부 사용료"
                      value={card.headquartersUsageFee}
                    />
                    <InfoItem
                      icon={Home}
                      label="기지 사용료"
                      value={card.baseUsageFee}
                    />
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
