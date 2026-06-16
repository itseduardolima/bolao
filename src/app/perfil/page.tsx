import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Container from '@/components/layout/Container'
import SectionTitle from '@/components/layout/SectionTitle'
import { formatGameDate, formatGameTime } from '@/lib/utils'
import type { GameStatus } from '@/types'

export const revalidate = 30

type GameRow = {
  id: string
  homeTeam: string
  awayTeam: string
  startsAt: Date
  status: GameStatus
  homeScore: number | null
  awayScore: number | null
  phase: string
}

type PredictionRow = {
  gameId: string
  homeScore: number
  awayScore: number
  points: number | null
}

export default async function PerfilPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/?login=1')
  }

  const userId = session.user.id

  const allGames = await prisma.game.findMany({
    orderBy: { startsAt: 'asc' },
    select: {
      id: true,
      homeTeam: true,
      awayTeam: true,
      startsAt: true,
      status: true,
      homeScore: true,
      awayScore: true,
      phase: true,
    },
  })

  const predictions = await prisma.prediction.findMany({
    where: { userId },
    select: {
      gameId: true,
      homeScore: true,
      awayScore: true,
      points: true,
    },
  })

  const predMap = new Map<string, PredictionRow>(predictions.map((p) => [p.gameId, p]))

  const totalPoints = predictions.reduce((sum, p) => sum + (p.points ?? 0), 0)
  const exactHits = predictions.filter((p) => p.points === 3).length
  const winnerHits = predictions.filter((p) => p.points === 1).length
  const gamesPlayed = predictions.length

  const phases: string[] = []
  const byPhase = allGames.reduce<Record<string, GameRow[]>>((acc, game) => {
    if (!acc[game.phase]) {
      acc[game.phase] = []
      phases.push(game.phase)
    }
    acc[game.phase].push(game as GameRow)
    return acc
  }, {})

  return (
    <Container>
      <SectionTitle className="mb-4">Meus Palpites</SectionTitle>

      <div className="flex flex-wrap gap-6 mb-8 p-4 bg-elevated rounded-xl">
        <div className="flex flex-col gap-1">
          <span className="font-inter text-[11px] uppercase tracking-widest text-muted">Pontos</span>
          <span className="font-barlow text-2xl font-bold text-accent">{totalPoints}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-inter text-[11px] uppercase tracking-widest text-muted">Exatos</span>
          <span className="font-barlow text-2xl font-bold text-secondary">{exactHits}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-inter text-[11px] uppercase tracking-widest text-muted">Vencedor</span>
          <span className="font-barlow text-2xl font-bold text-secondary">{winnerHits}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-inter text-[11px] uppercase tracking-widest text-muted">Jogos</span>
          <span className="font-barlow text-2xl font-bold text-secondary">{gamesPlayed}</span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {phases.map((phase) => {
          const games = byPhase[phase]
          return (
            <section key={phase}>
              <h3 className="font-barlow text-sm font-bold uppercase tracking-widest text-muted mb-3 border-b border-border pb-2">
                {phase}
              </h3>
              <div className="flex flex-col gap-1">
                {games.map((game) => {
                  const pred = predMap.get(game.id)
                  const isFinished = game.status === 'FINISHED'
                  const isLive = game.status === 'LIVE'
                  const isScheduled = game.status === 'SCHEDULED'

                  let pointsBadge: React.ReactNode = (
                    <span className="font-inter text-xs text-muted">—</span>
                  )
                  if (pred && (isFinished || pred.points !== null)) {
                    if (pred.points === 3) {
                      pointsBadge = (
                        <span className="font-inter text-xs font-semibold text-accent">+3 pts</span>
                      )
                    } else if (pred.points === 1) {
                      pointsBadge = (
                        <span className="font-inter text-xs font-semibold text-warning">+1 pt</span>
                      )
                    } else if (pred.points === 0) {
                      pointsBadge = (
                        <span className="font-inter text-xs text-muted">0 pts</span>
                      )
                    }
                  }

                  let resultDisplay: React.ReactNode
                  if (isFinished && game.homeScore !== null && game.awayScore !== null) {
                    resultDisplay = (
                      <span className="font-barlow font-bold text-accent">
                        {game.homeScore} × {game.awayScore}
                      </span>
                    )
                  } else if (isLive && game.homeScore !== null && game.awayScore !== null) {
                    resultDisplay = (
                      <span className="font-barlow font-bold text-warning">
                        {game.homeScore} × {game.awayScore}
                      </span>
                    )
                  } else {
                    resultDisplay = (
                      <span className="font-inter text-sm text-muted">—</span>
                    )
                  }

                  let predDisplay: React.ReactNode
                  if (pred) {
                    predDisplay = (
                      <span className="font-barlow font-bold text-secondary">
                        {pred.homeScore} × {pred.awayScore}
                      </span>
                    )
                  } else {
                    predDisplay = (
                      <span className="font-inter text-sm text-muted">—</span>
                    )
                  }

                  let statusBadge: React.ReactNode = null
                  if (isLive) {
                    statusBadge = (
                      <span className="font-inter text-[10px] font-semibold uppercase tracking-wider text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                        AO VIVO
                      </span>
                    )
                  } else if (isScheduled) {
                    statusBadge = (
                      <span className="font-inter text-[10px] text-muted">
                        {formatGameDate(game.startsAt)} {formatGameTime(game.startsAt)}
                      </span>
                    )
                  }

                  return (
                    <div
                      key={game.id}
                      className="flex items-center gap-2 border-b border-border py-3 last:border-b-0"
                    >
                      <div className="flex-1 text-right">
                        <span className="font-barlow font-bold uppercase text-primary text-sm">
                          {game.homeTeam}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-0.5 w-32 shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="w-14 text-center text-sm">{predDisplay}</div>
                          <div className="w-14 text-center text-sm">{resultDisplay}</div>
                        </div>
                        {statusBadge && (
                          <div className="text-center">{statusBadge}</div>
                        )}
                      </div>

                      <div className="flex-1 text-left">
                        <span className="font-barlow font-bold uppercase text-primary text-sm">
                          {game.awayTeam}
                        </span>
                      </div>

                      <div className="w-14 text-right shrink-0">{pointsBadge}</div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {phases.length === 0 && (
          <p className="font-inter text-sm text-muted">Nenhum jogo disponível ainda.</p>
        )}
      </div>
    </Container>
  )
}
