import { cn } from '@/lib/utils'

type SectionTitleProps = {
  children: React.ReactNode
  className?: string
}

export default function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h2
      className={cn(
        'font-barlow text-section uppercase tracking-wide text-primary',
        className
      )}
    >
      {children}
    </h2>
  )
}
