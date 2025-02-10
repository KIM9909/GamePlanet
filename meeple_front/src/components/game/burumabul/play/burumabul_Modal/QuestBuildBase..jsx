import React, { useEffect, useState } from "react";

const QuestBuildBase = ({ setIsBuildBase, onClose, cardId, cardInfo }) => {
  const [cardInfoma, setCardInfoma] = useState(null);
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
  return (
    <>
      {cardInfo && (
        <>
          <div className="bg-white w-96 h-96 p-4">
            <div className={`bg-[${cardInfo.color}] p-3 rounded`}>
              <h2 className="text-lg font-bold">{cardInfo.name}</h2>
              <p className="text-gray-700">{cardInfo.description}</p>
              <div className="mt-3">
                <p>땅 매입 비용: {cardInfo.seedCount}</p>
                <p>기지 건설 비용: {cardInfo.baseConstructionCost} 마불</p>
                <p>본부 사용료: {cardInfo.headquartersUsageFee} 마불</p>
                <p>기지 사용료: {cardInfo.baseUsageFee} 마불</p>
              </div>
            </div>

            <div className="mt-4">
              <p>기지를 건설하시겠습니까?</p>
              <div className="flex justify-between mt-2">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={handleNo}
                >
                  안 할래요
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={handleYes}
                >
                  할래요
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default QuestBuildBase;
