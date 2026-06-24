import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatGameTime } from '@/lib/utils'
import Container from '@/components/layout/Container'
import { StatusBadge } from '@/components/ui/Badge'
import PredictionForm from '@/components/prediction/PredictionForm'
import ParticipantPredictions from '@/components/prediction/ParticipantPredictions'
import type { GameStatus } from '@/types'

export const revalidate = 30

function toCode(name: string) {
  return name.slice(0, 3).toUpperCase()
}

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

  let scoreCenter: string
  let scoreColor: string
  if (status === 'LIVE' || status === 'PAUSED') {
    scoreCenter = `${game.homeScore ?? 0} - ${game.awayScore ?? 0}`
    scoreColor = '#00ff87'
  } else if (status === 'FINISHED') {
    scoreCenter = `${game.homeScore ?? 0} - ${game.awayScore ?? 0}`
    scoreColor = '#fff'
  } else {
    scoreCenter = formatGameTime(game.startsAt)
    scoreColor = 'rgba(255,255,255,.3)'
  }

  return (
    <main>
      <Container className="max-w-2xl">
        <Link
          href={`/jogos?date=${gameDate}`}
          className="inline-flex items-center gap-[7px] font-inter text-[12px] font-medium text-[rgba(255,255,255,.42)] hover:text-secondary transition-colors"
        >
          <span className="inline-block w-[7px] h-[7px] border-l-2 border-b-2 border-current rotate-45" />
          Jogos
        </Link>

        <div className="max-w-[660px] mx-auto mt-[18px]">
          <div className="bg-surface border border-border rounded-[16px] p-[26px_28px]">
            <div className="flex justify-center">
              <StatusBadge status={status} />
            </div>

            <div className="grid [grid-template-columns:1fr_auto_1fr] items-center gap-[18px] mt-[20px]">
              <div className="flex flex-col items-center gap-[9px]">
                {game.homeFlag ? (
                  <Image
                    src={game.homeFlag}
                    alt={game.homeTeam}
                    width={52}
                    height={36}
                    className="rounded-[5px] shadow-[0_2px_8px_rgba(0,0,0,.3)] object-cover"
                  />
                ) : (
                  <div className="w-[52px] h-[36px] rounded-[5px] bg-elevated" />
                )}
                <div className="font-barlow text-[26px] font-extrabold text-primary leading-none">
                  {toCode(game.homeTeam)}
                </div>
                <div className="font-inter text-[12px] font-medium text-[rgba(255,255,255,.55)]">
                  {game.homeTeam}
                </div>
              </div>

              <div
                className="font-barlow text-[44px] font-extrabold leading-none whitespace-nowrap"
                style={{ color: scoreColor }}
              >
                {scoreCenter}
              </div>

              <div className="flex flex-col items-center gap-[9px]">
                {game.awayFlag ? (
                  <Image
                    src={game.awayFlag}
                    alt={game.awayTeam}
                    width={52}
                    height={36}
                    className="rounded-[5px] shadow-[0_2px_8px_rgba(0,0,0,.3)] object-cover"
                  />
                ) : (
                  <div className="w-[52px] h-[36px] rounded-[5px] bg-elevated" />
                )}
                <div className="font-barlow text-[26px] font-extrabold text-primary leading-none">
                  {toCode(game.awayTeam)}
                </div>
                <div className="font-inter text-[12px] font-medium text-[rgba(255,255,255,.55)]">
                  {game.awayTeam}
                </div>
              </div>
            </div>

            <div className="text-center font-inter text-[12px] font-medium text-[rgba(255,255,255,.42)] mt-[18px]">
              {game.phase}{game.city ? ` · ${game.city}` : ''}
            </div>
          </div>

          {canPredict && (
            <div className="bg-surface border border-border rounded-[16px] p-[24px_28px] mt-[14px]">
              <div className="font-[Barlow_Condensed] text-[11px] font-semibold tracking-[.2em] text-[rgba(255,255,255,.42)] uppercase">
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
