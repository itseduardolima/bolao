import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, PencilSimple } from '@phosphor-icons/react/dist/ssr'
import { cn, formatGameTime } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/Badge'
import LiveScore from '@/components/game/LiveScore'
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
  prediction?: { homeScore: number; awayScore: number; points: number | null } | null
  isAuthenticated?: boolean
  className?: string
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
  prediction,
  isAuthenticated,
  className,
}: GameCardProps) {
  const showScore = status === 'LIVE' || status === 'FINISHED'

  return (
    <Link
      href={`/jogos/${id}`}
      className={cn(
        'block rounded-xl border border-border bg-surface p-5 transition-transform hover:-translate-y-0.5 hover:shadow-[0_4px_20px_#00ff8715]',
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <StatusBadge status={status} />
        {!showScore && (
          <span className="font-inter text-sm text-secondary">
            {formatGameTime(startsAt)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 flex-col items-center gap-2">
          {homeFlag ? (
            <Image src={homeFlag} alt={homeTeam} width={40} height={40} className="rounded-sm object-contain" />
          ) : (
            <div className="h-10 w-10 rounded-sm bg-elevated" />
          )}
          <span className="text-center font-barlow text-[17px] font-bold uppercase text-primary">
            {homeTeam}
          </span>
        </div>

        <div className="flex min-w-[80px] flex-col items-center">
          {showScore ? (
            status === 'LIVE' ? (
              <LiveScore
                gameId={id}
                initialStatus={status}
                initialHomeScore={homeScore}
                initialAwayScore={awayScore}
              />
            ) : (
              <span className="font-barlow text-[40px] font-black leading-none text-accent">
                {homeScore ?? 0} × {awayScore ?? 0}
              </span>
            )
          ) : (
            <span className="font-barlow text-xl font-bold text-secondary">VS</span>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-2">
          {awayFlag ? (
            <Image src={awayFlag} alt={awayTeam} width={40} height={40} className="rounded-sm object-contain" />
          ) : (
            <div className="h-10 w-10 rounded-sm bg-elevated" />
          )}
          <span className="text-center font-barlow text-[17px] font-bold uppercase text-primary">
            {awayTeam}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        {prediction ? (
          <div className="flex items-center justify-between">
            <span className="font-inter text-xs text-secondary">
              Seu palpite:{' '}
              <span className="text-secondary">
                {prediction.homeScore} × {prediction.awayScore}
              </span>
            </span>
            {prediction.points !== null ? (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-inter text-xs font-semibold',
                  prediction.points === 3 && 'bg-accent-dim text-accent border border-accent-border',
                  prediction.points === 1 && 'bg-warning-dim text-warning border border-warning-border',
                  prediction.points === 0 && 'bg-elevated text-secondary'
                )}
              >
                {prediction.points === 3 ? '+3 pts' : prediction.points === 1 ? '+1 pt' : '0 pts'}
              </span>
            ) : (
              <span className="font-inter text-xs text-secondary">aguardando</span>
            )}
          </div>
        ) : isAuthenticated ? (
          <span className="flex items-center gap-1 font-inter text-xs text-accent">
            {status === 'SCHEDULED' ? (
              <>
                <PencilSimple size={12} weight="bold" />
                Palpitar
              </>
            ) : (
              <>
                Ver detalhes
                <ArrowRight size={12} weight="bold" />
              </>
            )}
          </span>
        ) : (
          <span className="font-inter text-xs text-secondary">Entre para palpitar</span>
        )}
      </div>
    </Link>
  )
}
