import { cn } from '@/lib/utils'

type CardProps = React.HTMLAttributes<HTMLDivElement>

// Caixa padrão do app: superfície + borda + raio. Padding e raio específico
// (rounded-[14px]/[16px]) ficam a cargo de quem usa, via className.
export default function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-surface border border-border rounded-xl', className)}
      {...props}
    >
      {children}
    </div>
  )
}
