import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const NICKNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { nickname?: unknown }
  const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : ''

  if (!NICKNAME_REGEX.test(nickname)) {
    return NextResponse.json(
      { error: 'Nickname inválido. Use 3–20 caracteres: letras, números ou _' },
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
