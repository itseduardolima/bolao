import Link from 'next/link'
import Image from 'next/image'
import { formatGameTime } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/Badge'
import type { GameStatus } from '@/types'

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

function PointsBadge({ points }: { points: number }) {
  if (points === 3) return (
    <span className="font-barlow text-[12px] font-bold text-accent bg-[rgba(0,255,135,.12)] rounded-[6px] px-[10px] py-[3px]">+3</span>
  )
  if (points === 1) return (
    <span className="font-barlow text-[12px] font-bold text-warning bg-[rgba(245,158,11,.14)] rounded-[6px] px-[10px] py-[3px]">+1</span>
  )
  return (
    <span className="font-barlow text-[12px] font-bold text-[rgba(255,255,255,.5)] bg-[rgba(255,255,255,.07)] rounded-[6px] px-[10px] py-[3px]">0</span>
  )
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
  const showScore = status === 'LIVE' || status === 'PAUSED' || status === 'FINISHED'
  const scoreColor = showScore ? '#fff' : 'rgba(255,255,255,.3)'
  const scoreOrTime = showScore
    ? `${homeScore ?? 0} - ${awayScore ?? 0}`
    : 'VS'

  return (
    <Link
      href={`/jogos/${id}`}
      className="block bg-surface border border-border rounded-[12px] p-[16px_18px] cursor-pointer hover:border-[rgba(255,255,255,.16)] hover:bg-[#1a1a30] transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="font-[Barlow_Condensed] text-[10px] font-semibold tracking-[.12em] text-[rgba(255,255,255,.42)] uppercase">{phase}</span>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center justify-between mt-[14px]">
        <div className="flex items-center gap-[10px] flex-1 min-w-0">
          {homeFlag
            ? <Image src={homeFlag} alt={homeTeam} width={26} height={18} className="rounded-[3px] object-cover flex-shrink-0" />
            : <div className="w-[26px] h-[18px] rounded-[3px] bg-elevated flex-shrink-0" />}
          <span className="font-barlow text-[16px] font-bold text-primary">{toCode(homeTeam)}</span>
        </div>
        <div className="font-barlow text-[22px] font-extrabold px-[12px] flex-shrink-0" style={{ color: scoreColor }}>
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
        <span className="font-inter text-[12px] font-medium text-[rgba(255,255,255,.42)]">
          {status === 'SCHEDULED' ? formatGameTime(startsAt) : ''}
        </span>
        <div className="flex items-center gap-[8px]">
          {prediction ? (
            <>
              <span className="font-inter text-[12px] font-semibold text-[rgba(255,255,255,.7)]">
                Palpite {prediction.homeScore} × {prediction.awayScore}
              </span>
              {prediction.points !== null && <PointsBadge points={prediction.points} />}
            </>
          ) : isAuthenticated && status === 'SCHEDULED' ? (
            <span className="font-inter text-[12px] font-semibold text-accent cursor-pointer">Palpitar →</span>
          ) : isAuthenticated ? (
            <span className="font-inter text-[12px] font-semibold text-[rgba(255,255,255,.55)]">Ver detalhes →</span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
