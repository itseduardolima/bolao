import { cn } from '@/lib/utils'

type EyebrowProps = React.HTMLAttributes<HTMLDivElement>

// Rótulo pequeno em maiúsculas com tracking (o "olho-de-sobrancelha" acima de
// títulos/seções/campos). Variações de tracking/cor entram via className.
export default function Eyebrow({ className, children, ...props }: EyebrowProps) {
  return (
    <div
      className={cn(
        'font-barlow text-[11px] font-semibold uppercase tracking-[.2em] text-white/[42%]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
