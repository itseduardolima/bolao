import { cn } from '@/lib/utils'
import Spinner from '@/components/ui/Spinner'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger' | 'cta'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  // barlow/uppercase: botões "rótulo" (sync, ações compactas)
  primary: 'rounded-md font-barlow font-bold uppercase tracking-wide bg-accent text-black hover:opacity-85',
  ghost: 'rounded-md font-barlow font-bold uppercase tracking-wide border border-border text-secondary hover:text-primary',
  danger: 'rounded-md font-barlow font-bold uppercase tracking-wide bg-error text-white hover:opacity-90',
  // inter/caixa-normal: CTAs de formulário (salvar, confirmar, pagar)
  cta: 'rounded-xl font-inter font-bold bg-accent text-black hover:opacity-90 gap-2',
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'h-12 px-6 text-[15px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const spinnerTone = variant === 'ghost' ? 'light' : 'dark'
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center text-[16px] transition-opacity',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'cursor-not-allowed opacity-40',
        className
      )}
      {...props}
    >
      {loading && <Spinner tone={spinnerTone} />}
      {children}
    </button>
  )
}
