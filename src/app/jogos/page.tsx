import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Container from '@/components/layout/Container'
import GameCard from '@/components/game/GameCard'
import DateNav from '@/components/game/DateNav'
import SyncGamesButton from '@/components/game/SyncGamesButton'
import type { GameStatus } from '@/types'

export const dynamic = 'force-dynamic'

function toLocalDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Manaus',
  }).format(date)
}

function getDefaultDate(dates: string[]): string {
  if (dates.length === 0) return toLocalDate(new Date())
  const today = toLocalDate(new Date())
  if (dates.includes(today)) return today
  const future = dates.filter((d) => d >= today)
  if (future.length > 0) return future[0]
  return dates[dates.length - 1]
}

export default async function JogosPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateParam } = await searchParams
  const session = await auth()
  const userId = session?.user?.id

  const allGames = await prisma.game.findMany({
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
    },
  })

  const dates: string[] = Array.from(
    new Set(allGames.map((g) => toLocalDate(g.startsAt)))
  )

  if (dates.length === 0) {
    return (
      <main>
        <Container>
          <p className="text-secondary">Nenhum jogo cadastrado ainda.</p>
        </Container>
      </main>
    )
  }

  const selectedDate =
    dateParam && dates.includes(dateParam) ? dateParam : getDefaultDate(dates)

  const dayGames = allGames.filter(
    (g) => toLocalDate(g.startsAt) === selectedDate
  )

  const userPredictions = userId
    ? await prisma.prediction.findMany({
        where: { userId, gameId: { in: dayGames.map((g) => g.id) } },
        select: { gameId: true, homeScore: true, awayScore: true, points: true },
      })
    : []

  const predictionMap = new Map(userPredictions.map((p) => [p.gameId, p]))

  return (
    <main>
      <Container>
        <div className="flex items-end justify-between gap-4 mb-[22px]">
          <div>
            <div className="font-[Barlow_Condensed] text-[12px] font-semibold uppercase tracking-[.22em] text-[rgba(255,255,255,.42)]">
              Copa do Mundo 2026
            </div>
            <h1 className="font-barlow text-[38px] font-extrabold text-primary mt-[6px]">
              Jogos
            </h1>
          </div>
          <SyncGamesButton />
        </div>

        <DateNav dates={dates} selectedDate={selectedDate} today={toLocalDate(new Date())} />

        {dayGames.length === 0 ? (
          <p className="text-secondary">Nenhum jogo nesta data.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
            {dayGames.map((game) => (
              <GameCard
                key={game.id}
                {...game}
                startsAt={game.startsAt.toISOString()}
                status={game.status as GameStatus}
                prediction={predictionMap.get(game.id) ?? null}
                isAuthenticated={!!userId}
                phase={game.phase ?? undefined}
              />
            ))}
          </div>
        )}
      </Container>
    </main>
  )
}
