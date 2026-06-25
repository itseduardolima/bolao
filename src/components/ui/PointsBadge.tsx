import { cn } from '@/lib/utils'

type PointsBadgeProps = {
  points: number
  className?: string
}

const toneByPoints: Record<number, string> = {
  3: 'text-accent bg-accent/[12%]',
  1: 'text-warning bg-[rgba(245,158,11,.14)]',
  0: 'text-white/50 bg-white/[7%]',
}

// Selo de pontos do palpite (+3 / +1 / 0). Visual compartilhado entre /perfil e
// o GameCard. Pontuação: 3 = placar exato, 1 = vencedor, 0 = erro.
export default function PointsBadge({ points, className }: PointsBadgeProps) {
  const tone = toneByPoints[points] ?? toneByPoints[0]
  const label = points === 3 ? '+3' : points === 1 ? '+1' : '0'
  return (
    <span
      className={cn(
        'font-barlow text-[12px] font-bold rounded-[6px] px-[10px] py-[3px]',
        tone,
        className
      )}
    >
      {label}
    </span>
  )
}
