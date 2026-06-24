import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import type { RankingEntry } from '@/lib/ranking'

type RankingTableProps = {
  entries: RankingEntry[]
  emptyMessage?: string
}

const rankColors: Record<number, string> = {
  1: 'text-[#FFD700] font-bold',
  2: 'text-[#C0C0C0] font-bold',
  3: 'text-[#CD7F32] font-bold',
}

export default function RankingTable({
  entries,
  emptyMessage = 'Nenhum participante ainda.',
}: RankingTableProps) {
  if (entries.length === 0) {
    return <p className="font-inter text-sm text-secondary">{emptyMessage}</p>
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="font-inter text-[11px] uppercase tracking-widest text-secondary pb-3 text-left w-8">#</th>
            <th className="font-inter text-[11px] uppercase tracking-widest text-secondary pb-3 text-left">Participante</th>
            <th className="font-inter text-[11px] uppercase tracking-widest text-secondary pb-3 text-center">Pontos</th>
            <th className="font-inter text-[11px] uppercase tracking-widest text-secondary pb-3 text-center hidden sm:table-cell">Exatos</th>
            <th className="font-inter text-[11px] uppercase tracking-widest text-secondary pb-3 text-center hidden sm:table-cell">Vencedor</th>
            <th className="font-inter text-[11px] uppercase tracking-widest text-secondary pb-3 text-center hidden sm:table-cell">Jogos</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const rank = index + 1

            return (
              <tr
                key={entry.id}
                className="border-b border-border transition-colors hover:bg-elevated/50"
              >
                <td className="py-3 pr-3 align-middle">
                  <span className={cn('text-sm', rankColors[rank] ?? 'text-secondary text-sm')}>
                    {rank}
                  </span>
                </td>
                <td className="py-3 pr-4 align-middle">
                  <div className="flex items-center gap-3">
                    <Avatar src={entry.image} name={entry.nickname ?? 'U'} size={36} />
                    {entry.nickname ? (
                      <span className="font-inter text-sm text-primary">{entry.nickname}</span>
                    ) : (
                      <span className="font-inter text-sm text-secondary">Sem apelido</span>
                    )}
                  </div>
                </td>
                <td className="py-3 text-center align-middle">
                  {entry.totalPoints > 0 ? (
                    <span className="font-barlow text-xl font-bold text-accent">
                      {entry.totalPoints}
                    </span>
                  ) : (
                    <span className="font-barlow text-xl text-secondary">0</span>
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
  )
}
