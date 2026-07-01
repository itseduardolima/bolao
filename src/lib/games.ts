import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

/**
 * Lista de jogos exibida em /jogos: igual para todos os usuários, então é
 * cacheada e invalidada via tag ('games') quando o sync grava novos placares.
 */
export const getAllGames = unstable_cache(
  async () => {
    return prisma.game.findMany({
      orderBy: { startsAt: 'asc' },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        homeFlag: true,
        awayFlag: true,
        startsAt: true,
        status: true,
        duration: true,
        homeScore: true,
        awayScore: true,
        extraTimeHome: true,
        extraTimeAway: true,
        penaltiesHome: true,
        penaltiesAway: true,
        phase: true,
      },
    })
  },
  ['all-games'],
  { revalidate: 60, tags: ['games'] }
)

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
