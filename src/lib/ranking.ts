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
export async function getGlobalRanking(): Promise<RankingEntry[]> {
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
}

/**
 * Ranking restrito aos membros de um grupo. Parte de GroupMember para
 * incluir apenas quem realmente pertence ao grupo. `groupId` entra como
 * parâmetro vinculado (tagged template) — nunca interpolado em string —
 * portanto não há superfície de SQL injection.
 */
export async function getGroupRanking(groupId: string): Promise<RankingEntry[]> {
  const rows = await prisma.$queryRaw<RankingRow[]>`
    SELECT
      u.id,
      u.nickname,
      u.image,
      COALESCE(SUM(ep.points), 0) AS totalPoints,
      COUNT(CASE WHEN ep.points = 3 THEN 1 END) AS exactHits,
      COUNT(CASE WHEN ep.points = 1 THEN 1 END) AS winnerHits,
      COUNT(ep.id) AS gamesPlayed
    FROM GroupMember gm
    JOIN User u      ON u.id = gm.userId
    JOIN "Group" grp ON grp.id = gm.groupId
    LEFT JOIN (
      SELECT p.id, p.userId, p.points, g.startsAt
      FROM Prediction p
      JOIN Game g ON g.id = p.gameId
    ) ep ON ep.userId = u.id AND ep.startsAt >= grp.createdAt
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
}
