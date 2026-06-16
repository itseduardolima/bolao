export type GameStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'

export type Game = {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag: string | null
  awayFlag: string | null
  startsAt: string
  status: GameStatus
  homeScore: number | null
  awayScore: number | null
  phase: string
  groupName: string | null
  venue: string | null
}

export type Prediction = {
  id: string
  gameId: string
  homeScore: number
  awayScore: number
  points: number | null
}

export type RankingEntry = {
  id: string
  nickname: string
  image: string | null
  totalPoints: number
  exactHits: number
  winnerHits: number
  gamesPlayed: number
}

export type GameWithPrediction = Game & {
  prediction: Prediction | null
}
