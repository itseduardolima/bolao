'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type SavePredictionResult = { success: true } | { error: string }

export async function savePrediction(
  gameId: string,
  homeScore: number,
  awayScore: number
): Promise<SavePredictionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Não autenticado' }
  }

  if (
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    homeScore > 99 ||
    awayScore < 0 ||
    awayScore > 99
  ) {
    return { error: 'Palpite inválido' }
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { startsAt: true },
  })

  if (!game) return { error: 'Jogo não encontrado' }

  if (new Date(game.startsAt) <= new Date()) {
    return { error: 'Prazo encerrado' }
  }

  await prisma.prediction.upsert({
    where: { userId_gameId: { userId: session.user.id, gameId } },
    create: { userId: session.user.id, gameId, homeScore, awayScore },
    update: { homeScore, awayScore },
  })

  return { success: true }
}
