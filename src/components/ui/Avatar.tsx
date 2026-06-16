import Image from 'next/image'
import { cn } from '@/lib/utils'

type AvatarProps = {
  src: string | null
  name: string
  size?: number
  className?: string
}

export default function Avatar({ src, name, size = 36, className }: AvatarProps) {
  const initials = name
    .split(/[\s_]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-elevated font-barlow font-bold text-accent',
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
    />
  )
}
