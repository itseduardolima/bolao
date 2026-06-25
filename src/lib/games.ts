import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/**
 * Resumo de um jogo para metadata/Open Graph/JSON-LD da página de detalhe.
 * `cache` deduplica a query dentro de um mesmo render (generateMetadata + page).
 */
export const getGameSummary = cache(async (id: string) => {
  return prisma.game.findUnique({
    where: { id },
    select: {
      homeTeam: true,
      awayTeam: true,
      startsAt: true,
      status: true,
      homeScore: true,
      awayScore: true,
      phase: true,
      venue: true,
      city: true,
    },
  })
})
