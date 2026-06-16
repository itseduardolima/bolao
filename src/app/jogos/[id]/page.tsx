import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatGameTime, formatGameDate } from '@/lib/utils'
import Container from '@/components/layout/Container'
import { StatusBadge } from '@/components/ui/Badge'
import LiveScore from '@/components/game/LiveScore'
import PredictionForm from '@/components/prediction/PredictionForm'
import ParticipantPredictions from '@/components/prediction/ParticipantPredictions'
import type { GameStatus } from '@/types'

export const revalidate = 30

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
  const showScore = status === 'LIVE' || status === 'FINISHED'
  const canPredict =
    !!userId &&
    status === 'SCHEDULED' &&
    new Date(game.startsAt) > new Date()

  return (
    <main>
      <Container className="max-w-2xl">
        {/* Game header */}
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <StatusBadge status={status} />
            <span className="font-inter text-sm text-muted">{game.phase}</span>
          </div>

          <div className="flex items-center justify-between gap-6">
            {/* Home team */}
            <div className="flex flex-1 flex-col items-center gap-3">
              {game.homeFlag ? (
                <Image
                  src={game.homeFlag}
                  alt={game.homeTeam}
                  width={64}
                  height={64}
                  className="rounded object-contain"
                />
              ) : (
                <div className="h-16 w-16 rounded bg-elevated" />
              )}
              <span className="text-center font-barlow text-xl font-bold uppercase text-primary">
                {game.homeTeam}
              </span>
            </div>

            {/* Score / time */}
            <div className="flex flex-col items-center">
              {showScore ? (
                status === 'LIVE' ? (
                  <LiveScore
                    gameId={id}
                    initialStatus={status}
                    initialHomeScore={game.homeScore}
                    initialAwayScore={game.awayScore}
                  />
                ) : (
                  <span className="font-barlow text-[40px] font-black leading-none text-accent">
                    {game.homeScore} × {game.awayScore}
                  </span>
                )
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="font-barlow text-2xl font-bold text-secondary">
                    {formatGameTime(game.startsAt)}
                  </span>
                  <span className="font-inter text-xs text-muted">
                    {formatGameDate(game.startsAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Away team */}
            <div className="flex flex-1 flex-col items-center gap-3">
              {game.awayFlag ? (
                <Image
                  src={game.awayFlag}
                  alt={game.awayTeam}
                  width={64}
                  height={64}
                  className="rounded object-contain"
                />
              ) : (
                <div className="h-16 w-16 rounded bg-elevated" />
              )}
              <span className="text-center font-barlow text-xl font-bold uppercase text-primary">
                {game.awayTeam}
              </span>
            </div>
          </div>

          {(game.venue || game.city) && (
            <p className="text-center font-inter text-xs text-muted">
              {[game.venue, game.city].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Prediction section */}
        <div className="mb-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-barlow text-[13px] font-bold uppercase tracking-[2px] text-muted">
            Meu palpite
          </h2>

          {!userId && (
            <p className="font-inter text-sm text-secondary">
              <Link href="/?login=1" className="text-accent underline">
                Entre
              </Link>{' '}
              para enviar seu palpite.
            </p>
          )}

          {userId && (status === 'LIVE' || status === 'FINISHED') && (
            <div>
              <p className="font-inter text-sm text-muted">Palpites encerrados para este jogo.</p>
              {prediction && (
                <p className="mt-2 font-inter text-sm text-secondary">
                  Seu palpite:{' '}
                  <span className="font-semibold text-primary">
                    {prediction.homeScore} × {prediction.awayScore}
                  </span>
                  {status === 'FINISHED' && prediction.points !== null && (
                    <span className="ml-2 text-accent">+{prediction.points} pts</span>
                  )}
                </p>
              )}
            </div>
          )}

          {canPredict && (
            <PredictionForm
              gameId={id}
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
              startsAt={game.startsAt.toISOString()}
              initialHomeScore={prediction?.homeScore ?? null}
              initialAwayScore={prediction?.awayScore ?? null}
            />
          )}

          {userId && status === 'SCHEDULED' && !canPredict && (
            <p className="font-inter text-sm text-muted">Palpites encerrados para este jogo.</p>
          )}
        </div>

        {/* Participant predictions (FINISHED only) */}
        {status === 'FINISHED' && (
          <ParticipantPredictions gameId={id} currentUserId={userId} />
        )}
      </Container>
    </main>
  )
}
