import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'
import type { RankingEntry } from '@/lib/ranking'

type Props = {
  entries: RankingEntry[]
  currentUserId?: string
  emptyMessage?: string
}

function positionColor(rank: number, isYou: boolean) {
  if (isYou) return '#00ff87'
  if (rank === 1) return '#FFD700'
  if (rank === 2) return '#C0C0C0'
  if (rank === 3) return '#CD7F32'
  return 'rgba(255,255,255,0.5)'
}

export default function RankingTable({ entries, currentUserId }: Props) {
  if (entries.length === 0) {
    return (
      <div className="mt-[28px] border border-dashed border-[rgba(255,255,255,.14)] rounded-[14px] px-[40px] py-[56px] text-center">
        <div className="font-barlow text-[24px] font-extrabold text-primary">Ninguém palpitou ainda</div>
        <p className="font-inter text-[14px] leading-[1.6] text-[rgba(255,255,255,.55)] max-w-[380px] mx-auto mt-[10px]">
          Assim que os primeiros palpites forem registrados, o ranking aparece aqui. Seja o primeiro.
        </p>
        <Link
          href="/jogos"
          className="inline-flex items-center justify-center h-[48px] px-[24px] mt-[22px] bg-accent text-black rounded-[12px] font-inter text-[14px] font-bold"
        >
          Ir para os jogos
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-[18px]">
      <div className="grid [grid-template-columns:40px_1fr_64px] sm:[grid-template-columns:48px_1fr_80px_80px_80px_70px] gap-[8px] px-[14px] pb-[10px]">
        <span className="font-[Barlow_Condensed] text-[10px] font-semibold uppercase tracking-[.14em] text-[rgba(255,255,255,.42)]">Pos</span>
        <span className="font-[Barlow_Condensed] text-[10px] font-semibold uppercase tracking-[.14em] text-[rgba(255,255,255,.42)]">Participante</span>
        <span className="font-[Barlow_Condensed] text-[10px] font-semibold uppercase tracking-[.14em] text-[rgba(255,255,255,.42)] text-right">Pontos</span>
        <span className="hidden sm:block font-[Barlow_Condensed] text-[10px] font-semibold uppercase tracking-[.14em] text-[rgba(255,255,255,.42)] text-right">Exatos</span>
        <span className="hidden sm:block font-[Barlow_Condensed] text-[10px] font-semibold uppercase tracking-[.14em] text-[rgba(255,255,255,.42)] text-right">Venc.</span>
        <span className="hidden sm:block font-[Barlow_Condensed] text-[10px] font-semibold uppercase tracking-[.14em] text-[rgba(255,255,255,.42)] text-right">Jogos</span>
      </div>

      <div className="flex flex-col">
        {entries.map((entry, index) => {
          const rank = index + 1
          const isYou = !!currentUserId && entry.id === currentUserId
          const rowBg = isYou ? 'rgba(0,255,135,0.08)' : 'transparent'
          const pc = positionColor(rank, isYou)

          return (
            <div
              key={entry.id}
              className="grid [grid-template-columns:40px_1fr_64px] sm:[grid-template-columns:48px_1fr_80px_80px_80px_70px] gap-[8px] items-center py-[12px] px-[14px] rounded-[10px]"
              style={{ background: rowBg }}
            >
              <span
                className="font-barlow text-[17px] font-extrabold"
                style={{ color: pc }}
              >
                {rank}
              </span>

              <div className="flex items-center gap-[10px] min-w-0">
                <Avatar src={entry.image} name={entry.nickname ?? 'U'} size={30} className="shrink-0" />
                <div className="min-w-0">
                  <div
                    className="font-inter text-[14px] text-primary truncate"
                    style={{ fontWeight: isYou ? 700 : 500 }}
                  >
                    {entry.nickname ?? 'Sem apelido'}
                  </div>
                  <div className="sm:hidden font-inter text-[10.5px] text-[rgba(255,255,255,.42)] mt-[1px]">
                    {entry.exactHits} exatos · {entry.winnerHits} venc · {entry.gamesPlayed} jogos
                  </div>
                </div>
              </div>

              <span className="font-barlow text-[16px] font-bold text-right text-primary">
                {entry.totalPoints}
              </span>

              <span className="hidden sm:block font-inter text-[13px] font-medium text-right text-[rgba(255,255,255,.55)]">
                {entry.exactHits}
              </span>
              <span className="hidden sm:block font-inter text-[13px] font-medium text-right text-[rgba(255,255,255,.55)]">
                {entry.winnerHits}
              </span>
              <span className="hidden sm:block font-inter text-[13px] font-medium text-right text-[rgba(255,255,255,.42)]">
                {entry.gamesPlayed}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
