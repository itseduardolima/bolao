'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowsClockwise } from '@phosphor-icons/react'
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
  showSyncButton?: boolean
}

export default function LiveScore({
  gameId,
  initialStatus,
  initialHomeScore,
  initialAwayScore,
  showSyncButton = true,
}: LiveScoreProps) {
  const [syncing, setSyncing] = useState(false)
  const queryClient = useQueryClient()

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

  const handleSync = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSyncing(true)
    try {
      await fetch('/api/games/sync', { method: 'POST' })
      await queryClient.invalidateQueries({ queryKey: ['game', gameId, 'live'] })
    } finally {
      setSyncing(false)
    }
  }

  if (score.homeScore === null || score.awayScore === null) return null

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-barlow text-[40px] font-black leading-none text-accent">
        {score.homeScore} × {score.awayScore}
      </span>
      {showSyncButton && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1 font-inter text-xs text-secondary transition-colors hover:text-accent disabled:opacity-50"
        >
          <ArrowsClockwise
            size={12}
            weight="bold"
            className={syncing ? 'animate-spin' : ''}
          />
          {syncing ? 'Sincronizando...' : 'Atualizar'}
        </button>
      )}
    </div>
  )
}
