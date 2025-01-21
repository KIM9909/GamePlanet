import { retry } from "@reduxjs/toolkit/query";
import React, { useEffect, useState } from "react";

const TravelMap = () => {
  // cities 배열
  const cities = [
    "화성", "텔레파시 카드", "목성", "토성", "뉴런의 골짜기", "천왕성", "텔레파시 카드", "해왕성", "명왕성",
    "타임머신", "궁수자리", "물병자리", "텔레파시 카드", "쌍둥이 자리", "직녀성", "시리우스", "UFO", "헤라클레스 자리", "카시오페아 자리",
    "공포의 블랙홀", "백조자리", "처녀자리", "텔레파시 카드", "천칭자리", "뉴런의 골짜기", "오리온 자리", "전갈 자리", "큰곰자리",
    "텔레파시 카드", "우주조난기지", "황소자리", "사자자리", "텔레파시 카드", "안드로메다 자리", "견우성", "페가수스 자리", "헬리 혜성", "수성", "금성", "지구 Start",
  ];

  
  const size = 11; // 각 변의 칸 수
  const totalCells = size * 4 - 4; // 전체 칸 개수
  const cells = Array.from({ length: totalCells }, (_, i) => i); // 칸 번호
  const [currentPosition, setCurrentPosition] = useState(39); // 현재 말 위치
  const [isFirstMove, setIsFirstMove] = useState(true)


  // 칸 스타일
  const cellClass =
    "flex justify-center items-center border border-gray-400 text-xs h-20 w-20 bg-white relative";

  // 보드판 스타일
  const boardClass = "flex flex-col";

  // 말 이동 함수
  const moveToken = () => {
    setCurrentPosition((prev) => {
      if (isFirstMove) {
        setIsFirstMove(false);
        return 0
      } else {
        return (prev + 1) % totalCells;
      }
    });
  };


  // 칸별 내용 생성
  const renderCell = (index) => {
    const isHighlight = index === currentPosition;

    return (
      <div key={index} className={cellClass}>
        {isHighlight && (
          <div className="absolute w-6 h-6 bg-red-500 rounded-full"></div>
        )}
        <span className="text-[10px]">{cities[index]}</span>
      </div>
    )
  };

  const topRow = cells.slice(size-2, size * 2 - 2).map(renderCell);
  const rightColumn = cells.slice(size * 2 - 2, size * 3 - 4).map(renderCell);
  const bottomRow = cells.slice(size * 3 - 4, totalCells).reverse().map(renderCell);
  const leftColumn = cells.slice(0, size-2).reverse().map(renderCell);

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-2xl font-bold mb-5">부루마불 보드</h1>
      <div className={boardClass}>
        {/* 상단 줄 */}
        <div className="flex">{topRow}</div>
        {/* 중간 부분 */}
        <div className="flex">
          {/* 왼쪽 열 */}
          <div className="flex flex-col">
            {leftColumn}
          </div> 
          {/* 중앙 빈 공간 */}
          <div className="w-[calc(9*5rem)] h-[calc(9*5rem)] bg-sky-200"></div>
          {/* 오른쪽 열 */}
          <div className="flex flex-col">
            {rightColumn}
          </div>
        </div>
        {/* 하단 줄 */}
        <div className="flex">{bottomRow}</div>
      </div>
      {/* 이동 버튼 */}
      <button
        onClick={moveToken}
        className="mt-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Move Token
      </button>
    </div>
  );
};

export default TravelMap;