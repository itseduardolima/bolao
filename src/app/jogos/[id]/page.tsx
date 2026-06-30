import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGameSummary } from '@/lib/games'
import { isRegularTimeLocked } from '@/lib/scoring'
import { SITE_URL } from '@/lib/site'
import Container from '@/components/layout/Container'
import JsonLd from '@/components/seo/JsonLd'
import GameDetailHeader from '@/components/game/GameDetailHeader'
import KickoffRefresh from '@/components/game/KickoffRefresh'
import PredictionForm from '@/components/prediction/PredictionForm'
import ParticipantPredictions from '@/components/prediction/ParticipantPredictions'
import type { GameStatus } from '@/types'

export const dynamic = 'force-dynamic'

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Manaus',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const game = await getGameSummary(id)
  if (!game) return { title: 'Jogo não encontrado' }

  const matchup = `${game.homeTeam} x ${game.awayTeam}`
  const finished =
    game.status === 'FINISHED' && game.homeScore != null && game.awayScore != null
  const detail = finished
    ? `Resultado: ${game.homeScore} x ${game.awayScore}.`
    : `${dateFmt.format(game.startsAt)} (horário de Brasília/AM).`
  const description = `${matchup} pela Copa do Mundo 2026. ${detail} Dê seu palpite e veja os palpites dos participantes.`

  return {
    title: matchup,
    description,
    alternates: { canonical: `/jogos/${id}` },
    openGraph: {
      type: 'website',
      title: `${matchup} — Copa do Mundo 2026`,
      description,
    },
    twitter: { title: `${matchup} — Copa do Mundo 2026`, description },
  }
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
  // Apito como gatilho (mesmo do flip "Ao vivo" no header): a partir de startsAt
  // já revelamos placar e palpites, sem depender do cron atualizar o status.
  const kickoffPassed = game.startsAt <= new Date()
  const showScore = status === 'LIVE' || status === 'PAUSED' || status === 'FINISHED' || kickoffPassed
  const canPredict = !!userId && status === 'SCHEDULED' && !kickoffPassed
  // Pontos já são finais a partir da prorrogação/pênaltis (não só ao encerrar).
  const scoringLocked = isRegularTimeLocked(status, game.duration)

  const matchup = `${game.homeTeam} x ${game.awayTeam}`
  const sportsEvent = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: matchup,
    sport: 'Soccer',
    startDate: game.startsAt.toISOString(),
    url: `${SITE_URL}/jogos/${game.id}`,
    ...(status === 'SCHEDULED' ? { eventStatus: 'https://schema.org/EventScheduled' } : {}),
    ...(game.venue || game.city
      ? {
          location: {
            '@type': 'Place',
            name: game.venue ?? game.city,
            ...(game.city ? { address: game.city } : {}),
          },
        }
      : {}),
    competitor: [
      { '@type': 'SportsTeam', name: game.homeTeam },
      { '@type': 'SportsTeam', name: game.awayTeam },
    ],
  }
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Jogos', item: `${SITE_URL}/jogos` },
      { '@type': 'ListItem', position: 3, name: matchup, item: `${SITE_URL}/jogos/${game.id}` },
    ],
  }

  return (
    <main>
      <JsonLd data={sportsEvent} />
      <JsonLd data={breadcrumbs} />
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
              duration={game.duration}
              startsAt={game.startsAt.toISOString()}
              homeScore={game.homeScore}
              awayScore={game.awayScore}
              extraTimeHome={game.extraTimeHome}
              extraTimeAway={game.extraTimeAway}
              penaltiesHome={game.penaltiesHome}
              penaltiesAway={game.penaltiesAway}
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
              homeFlag={game.homeFlag}
              awayFlag={game.awayFlag}
              phase={game.phase}
              city={game.city}
            />
          </div>

          <KickoffRefresh status={status} startsAt={game.startsAt.toISOString()} />


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
                href={`/?login=1&from=/jogos/${game.id}`}
                className="inline-flex items-center justify-center h-[48px] px-[26px] mt-[16px] bg-accent text-black rounded-[12px] font-inter text-[14px] font-bold"
              >
                Entrar para palpitar
              </Link>
            </div>
          )}

          {showScore && (
            <ParticipantPredictions
              gameId={game.id}
              showStats={scoringLocked}
              currentUserId={userId ?? undefined}
            />
          )}
        </div>
      </Container>
    </main>
  )
}
