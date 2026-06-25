'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn, formatGameTime } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/Badge'
import PointsBadge from '@/components/ui/PointsBadge'
import type { GameStatus } from '@/types'

// Teto do setTimeout (~24,8 dias). Acima disso o delay estoura e dispara na hora;
// para jogos mais distantes deixamos o status real chegar pelo cron.
const MAX_TIMEOUT_MS = 2_147_483_647

type GameCardProps = {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag: string | null
  awayFlag: string | null
  startsAt: string
  status: GameStatus
  homeScore: number | null
  awayScore: number | null
  phase?: string
  prediction?: { homeScore: number; awayScore: number; points: number | null } | null
  isAuthenticated?: boolean
}

function toCode(name: string): string {
  return name.slice(0, 3).toUpperCase()
}

export default function GameCard({
  id,
  homeTeam,
  awayTeam,
  homeFlag,
  awayFlag,
  startsAt,
  status,
  homeScore,
  awayScore,
  phase,
  prediction,
  isAuthenticated,
}: GameCardProps) {
  const startsAtMs = new Date(startsAt).getTime()

  const [effectiveStatus, setEffectiveStatus] = useState<GameStatus>(() =>
    status === 'SCHEDULED' && Date.now() >= startsAtMs ? 'LIVE' : status
  )
  const [effectiveHomeScore, setEffectiveHomeScore] = useState<number | null>(() =>
    status === 'SCHEDULED' && Date.now() >= startsAtMs ? 0 : homeScore
  )
  const [effectiveAwayScore, setEffectiveAwayScore] = useState<number | null>(() =>
    status === 'SCHEDULED' && Date.now() >= startsAtMs ? 0 : awayScore
  )

  useEffect(() => {
    if (status !== 'SCHEDULED') return
    const remaining = startsAtMs - Date.now()
    if (remaining >= MAX_TIMEOUT_MS) return // jogo distante: status real vem pelo cron
    const timer = setTimeout(() => {
      setEffectiveStatus('LIVE')
      setEffectiveHomeScore(0)
      setEffectiveAwayScore(0)
    }, Math.max(remaining, 0))
    return () => clearTimeout(timer)
  }, [status, startsAtMs])

  const showScore = effectiveStatus === 'LIVE' || effectiveStatus === 'PAUSED' || effectiveStatus === 'FINISHED'
  const scoreColorClass = effectiveStatus === 'LIVE' ? 'text-accent' : showScore ? 'text-white' : 'text-white/30'
  const scoreOrTime = showScore
    ? `${effectiveHomeScore ?? 0} - ${effectiveAwayScore ?? 0}`
    : 'VS'

  return (
    <Link
      href={`/jogos/${id}`}
      className="block bg-surface border border-border rounded-[12px] p-[16px_18px] cursor-pointer hover:border-white/[16%] hover:bg-[#1a1a30] transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="font-barlow text-[10px] font-semibold tracking-[.12em] text-white/[42%] uppercase">{phase}</span>
        <StatusBadge status={effectiveStatus} />
      </div>

      <div className="flex items-center justify-between mt-[14px]">
        <div className="flex items-center gap-[10px] flex-1 min-w-0">
          {homeFlag
            ? <Image src={homeFlag} alt={homeTeam} width={26} height={18} className="rounded-[3px] object-cover flex-shrink-0" />
            : <div className="w-[26px] h-[18px] rounded-[3px] bg-elevated flex-shrink-0" />}
          <span className="font-barlow text-[16px] font-bold text-primary">{toCode(homeTeam)}</span>
        </div>
        <div className={cn('font-barlow text-[22px] font-extrabold px-[12px] flex-shrink-0', scoreColorClass)}>
          {scoreOrTime}
        </div>
        <div className="flex items-center gap-[10px] flex-1 min-w-0 justify-end">
          <span className="font-barlow text-[16px] font-bold text-primary">{toCode(awayTeam)}</span>
          {awayFlag
            ? <Image src={awayFlag} alt={awayTeam} width={26} height={18} className="rounded-[3px] object-cover flex-shrink-0" />
            : <div className="w-[26px] h-[18px] rounded-[3px] bg-elevated flex-shrink-0" />}
        </div>
      </div>

      <div className="mt-[14px] pt-[12px] border-t border-border flex items-center justify-between min-h-[24px]">
        <span className="font-inter text-[12px] font-medium text-white/[42%]">
          {effectiveStatus === 'SCHEDULED' ? formatGameTime(startsAt) : ''}
        </span>
        <div className="flex items-center gap-[8px]">
          {prediction ? (
            <>
              <span className="font-inter text-[12px] font-semibold text-white/70">
                Palpite {prediction.homeScore} × {prediction.awayScore}
              </span>
              {prediction.points !== null && <PointsBadge points={prediction.points} />}
            </>
          ) : isAuthenticated && effectiveStatus === 'SCHEDULED' ? (
            <span className="font-inter text-[12px] font-semibold text-accent cursor-pointer">Palpitar →</span>
          ) : isAuthenticated ? (
            <span className="font-inter text-[12px] font-semibold text-white/55">Ver detalhes →</span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
