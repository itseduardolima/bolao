'use client'

import { useQuery } from '@tanstack/react-query'
import type { GameStatus } from '@/types'

type LiveData = {
  status: GameStatus
  homeScore: number | null
  awayScore: number | null
}

type LiveScoreProps = {
  gameId: string
  initialStatus: GameStatus
  initialHomeScore: number | null
  initialAwayScore: number | null
}

export default function LiveScore({
  gameId,
  initialStatus,
  initialHomeScore,
  initialAwayScore,
}: LiveScoreProps) {
  const { data } = useQuery<LiveData>({
    queryKey: ['game', gameId, 'live'],
    queryFn: () =>
      fetch(`/api/games/${gameId}/live`).then((r) => r.json()),
    initialData: {
      status: initialStatus,
      homeScore: initialHomeScore,
      awayScore: initialAwayScore,
    },
    refetchInterval: (query) =>
      query.state.data?.status === 'LIVE' ? 30_000 : false,
    enabled: true,
  })

  const score = data ?? { homeScore: initialHomeScore, awayScore: initialAwayScore }

  if (score.homeScore === null || score.awayScore === null) return null

  return (
    <span className="font-barlow text-[40px] font-black leading-none text-accent">
      {score.homeScore} × {score.awayScore}
    </span>
  )
}
