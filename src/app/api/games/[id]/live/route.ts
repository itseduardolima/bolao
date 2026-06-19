import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncGames } from '@/lib/sync'

const STALE_THRESHOLD_MS = 4.5 * 60_000

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const game = await prisma.game.findUnique({
    where: { id },
    select: { status: true, homeScore: true, awayScore: true, updatedAt: true },
  })

  if (!game) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (game.status === 'LIVE' || game.status === 'PAUSED') {
    const stale = Date.now() - game.updatedAt.getTime() > STALE_THRESHOLD_MS
    if (stale) {
      await syncGames(true)
      // Touch updatedAt so subsequent polls from any instance skip re-sync
      await prisma.game.update({ where: { id }, data: { status: game.status } })

      const fresh = await prisma.game.findUnique({
        where: { id },
        select: { status: true, homeScore: true, awayScore: true },
      })

      if (fresh) {
        return NextResponse.json(fresh)
      }
    }
  }

  return NextResponse.json({
    status: game.status,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
  })
}
