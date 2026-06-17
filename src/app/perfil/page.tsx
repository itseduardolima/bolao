import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Container from '@/components/layout/Container'
import SectionTitle from '@/components/layout/SectionTitle'
import { formatGameDate, formatGameTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
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

      {/* Stats */}
      <div className="mb-8 grid grid-cols-4 divide-x divide-border rounded-xl bg-elevated">
        {[
          { label: 'Pontos', value: totalPoints, accent: true },
          { label: 'Exatos', value: exactHits },
          { label: 'Vencedor', value: winnerHits },
          { label: 'Jogos', value: gamesPlayed },
        ].map(({ label, value, accent }) => (
          <div key={label} className="flex flex-col items-center gap-1 px-2 py-4">
            <span className="font-inter text-[10px] uppercase tracking-widest text-secondary">
              {label}
            </span>
            <span
              className={cn(
                'font-barlow text-2xl font-bold',
                accent ? 'text-accent' : 'text-primary'
              )}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Game list */}
      <div className="flex flex-col gap-8">
        {phases.map((phase) => {
          const games = byPhase[phase]
          return (
            <section key={phase}>
              <h3 className="mb-2 border-b border-border pb-2 font-barlow text-sm font-bold uppercase tracking-widest text-secondary">
                {phase}
              </h3>

              {/* Column headers */}
              <div className="mb-1 flex items-center gap-2 px-1">
                <div className="min-w-0 flex-1" />
                <div className="flex w-[104px] shrink-0 items-center justify-around">
                  <span className="w-12 text-center font-inter text-[10px] uppercase tracking-wide text-secondary">
                    Palpite
                  </span>
                  <span className="w-12 text-center font-inter text-[10px] uppercase tracking-wide text-secondary">
                    Result.
                  </span>
                </div>
                <div className="min-w-0 flex-1" />
                <div className="w-10 shrink-0 text-right font-inter text-[10px] uppercase tracking-wide text-secondary">
                  Pts
                </div>
              </div>

              <div className="flex flex-col">
                {games.map((game) => {
                  const pred = predMap.get(game.id)
                  const isFinished = game.status === 'FINISHED'
                  const isLive = game.status === 'LIVE'
                  const isScheduled = game.status === 'SCHEDULED'

                  const predScore = pred
                    ? `${pred.homeScore}×${pred.awayScore}`
                    : '—'

                  const resultScore =
                    (isFinished || isLive) &&
                    game.homeScore !== null &&
                    game.awayScore !== null
                      ? `${game.homeScore}×${game.awayScore}`
                      : '—'

                  const pts = pred?.points ?? null

                  return (
                    <div
                      key={game.id}
                      className="flex items-center gap-2 border-b border-border px-1 py-3 last:border-b-0"
                    >
                      {/* Home team */}
                      <div className="min-w-0 flex-1 text-right">
                        <span className="block truncate font-barlow text-sm font-bold uppercase text-primary">
                          {game.homeTeam}
                        </span>
                        {isScheduled && (
                          <span className="block font-inter text-[10px] text-secondary">
                            {formatGameDate(game.startsAt)} {formatGameTime(game.startsAt)}
                          </span>
                        )}
                        {isLive && (
                          <span className="font-inter text-[10px] font-semibold uppercase tracking-wider text-warning">
                            Ao vivo
                          </span>
                        )}
                      </div>

                      {/* Scores */}
                      <div className="flex w-[104px] shrink-0 items-center justify-around">
                        <span
                          className={cn(
                            'w-12 text-center font-barlow font-bold',
                            pred ? 'text-secondary' : 'text-secondary/40'
                          )}
                        >
                          {predScore}
                        </span>
                        <span
                          className={cn(
                            'w-12 text-center font-barlow font-bold',
                            isLive
                              ? 'text-warning'
                              : isFinished && resultScore !== '—'
                                ? 'text-accent'
                                : 'text-secondary/40'
                          )}
                        >
                          {resultScore}
                        </span>
                      </div>

                      {/* Away team */}
                      <div className="min-w-0 flex-1 text-left">
                        <span className="block truncate font-barlow text-sm font-bold uppercase text-primary">
                          {game.awayTeam}
                        </span>
                      </div>

                      {/* Points */}
                      <div className="w-10 shrink-0 text-right">
                        {pts === 3 && (
                          <span className="font-inter text-xs font-semibold text-accent">+3</span>
                        )}
                        {pts === 1 && (
                          <span className="font-inter text-xs font-semibold text-warning">+1</span>
                        )}
                        {pts === 0 && (
                          <span className="font-inter text-xs text-secondary">0</span>
                        )}
                        {pts === null && pred && isFinished && (
                          <span className="font-inter text-xs text-secondary">—</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {phases.length === 0 && (
          <p className="font-inter text-sm text-secondary">Nenhum jogo disponível ainda.</p>
        )}
      </div>
    </Container>
  )
}
