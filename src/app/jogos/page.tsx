import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatGameDate } from '@/lib/utils'
import Container from '@/components/layout/Container'
import SectionTitle from '@/components/layout/SectionTitle'
import GameCard from '@/components/game/GameCard'
import type { GameStatus } from '@/types'

const PHASE_ORDER = [
  'Fase de Grupos',
  'Oitavas de Final',
  'Quartas de Final',
  'Semifinal',
  'Disputa de Terceiro Lugar',
  'Final',
]

export const revalidate = 60

export default async function JogosPage() {
  const session = await auth()
  const userId = session?.user?.id

  const [games, userPredictions] = await Promise.all([
    prisma.game.findMany({
      orderBy: { startsAt: 'asc' },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        homeFlag: true,
        awayFlag: true,
        startsAt: true,
        status: true,
        homeScore: true,
        awayScore: true,
        phase: true,
        groupName: true,
      },
    }),
    userId
      ? prisma.prediction.findMany({
          where: { userId },
          select: { gameId: true, homeScore: true, awayScore: true, points: true },
        })
      : Promise.resolve([]),
  ])

  const predictionMap = new Map(
    userPredictions.map((p) => [p.gameId, p])
  )

  // Group by phase → date
  const byPhase = new Map<string, Map<string, typeof games>>()

  for (const game of games) {
    const dateKey = formatGameDate(game.startsAt)
    if (!byPhase.has(game.phase)) {
      byPhase.set(game.phase, new Map())
    }
    const phaseMap = byPhase.get(game.phase)!
    if (!phaseMap.has(dateKey)) {
      phaseMap.set(dateKey, [])
    }
    phaseMap.get(dateKey)!.push(game)
  }

  const sortedPhases = [...byPhase.keys()].sort((a, b) => {
    const ai = PHASE_ORDER.indexOf(a)
    const bi = PHASE_ORDER.indexOf(b)
    const av = ai === -1 ? Infinity : ai
    const bv = bi === -1 ? Infinity : bi
    if (av !== bv) return av - bv
    return a.localeCompare(b)
  })

  return (
    <main>
      <Container>
        <SectionTitle className="mb-8">Jogos</SectionTitle>

        {sortedPhases.length === 0 && (
          <p className="text-secondary">Nenhum jogo cadastrado ainda.</p>
        )}

        <div className="flex flex-col gap-10">
          {sortedPhases.map((phase) => {
            const dateGroups = byPhase.get(phase)!
            return (
              <section key={phase}>
                <h3 className="mb-4 font-barlow text-[13px] font-bold uppercase tracking-[2px] text-muted">
                  {phase}
                </h3>
                <div className="flex flex-col gap-6">
                  {[...dateGroups.entries()].map(([dateKey, dayGames]) => (
                    <div key={dateKey}>
                      <p className="mb-3 font-inter text-xs text-muted">{dateKey}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {dayGames.map((game) => (
                          <GameCard
                            key={game.id}
                            {...game}
                            startsAt={game.startsAt.toISOString()}
                            status={game.status as GameStatus}
                            prediction={predictionMap.get(game.id) ?? null}
                            isAuthenticated={!!userId}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </Container>
    </main>
  )
}
