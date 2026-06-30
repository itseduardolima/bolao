'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { StatusBadge } from '@/components/ui/Badge'
import { cn, formatGameTime, getMatchDecider } from '@/lib/utils'
import type { GameStatus } from '@/types'

// Teto do setTimeout (~24,8 dias). Acima disso o delay estoura e dispara na hora;
// para jogos mais distantes deixamos o status real chegar pelo cron.
const MAX_TIMEOUT_MS = 2_147_483_647

type Props = {
  status: GameStatus
  duration: string | null
  startsAt: string
  homeScore: number | null
  awayScore: number | null
  extraTimeHome: number | null
  extraTimeAway: number | null
  penaltiesHome: number | null
  penaltiesAway: number | null
  homeTeam: string
  awayTeam: string
  homeFlag: string | null
  awayFlag: string | null
  phase: string | null
  city: string | null
}

function toCode(name: string) {
  return name.slice(0, 3).toUpperCase()
}

export default function GameDetailHeader({
  status,
  duration,
  startsAt,
  homeScore,
  awayScore,
  extraTimeHome,
  extraTimeAway,
  penaltiesHome,
  penaltiesAway,
  homeTeam,
  awayTeam,
  homeFlag,
  awayFlag,
  phase,
  city,
}: Props) {
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

  let scoreText: string
  let scoreColorClass: string
  if (effectiveStatus === 'LIVE' || effectiveStatus === 'PAUSED') {
    scoreText = `${effectiveHomeScore ?? 0} - ${effectiveAwayScore ?? 0}`
    scoreColorClass = 'text-accent'
  } else if (effectiveStatus === 'FINISHED') {
    scoreText = `${effectiveHomeScore ?? 0} - ${effectiveAwayScore ?? 0}`
    scoreColorClass = 'text-white'
  } else {
    scoreText = formatGameTime(startsAt)
    scoreColorClass = 'text-white/30'
  }

  // O placar grande vale o tempo normal (90 min). Pênaltis/prorrogação aparecem
  // só como informação adicional, sem entrar na pontuação.
  const decider = getMatchDecider({
    status,
    homeScore,
    awayScore,
    extraTimeHome,
    extraTimeAway,
    penaltiesHome,
    penaltiesAway,
  })

  return (
    <>
      <div className="flex justify-center">
        <StatusBadge status={effectiveStatus} duration={duration} />
      </div>

      <div className="grid [grid-template-columns:1fr_auto_1fr] items-center gap-[18px] mt-[20px]">
        <div className="flex flex-col items-center gap-[9px]">
          {homeFlag ? (
            <Image
              src={homeFlag}
              alt={homeTeam}
              width={52}
              height={36}
              className="rounded-[5px] shadow-[0_2px_8px_rgba(0,0,0,.3)] object-cover"
            />
          ) : (
            <div className="w-[52px] h-[36px] rounded-[5px] bg-elevated" />
          )}
          <div className="font-barlow text-[26px] font-extrabold text-primary leading-none">
            {toCode(homeTeam)}
          </div>
          <div className="font-inter text-[12px] font-medium text-white/55">
            {homeTeam}
          </div>
        </div>

        <div className="flex flex-col items-center gap-[6px]">
          <div className={cn('font-barlow text-[44px] font-extrabold leading-none whitespace-nowrap', scoreColorClass)}>
            {scoreText}
          </div>
          {decider && (
            <span className="font-inter text-[11px] font-semibold uppercase tracking-[.12em] text-white/55 whitespace-nowrap">
              {decider.type === 'penalties' ? 'Pênaltis' : 'Prorrogação'} {decider.home} - {decider.away}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-[9px]">
          {awayFlag ? (
            <Image
              src={awayFlag}
              alt={awayTeam}
              width={52}
              height={36}
              className="rounded-[5px] shadow-[0_2px_8px_rgba(0,0,0,.3)] object-cover"
            />
          ) : (
            <div className="w-[52px] h-[36px] rounded-[5px] bg-elevated" />
          )}
          <div className="font-barlow text-[26px] font-extrabold text-primary leading-none">
            {toCode(awayTeam)}
          </div>
          <div className="font-inter text-[12px] font-medium text-white/55">
            {awayTeam}
          </div>
        </div>
      </div>

      <div className="text-center font-inter text-[12px] font-medium text-white/[42%] mt-[18px]">
        {phase}{city ? ` · ${city}` : ''}
      </div>
    </>
  )
}
