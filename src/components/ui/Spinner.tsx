import { cn } from '@/lib/utils'

type SpinnerProps = {
  // light = branco; dark = preto (sobre accent); accent = verde; error = vermelho.
  tone?: 'light' | 'dark' | 'accent' | 'error'
  className?: string
}

const toneStyles: Record<NonNullable<SpinnerProps['tone']>, string> = {
  light: 'border-white/20 border-t-white',
  dark: 'border-black/30 border-t-black',
  accent: 'border-accent/30 border-t-accent',
  error: 'border-white/20 border-t-error',
}

export default function Spinner({ tone = 'dark', className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block h-[15px] w-[15px] animate-spin rounded-full border-2',
        toneStyles[tone],
        className
      )}
    />
  )
}
