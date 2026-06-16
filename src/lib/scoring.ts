export function calculatePoints(
  prediction: { homeScore: number; awayScore: number },
  game: { homeScore: number; awayScore: number }
): number {
  if (
    prediction.homeScore === game.homeScore &&
    prediction.awayScore === game.awayScore
  ) {
    return 3
  }

  const predResult = Math.sign(prediction.homeScore - prediction.awayScore)
  const gameResult = Math.sign(game.homeScore - game.awayScore)

  if (predResult === gameResult) return 1

  return 0
}
