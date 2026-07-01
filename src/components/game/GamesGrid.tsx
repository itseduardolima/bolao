'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import GameCard from './GameCard'
import type { GameStatus } from '@/types'

type Game = {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag: string | null
  awayFlag: string | null
  startsAt: string
  status: GameStatus
  duration?: string | null
  homeScore: number | null
  awayScore: number | null
  extraTimeHome?: number | null
  extraTimeAway?: number | null
  penaltiesHome?: number | null
  penaltiesAway?: number | null
  phase?: string
}

type Prediction = { homeScore: number; awayScore: number; points: number | null }

// Jogos vêm prontos do server (cacheados e iguais para todos); os palpites são
// buscados no cliente para não amarrar essa página ao cookie de sessão, o que
// permitiria o Next servir o HTML da lista de jogos como shell estático/CDN.
export default function GamesGrid({ games }: { games: Game[] }) {
  const { status } = useSession()
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({})

  const idsKey = games.map((g) => g.id).join(',')

  useEffect(() => {
    setPredictions({})
    if (status !== 'authenticated' || !idsKey) return

    let cancelled = false
    fetch(`/api/predictions?gameIds=${encodeURIComponent(idsKey)}`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (!cancelled) setPredictions(data)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [status, idsKey])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
      {games.map((game) => (
        <GameCard
          key={game.id}
          {...game}
          prediction={predictions[game.id] ?? null}
          isAuthenticated={status === 'authenticated'}
        />
      ))}
    </div>
  )
}
