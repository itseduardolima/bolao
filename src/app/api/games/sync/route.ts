import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { syncGames } from '@/lib/sync'

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await syncGames(true)
  return NextResponse.json(result)
}
