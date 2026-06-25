import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Container from '@/components/layout/Container'
import Avatar from '@/components/ui/Avatar'
import Card from '@/components/ui/Card'
import Eyebrow from '@/components/ui/Eyebrow'
import StatCard from '@/components/ui/StatCard'
import PointsBadge from '@/components/ui/PointsBadge'
import DeleteAccountButton from '@/components/account/DeleteAccountButton'
import { cn } from '@/lib/utils'
import type { GameStatus } from '@/types'

export const dynamic = 'force-dynamic'

// Página privada (requer login) — fora do índice de busca.
export const metadata = {
  robots: { index: false, follow: false },
}

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

function PhaseSection({ phase, rows, predMap }: { phase: string; rows: GameRow[]; predMap: Map<string, PredictionRow> }) {
  const phasePreds = rows.map(r => predMap.get(r.id)).filter(Boolean)
  const phasePts = phasePreds.reduce((s, p) => s + (p!.points ?? 0), 0)
  const meta = `${phasePreds.length} palpites · ${phasePts} pts`

  return (
    <Card className="rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-[20px] py-[16px]">
        <div className="flex items-baseline gap-[12px]">
          <span className="font-barlow text-[17px] font-bold text-primary">{phase}</span>
          <span className="font-inter text-[12px] font-medium text-white/[42%]">{meta}</span>
        </div>
      </div>

      <Eyebrow className="grid [grid-template-columns:1fr_90px_90px_80px] gap-[10px] px-[20px] py-[8px] text-[10px] tracking-[.14em] border-t border-white/[6%]">
        <span>Jogo</span>
        <span className="text-center">Resultado</span>
        <span className="text-center">Palpite</span>
        <span className="text-right">Pts</span>
      </Eyebrow>

      {rows.map((game) => {
        const pred = predMap.get(game.id)
        const isLive = game.status === 'LIVE' || game.status === 'PAUSED'
        const isFinished = game.status === 'FINISHED'
        const hasResult = isFinished || isLive
        // Só dá pra palpitar em jogo agendado e antes do apito (mesmo gatilho da
        // página do jogo). Jogos passados sem palpite mostram "—", não "Palpitar".
        const canStillPredict = game.status === 'SCHEDULED' && game.startsAt > new Date()

        const realDisplay = hasResult && game.homeScore !== null && game.awayScore !== null
          ? `${game.homeScore} - ${game.awayScore}`
          : '—'
        const guessDisplay = pred ? `${pred.homeScore} - ${pred.awayScore}` : '—'

        return (
          <div key={game.id} className="grid [grid-template-columns:1fr_90px_90px_80px] gap-[10px] px-[20px] py-[12px] items-center border-t border-white/[5%]">
            <div className="flex items-center gap-[9px]">
              <span className="font-barlow text-[14px] font-semibold text-primary">
                {game.homeTeam.slice(0, 3).toUpperCase()} × {game.awayTeam.slice(0, 3).toUpperCase()}
              </span>
              {isLive && (
                <span className="inline-flex items-center gap-[4px] font-barlow text-[8px] font-semibold tracking-[.1em] text-accent bg-accent/[12%] rounded-[4px] px-[6px] py-[2px] uppercase">
                  ● Ao vivo
                </span>
              )}
            </div>
            <span className={cn('text-center font-barlow text-[14px] font-semibold', hasResult ? 'text-white' : 'text-white/30')}>
              {realDisplay}
            </span>
            <span className="text-center font-barlow text-[14px] font-semibold text-white/70">
              {guessDisplay}
            </span>
            <div className="flex justify-end">
              {pred && pred.points !== null ? (
                <PointsBadge points={pred.points} />
              ) : pred && !hasResult ? (
                <span className="font-inter text-[12px] text-white/[42%]">—</span>
              ) : !pred && canStillPredict ? (
                <Link href={`/jogos/${game.id}`} className="font-inter text-[12px] font-bold text-accent">Palpitar</Link>
              ) : (
                <span className="font-inter text-[12px] text-white/[42%]">—</span>
              )}
            </div>
          </div>
        )
      })}
    </Card>
  )
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
      <div className="flex items-center gap-[14px]">
        <Avatar src={session.user.image ?? null} name={session.user.nickname ?? session.user.name ?? 'U'} size={54} />
        <div>
          <Eyebrow className="text-[12px] tracking-[.22em]">Meus palpites</Eyebrow>
          <h1 className="font-barlow text-[32px] font-extrabold text-primary mt-[3px] leading-none">
            {session.user.nickname ?? session.user.name ?? 'Você'}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[14px] mt-[26px]">
        <StatCard label="Pontos" value={totalPoints} tone="accent" />
        <StatCard label="Acertos exatos" value={exactHits} />
        <StatCard label="Acertos de vencedor" value={winnerHits} />
        <StatCard label="Jogos palpitados" value={gamesPlayed} />
      </div>

      <div className="mt-[26px] flex flex-col gap-[12px]">
        {phases.map((phase) => (
          <PhaseSection key={phase} phase={phase} rows={byPhase[phase]} predMap={predMap} />
        ))}
      </div>

      <Card className="rounded-[14px] p-[20px] mt-[26px]">
        <Eyebrow className="text-[11px] tracking-[.2em]">Privacidade e dados</Eyebrow>
        <p className="font-inter text-[13px] leading-[1.55] text-white/[55%] mt-[8px] max-w-[520px]">
          Você pode baixar uma cópia dos seus dados ou excluir sua conta a qualquer momento. A exclusão é permanente e não pode ser desfeita.
        </p>
        <div className="flex flex-wrap items-center gap-[12px] mt-[16px]">
          <a
            href="/api/account/export"
            download
            className="inline-flex items-center bg-transparent border border-border text-secondary hover:text-primary px-[18px] py-[10px] rounded-[10px] font-inter text-[13px] font-semibold transition-colors"
          >
            Baixar meus dados
          </a>
          <DeleteAccountButton />
        </div>
      </Card>
    </Container>
  )
}
