import { cn } from '@/lib/utils'

type SpinnerProps = {
  // 'light' = anel branco sobre fundo escuro; 'dark' = anel preto sobre o accent;
  // 'accent' = anel verde sobre fundo escuro.
  tone?: 'light' | 'dark' | 'accent'
  className?: string
}

const toneStyles: Record<NonNullable<SpinnerProps['tone']>, string> = {
  light: 'border-white/20 border-t-white',
  dark: 'border-black/30 border-t-black',
  accent: 'border-accent/30 border-t-accent',
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
