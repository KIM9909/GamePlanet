const ANIMAL_ORDER = [
  "Bat",
  "Rat",
  "Fly",
  "Cockroach",
  "Scorpion",
  "Toad",
  "Stinkbug",
  "Joker",
  "Black",
];

export const sortCards = (cards) => {
  return [...cards].sort((a, b) => {
    const typeA = a.type.replace("King", "");
    const typeB = b.type.replace("King", "");

    if (typeA === typeB) {
      return a.type.includes("King") ? 1 : -1;
    }

    return ANIMAL_ORDER.indexOf(typeA) - ANIMAL_ORDER.indexOf(typeB);
  });
};

export const sortPenaltyGroups = (groups) => {
  return Object.values(groups).sort((a, b) => {
    const typeA = a.type.replace("King", "");
    const typeB = b.type.replace("King", "");
    return ANIMAL_ORDER.indexOf(typeA) - ANIMAL_ORDER.indexOf(typeB);
  });
};

export const getKoreanName = (type) => {
  const nameMap = {
    Bat: "박쥐",
    Rat: "쥐",
    Fly: "파리",
    Cockroach: "바퀴벌레",
    Scorpion: "전갈",
    Toad: "두꺼비",
    Stinkbug: "노린재",
    Joker: "조커",
    Black: "블랙",
  };

  if (type.startsWith("King")) {
    const baseName = type.replace("King", "");
    return `${nameMap[baseName]}:킹`;
  }

  return nameMap[type] || type;
};

// 카드 정보를 일관되게 가져오는 함수 추가
export const getCardInfo = (card, shouldShowFront = true) => {
  if (!card) return null;
  
  return {
    type: shouldShowFront ? card.type : null,
    isRoyal: card.royal || card.isRoyal, // 두 속성 모두 확인
    isBack: !shouldShowFront
  };
};

// 카드 데이터 정규화 함수 추가
export const normalizeCardData = (card) => {
  if (!card) return null;
  
  return {
    type: card.type,
    royal: card.royal || card.isRoyal, // 항상 royal로 통일
    isRoyal: card.royal || card.isRoyal // 백워드 호환성을 위해 유지
  };
};

export default ANIMAL_ORDER;