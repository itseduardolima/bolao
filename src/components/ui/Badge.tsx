import { cn } from '@/lib/utils'
import type { GameStatus } from '@/types'

type BadgeVariant = GameStatus | 'points-exact' | 'points-winner' | 'points-miss'

type BadgeProps = {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  SCHEDULED: 'bg-elevated text-scheduled',
  LIVE: 'bg-accent-dim text-accent border border-accent-border animate-pulse-live',
  FINISHED: 'bg-[#1a3a4a] text-finished',
  'points-exact': 'bg-accent-dim text-accent border border-accent-border',
  'points-winner': 'bg-[#2a2a1a] text-warning border border-[#ffd43b44]',
  'points-miss': 'bg-elevated text-muted',
}

const statusLabels: Partial<Record<BadgeVariant, string>> = {
  SCHEDULED: 'Agendado',
  LIVE: 'Ao vivo',
  FINISHED: 'Encerrado',
}

export default function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 font-inter text-[11px] font-semibold uppercase tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: GameStatus }) {
  return <Badge variant={status}>{statusLabels[status]}</Badge>
}
