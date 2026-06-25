import Link from 'next/link'
import { cn } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Eyebrow from '@/components/ui/Eyebrow'
import type { RankingEntry } from '@/lib/ranking'

type Props = {
  entries: RankingEntry[]
  currentUserId?: string
  emptyMessage?: string
}

const GRID = 'grid [grid-template-columns:40px_1fr_64px] sm:[grid-template-columns:48px_1fr_80px_80px_80px_70px] gap-[8px]'
const HEAD = 'text-[10px] tracking-[.14em]'

function positionClass(rank: number, isYou: boolean) {
  if (isYou) return 'text-accent'
  if (rank === 1) return 'text-[#FFD700]'
  if (rank === 2) return 'text-[#C0C0C0]'
  if (rank === 3) return 'text-[#CD7F32]'
  return 'text-white/50'
}

export default function RankingTable({ entries, currentUserId }: Props) {
  if (entries.length === 0) {
    return (
      <div className="mt-[28px] border border-dashed border-white/[14%] rounded-[14px] px-[40px] py-[56px] text-center">
        <div className="font-barlow text-[24px] font-extrabold text-primary">Ninguém palpitou ainda</div>
        <p className="font-inter text-[14px] leading-[1.6] text-white/55 max-w-[380px] mx-auto mt-[10px]">
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
      <div className={cn(GRID, 'px-[14px] pb-[10px]')}>
        <Eyebrow className={HEAD}>Pos</Eyebrow>
        <Eyebrow className={HEAD}>Participante</Eyebrow>
        <Eyebrow className={cn(HEAD, 'text-right')}>Pontos</Eyebrow>
        <Eyebrow className={cn(HEAD, 'hidden sm:block text-right')}>Exatos</Eyebrow>
        <Eyebrow className={cn(HEAD, 'hidden sm:block text-right')}>Venc.</Eyebrow>
        <Eyebrow className={cn(HEAD, 'hidden sm:block text-right')}>Jogos</Eyebrow>
      </div>

      <div className="flex flex-col">
        {entries.map((entry, index) => {
          const rank = index + 1
          const isYou = !!currentUserId && entry.id === currentUserId

          return (
            <div
              key={entry.id}
              className={cn(GRID, 'items-center py-[12px] px-[14px] rounded-[10px]', isYou && 'bg-accent/[8%]')}
            >
              <span className={cn('font-barlow text-[17px] font-extrabold', positionClass(rank, isYou))}>
                {rank}
              </span>

              <div className="flex items-center gap-[10px] min-w-0">
                <Avatar src={entry.image} name={entry.nickname ?? 'U'} size={30} className="shrink-0" />
                <div className="min-w-0">
                  <div className={cn('font-inter text-[14px] text-primary truncate', isYou ? 'font-bold' : 'font-medium')}>
                    {entry.nickname ?? 'Sem apelido'}
                  </div>
                  <div className="sm:hidden font-inter text-[10.5px] text-white/[42%] mt-[1px]">
                    {entry.exactHits} exatos · {entry.winnerHits} venc · {entry.gamesPlayed} jogos
                  </div>
                </div>
              </div>

              <span className="font-barlow text-[16px] font-bold text-right text-primary">
                {entry.totalPoints}
              </span>

              <span className="hidden sm:block font-inter text-[13px] font-medium text-right text-white/55">
                {entry.exactHits}
              </span>
              <span className="hidden sm:block font-inter text-[13px] font-medium text-right text-white/55">
                {entry.winnerHits}
              </span>
              <span className="hidden sm:block font-inter text-[13px] font-medium text-right text-white/[42%]">
                {entry.gamesPlayed}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
