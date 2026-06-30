/**
 * O placar do tempo normal (90 min) — a base da pontuação — fica travado assim
 * que o jogo termina OU passa do tempo normal (prorrogação/pênaltis). A partir
 * daí já dá pra pontuar, mesmo com o jogo ainda em andamento, porque gols na
 * prorrogação e pênaltis não contam. `duration` vem da football-data.org.
 */
export function isRegularTimeLocked(
  status: string,
  duration: string | null | undefined
): boolean {
  return (
    status === 'FINISHED' ||
    duration === 'EXTRA_TIME' ||
    duration === 'PENALTY_SHOOTOUT'
  )
}

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
