import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string
}

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-border bg-elevated px-3 py-2',
        'font-inter text-[16px] text-primary placeholder:text-muted',
        'transition-colors focus:border-accent focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
      {...props}
    />
  )
}

type InputScoreProps = Omit<InputProps, 'type' | 'min' | 'max'>

export function InputScore({ className, ...props }: InputScoreProps) {
  return (
    <input
      type="number"
      min={0}
      max={99}
      className={cn(
        'h-14 w-16 rounded-md border border-border bg-elevated text-center',
        'font-barlow text-2xl font-extrabold text-primary',
        'transition-colors focus:border-accent focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-40',
        '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        className
      )}
      {...props}
    />
  )
}
