import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Container from '@/components/layout/Container'
import GameDetailHeader from '@/components/game/GameDetailHeader'
import PredictionForm from '@/components/prediction/PredictionForm'
import ParticipantPredictions from '@/components/prediction/ParticipantPredictions'
import type { GameStatus } from '@/types'

export const dynamic = 'force-dynamic'

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id

  const [game, prediction] = await Promise.all([
    prisma.game.findUnique({
      where: { id },
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
        halfTimeHome: true,
        halfTimeAway: true,
        duration: true,
        extraTimeHome: true,
        extraTimeAway: true,
        penaltiesHome: true,
        penaltiesAway: true,
        phase: true,
        venue: true,
        city: true,
      },
    }),
    userId
      ? prisma.prediction.findUnique({
          where: { userId_gameId: { userId, gameId: id } },
          select: { homeScore: true, awayScore: true, points: true },
        })
      : Promise.resolve(null),
  ])

  if (!game) notFound()

  const status = game.status as GameStatus
  const gameDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Manaus' }).format(game.startsAt)
  const showScore = status === 'LIVE' || status === 'PAUSED' || status === 'FINISHED'
  const canPredict =
    !!userId &&
    status === 'SCHEDULED' &&
    new Date(game.startsAt) > new Date()

  return (
    <main>
      <Container className="max-w-2xl">
        <Link
          href={`/jogos?date=${gameDate}`}
          className="inline-flex items-center gap-[7px] font-inter text-[12px] font-medium text-white/[42%] hover:text-secondary transition-colors"
        >
          <span className="inline-block w-[7px] h-[7px] border-l-2 border-b-2 border-current rotate-45" />
          Jogos
        </Link>

        <div className="max-w-[660px] mx-auto mt-[18px]">
          <div className="bg-surface border border-border rounded-[16px] p-[26px_28px]">
            <GameDetailHeader
              status={status}
              startsAt={game.startsAt.toISOString()}
              homeScore={game.homeScore}
              awayScore={game.awayScore}
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
              homeFlag={game.homeFlag}
              awayFlag={game.awayFlag}
              phase={game.phase}
              city={game.city}
            />
          </div>

          {canPredict && (
            <div className="bg-surface border border-border rounded-[16px] p-[24px_28px] mt-[14px]">
              <div className="font-barlow text-[11px] font-semibold tracking-[.2em] text-white/[42%] uppercase">
                Seu palpite
              </div>
              <PredictionForm
                gameId={game.id}
                homeTeam={game.homeTeam}
                awayTeam={game.awayTeam}
                startsAt={game.startsAt.toISOString()}
                initialHomeScore={prediction?.homeScore}
                initialAwayScore={prediction?.awayScore}
              />
            </div>
          )}

          {!userId && status === 'SCHEDULED' && (
            <div className="bg-surface border border-border rounded-[16px] p-[28px] mt-[14px] text-center">
              <div className="font-inter text-[14px] font-semibold text-primary">
                Entre para registrar seu palpite
              </div>
              <Link
                href="/?login=1"
                className="inline-flex items-center justify-center h-[48px] px-[26px] mt-[16px] bg-accent text-black rounded-[12px] font-inter text-[14px] font-bold"
              >
                Entrar para palpitar
              </Link>
            </div>
          )}

          {showScore && (
            <ParticipantPredictions
              gameId={game.id}
              showStats={status === 'FINISHED'}
              currentUserId={userId ?? undefined}
            />
          )}
        </div>
      </Container>
    </main>
  )
}
