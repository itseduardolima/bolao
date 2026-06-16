import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const NICKNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const value = req.nextUrl.searchParams.get('value') ?? ''

  if (!NICKNAME_REGEX.test(value)) {
    return NextResponse.json({ available: false })
  }

  const existing = await prisma.user.findUnique({
    where: { nickname: value },
    select: { id: true },
  })

  return NextResponse.json({ available: !existing })
}
