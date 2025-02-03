export const ANIMAL_ORDER = [
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
export const getCardInfo = (card, showFront = false) => {
  if (!card) return null;

  // card가 이미 처리된 형식인지 확인
  if (typeof card === 'object' && 'type' in card) {
    return {
      type: card.type,
      isBack: !showFront,
      isRoyal: card.royal
    };
  }

  // 문자열인 경우 (예: "KingToad")
  const isKingCard = card.startsWith('King');
  const baseType = isKingCard ? card.replace('King', '') : card;

  return {
    type: baseType,  // "Toad"와 같은 기본 타입
    isBack: !showFront,
    isRoyal: isKingCard  // King 접두사가 있으면 true
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
