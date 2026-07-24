export type Difficulty = {
  speed: number;
  perfectZone: number;
  goodZone: number;
};

export function getDifficulty(score: number): Difficulty {
  if (score < 5) {
    return {
      speed: 2,
      perfectZone: 5,
      goodZone: 15,
    };
  }

  if (score < 15) {
    return {
      speed: 3,
      perfectZone: 4,
      goodZone: 12,
    };
  }

  return {
    speed: 4,
    perfectZone: 3,
    goodZone: 10,
  };
}
