import { NextRequest, NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'crypto'
import { syncGames } from '@/lib/sync'
import { cleanupExpiredPayments } from '@/lib/retention'

export const dynamic = 'force-dynamic'

function safeCompare(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!authHeader || !safeCompare(authHeader, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const force = req.nextUrl.searchParams.get('force') === 'true'
  const result = await syncGames(force)

  // Expurgo de retenção: limpa cobranças PIX abandonadas. Não-fatal — uma falha
  // aqui não pode comprometer o sync de jogos.
  let purgedPayments = 0
  try {
    purgedPayments = await cleanupExpiredPayments()
  } catch (err) {
    console.error('[cron] cleanupExpiredPayments falhou:', err)
  }

  return NextResponse.json({ sync: result, purgedPayments })
}
