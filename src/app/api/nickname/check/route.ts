import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const value = req.nextUrl.searchParams.get('value')?.trim() ?? ''

  if (value.length < 3 || value.length > 20) {
    return NextResponse.json({ available: false })
  }

  const existing = await prisma.user.findUnique({
    where: { nickname: value },
    select: { id: true },
  })

  return NextResponse.json({ available: !existing })
}
