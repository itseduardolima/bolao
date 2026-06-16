import { prisma } from '@/lib/prisma'
import Container from '@/components/layout/Container'
import SectionTitle from '@/components/layout/SectionTitle'
import Avatar from '@/components/ui/Avatar'
export const dynamic = 'force-dynamic'

type RankingRow = {
  id: string
  nickname: string | null
  image: string | null
  totalPoints: bigint
  exactHits: bigint
  winnerHits: bigint
  gamesPlayed: bigint
}

export default async function HomePage() {
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

  const ranking = rows.map((row) => ({
    id: row.id,
    nickname: row.nickname,
    image: row.image,
    totalPoints: Number(row.totalPoints),
    exactHits: Number(row.exactHits),
    winnerHits: Number(row.winnerHits),
    gamesPlayed: Number(row.gamesPlayed),
  }))

  const rankColors: Record<number, string> = {
    1: 'text-[#FFD700] font-bold',
    2: 'text-[#C0C0C0] font-bold',
    3: 'text-[#CD7F32] font-bold',
  }

  return (
    <Container>
      <SectionTitle className="mb-6">Ranking</SectionTitle>

      {ranking.length === 0 ? (
        <p className="font-inter text-sm text-muted">Nenhum participante ainda.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="font-inter text-[11px] uppercase tracking-widest text-muted pb-3 text-left w-8">#</th>
                <th className="font-inter text-[11px] uppercase tracking-widest text-muted pb-3 text-left">Participante</th>
                <th className="font-inter text-[11px] uppercase tracking-widest text-muted pb-3 text-center">Pontos</th>
                <th className="font-inter text-[11px] uppercase tracking-widest text-muted pb-3 text-center hidden sm:table-cell">Exatos</th>
                <th className="font-inter text-[11px] uppercase tracking-widest text-muted pb-3 text-center hidden sm:table-cell">Vencedor</th>
                <th className="font-inter text-[11px] uppercase tracking-widest text-muted pb-3 text-center hidden sm:table-cell">Jogos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, index) => {
                const rank = index + 1

                return (
                  <tr
                    key={entry.id}
                    className="border-b border-border transition-colors hover:bg-elevated/50"
                  >
                    <td className="py-3 pr-3 align-middle">
                      <span
                        className={cn(
                          'text-sm',
                          rankColors[rank] ?? 'text-muted text-sm'
                        )}
                      >
                        {rank}
                      </span>
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={entry.image}
                          name={entry.nickname ?? 'U'}
                          size={36}
                        />
                        {entry.nickname ? (
                          <span className="font-inter text-sm text-primary">{entry.nickname}</span>
                        ) : (
                          <span className="font-inter text-sm text-muted">Sem apelido</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-center align-middle">
                      {entry.totalPoints > 0 ? (
                        <span className="font-barlow text-xl font-bold text-accent">
                          {entry.totalPoints}
                        </span>
                      ) : (
                        <span className="font-barlow text-xl text-muted">0</span>
                      )}
                    </td>
                    <td className="py-3 text-center align-middle hidden sm:table-cell">
                      <span className="font-inter text-sm text-secondary">{entry.exactHits}</span>
                    </td>
                    <td className="py-3 text-center align-middle hidden sm:table-cell">
                      <span className="font-inter text-sm text-secondary">{entry.winnerHits}</span>
                    </td>
                    <td className="py-3 text-center align-middle hidden sm:table-cell">
                      <span className="font-inter text-sm text-secondary">{entry.gamesPlayed}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  )
}
