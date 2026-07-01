import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export type RankingEntry = {
  id: string
  nickname: string | null
  image: string | null
  totalPoints: number
  exactHits: number
  winnerHits: number
  gamesPlayed: number
}

type RankingRow = {
  id: string
  nickname: string | null
  image: string | null
  totalPoints: bigint
  exactHits: bigint
  winnerHits: bigint
  gamesPlayed: bigint
}

function mapRows(rows: RankingRow[]): RankingEntry[] {
  return rows.map((row) => ({
    id: row.id,
    nickname: row.nickname,
    image: row.image,
    totalPoints: Number(row.totalPoints),
    exactHits: Number(row.exactHits),
    winnerHits: Number(row.winnerHits),
    gamesPlayed: Number(row.gamesPlayed),
  }))
}

/**
 * Ranking geral: todos os usuários cadastrados (mesmo sem palpites).
 * Mantém o comportamento histórico da home.
 */
export const getGlobalRanking = unstable_cache(
  async (): Promise<RankingEntry[]> => {
    const rows = await prisma.$queryRaw<RankingRow[]>`
      SELECT
        u.id,
        u.nickname,
        u.image,
        COALESCE(SUM(p.points), 0) AS totalPoints,
        COUNT(CASE WHEN p.points = 3 THEN 1 END) AS exactHits,
        COUNT(CASE WHEN p.points = 1 THEN 1 END) AS winnerHits,
        COUNT(p.id) AS gamesPlayed
      FROM User u
      LEFT JOIN Prediction p ON p.userId = u.id
      GROUP BY u.id, u.nickname, u.image
      ORDER BY
        totalPoints DESC,
        exactHits DESC,
        winnerHits DESC,
        gamesPlayed DESC,
        u.nickname ASC
    `
    return mapRows(rows)
  },
  ['global-ranking'],
  { revalidate: 60, tags: ['ranking'] }
)

/**
 * Ranking restrito aos membros de um grupo. Parte de GroupMember para
 * incluir apenas quem realmente pertence ao grupo. `groupId` entra como
 * parâmetro vinculado (tagged template) — nunca interpolado em string —
 * portanto não há superfície de SQL injection.
 */
export const getGroupRanking = unstable_cache(
  async (groupId: string): Promise<RankingEntry[]> => {
    const rows = await prisma.$queryRaw<RankingRow[]>`
      SELECT
        u.id,
        u.nickname,
        u.image,
        COALESCE(SUM(CASE WHEN g.id IS NOT NULL THEN p.points END), 0) AS totalPoints,
        COUNT(CASE WHEN g.id IS NOT NULL AND p.points = 3 THEN 1 END) AS exactHits,
        COUNT(CASE WHEN g.id IS NOT NULL AND p.points = 1 THEN 1 END) AS winnerHits,
        COUNT(CASE WHEN g.id IS NOT NULL THEN p.id END) AS gamesPlayed
      FROM GroupMember gm
      JOIN User u      ON u.id = gm.userId
      JOIN "Group" grp ON grp.id = gm.groupId
      LEFT JOIN Prediction p ON p.userId = u.id
      LEFT JOIN Game g ON g.id = p.gameId AND g.startsAt >= grp.createdAt
      WHERE gm.groupId = ${groupId}
      GROUP BY u.id, u.nickname, u.image
      ORDER BY
        totalPoints DESC,
        exactHits DESC,
        winnerHits DESC,
        gamesPlayed DESC,
        u.nickname ASC
    `
    return mapRows(rows)
  },
  ['group-ranking'],
  { revalidate: 60, tags: ['ranking'] }
)
