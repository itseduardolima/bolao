import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({}, { status: 401 })
  }

  const gameIds = (req.nextUrl.searchParams.get('gameIds') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (gameIds.length === 0) {
    return NextResponse.json({})
  }

  const predictions = await prisma.prediction.findMany({
    where: { userId: session.user.id, gameId: { in: gameIds } },
    select: { gameId: true, homeScore: true, awayScore: true, points: true },
  })

  const result = Object.fromEntries(
    predictions.map((p) => [
      p.gameId,
      { homeScore: p.homeScore, awayScore: p.awayScore, points: p.points },
    ])
  )

  return NextResponse.json(result)
}
