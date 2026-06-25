import { cn } from '@/lib/utils'

type SpinnerProps = {
  // 'light' = anel branco sobre fundo escuro; 'dark' = anel preto sobre o accent.
  tone?: 'light' | 'dark'
  className?: string
}

export default function Spinner({ tone = 'dark', className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block h-[15px] w-[15px] animate-spin rounded-full border-2',
        tone === 'light' ? 'border-white/20 border-t-white' : 'border-black/30 border-t-black',
        className
      )}
    />
  )
}
