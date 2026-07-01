import type { Metadata } from 'next'
import { getAllGames } from '@/lib/games'
import Container from '@/components/layout/Container'
import GamesGrid from '@/components/game/GamesGrid'
import DateNav from '@/components/game/DateNav'
import SyncGamesButton from '@/components/game/SyncGamesButton'
import LiveRefresh from '@/components/game/LiveRefresh'
import type { GameStatus } from '@/types'

// Canonical fixo: a página recebe `?date=` para navegar entre dias, mas todas
// as variações consolidam em /jogos para o índice.
export const metadata: Metadata = {
  title: 'Jogos da Copa do Mundo 2026',
  description:
    'Tabela de jogos da Copa do Mundo 2026: datas, horários, resultados ao vivo e seus palpites.',
  alternates: { canonical: '/jogos' },
}

function toLocalDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Manaus',
  }).format(new Date(date))
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

  const allGames = await getAllGames()

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

  const hasLiveGames = dayGames.some(
    (g) => g.status === 'LIVE' || g.status === 'PAUSED'
  )

  return (
    <main>
      <LiveRefresh active={hasLiveGames} />
      <Container>
        <div className="flex items-end justify-between gap-4 mb-[22px]">
          <div>
            <div className="font-barlow text-[12px] font-semibold uppercase tracking-[.22em] text-white/[42%]">
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
          <GamesGrid
            games={dayGames.map((game) => ({
              ...game,
              startsAt: new Date(game.startsAt).toISOString(),
              status: game.status as GameStatus,
              phase: game.phase ?? undefined,
            }))}
          />
        )}
      </Container>
    </main>
  )
}
