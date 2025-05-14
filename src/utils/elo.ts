
const K_FACTOR = 32; // Standard K-factor used in Elo calculations

/**
 * Calculate expected score (probability of winning) for player A against player B
 */
export const getExpectedScore = (ratingA: number, ratingB: number): number => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

/**
 * Update ratings based on match outcome
 * @returns [newRatingA, newRatingB]
 */
export const updateRatings = (
  ratingA: number,
  ratingB: number,
  aWon: boolean
): [number, number] => {
  const expectedScoreA = getExpectedScore(ratingA, ratingB);
  const expectedScoreB = getExpectedScore(ratingB, ratingA);
  
  const actualScoreA = aWon ? 1 : 0;
  const actualScoreB = aWon ? 0 : 1;
  
  const newRatingA = Math.round(ratingA + K_FACTOR * (actualScoreA - expectedScoreA));
  const newRatingB = Math.round(ratingB + K_FACTOR * (actualScoreB - expectedScoreB));
  
  return [newRatingA, newRatingB];
};
