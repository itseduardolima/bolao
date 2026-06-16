import { cn } from '@/lib/utils'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-barlow font-bold uppercase tracking-wide transition-opacity',
        'rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        variant === 'primary' && 'bg-accent text-base hover:opacity-85',
        variant === 'ghost' &&
          'border border-border text-secondary hover:text-primary',
        size === 'md' && 'px-6 py-2.5 text-base',
        size === 'sm' && 'px-4 py-1.5 text-sm',
        disabled && 'cursor-not-allowed opacity-30',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
