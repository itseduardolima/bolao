import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const game = await prisma.game.findUnique({
    where: { id },
    select: { status: true, homeScore: true, awayScore: true },
  })

  if (!game) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    status: game.status,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
  })
}
