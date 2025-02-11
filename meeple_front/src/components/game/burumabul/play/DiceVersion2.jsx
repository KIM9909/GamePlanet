import React, { useState, useEffect } from "react";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

const DiceVersion2 = ({
  setOnRollDice,
  setFirstDice,
  setSecondDice,
  onComplete,
}) => {
  const [diceValues, setDiceValues] = useState([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [finalValues, setFinalValues] = useState(null);

  const diceIcons = {
    1: Dice1,
    2: Dice2,
    3: Dice3,
    4: Dice4,
    5: Dice5,
    6: Dice6,
  };

  useEffect(() => {
    if (!isRolling && finalValues) {
      // 주사위 굴리기가 끝났을 때 최종 값을 부모 컴포넌트에 전달
      setDiceValues(finalValues);
      setFirstDice(finalValues[0]);
      setSecondDice(finalValues[1]);
      if (onComplete) {
        onComplete(finalValues[0] + finalValues[1]);
      }
      setFinalValues(null);
    }
  }, [isRolling, finalValues, setFirstDice, setSecondDice, onComplete]);

  const rollDice = () => {
    setIsRolling(true);
    setOnRollDice(true);

    // 최종 주사위 값을 미리 생성
    const firstDice = Math.floor(Math.random() * 6) + 1;
    const secondDice = Math.floor(Math.random() * 6) + 1;
    setFinalValues([firstDice, secondDice]);

    // 애니메이션 동안 주사위 값을 랜덤하게 변경
    const rollInterval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
    }, 100);

    // 1초 후에 최종 결과 확정
    setTimeout(() => {
      clearInterval(rollInterval);
      setIsRolling(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex gap-8">
        {diceValues.map((value, index) => {
          const DiceIcon = diceIcons[value];
          return (
            <div
              key={index}
              className={`transform transition-all duration-200 ${
                isRolling ? "animate-bounce" : ""
              }`}
            >
              <DiceIcon
                size={64}
                className={`text-purple-600 ${isRolling ? "animate-spin" : ""}`}
              />
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={rollDice}
          disabled={isRolling}
          className="px-6 py-2 bg-purple-500 text-white rounded-full font-medium 
                   hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed
                   transition-colors duration-200"
        >
          {isRolling ? "굴리는 중..." : "주사위 굴리기"}
        </button>
      </div>
    </div>
  );
};

export default DiceVersion2;
