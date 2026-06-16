import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { nickname?: unknown }
  const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : ''

  if (nickname.length < 3 || nickname.length > 20) {
    return NextResponse.json(
      { error: 'O apelido deve ter entre 3 e 20 caracteres' },
      { status: 400 }
    )
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { nickname, hasNickname: true },
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const isPrismaUniqueError =
      err instanceof Error && err.message.includes('Unique constraint')
    if (isPrismaUniqueError) {
      return NextResponse.json(
        { error: 'Esse apelido já foi escolhido, tente outro' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Erro ao salvar nickname' }, { status: 500 })
  }
}
