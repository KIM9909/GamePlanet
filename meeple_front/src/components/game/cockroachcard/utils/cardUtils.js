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
