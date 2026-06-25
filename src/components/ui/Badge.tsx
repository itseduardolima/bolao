import { cn } from '@/lib/utils'
import type { GameStatus } from '@/types'

type BadgeVariant = GameStatus

type BadgeProps = {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  SCHEDULED: 'bg-elevated text-scheduled',
  LIVE: 'bg-accent-dim text-accent border border-accent-border animate-pulse-live',
  PAUSED: 'bg-warning-dim text-warning border border-warning-border',
  FINISHED: 'bg-finished-dim text-finished',
}

const statusLabels: Partial<Record<BadgeVariant, string>> = {
  SCHEDULED: 'Agendado',
  LIVE: 'Ao vivo',
  PAUSED: 'Intervalo',
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
