'use client'
import { cn } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

type Member = { id: string; nickname: string | null; image: string | null }
type Props = {
  members: Member[]
  total: number
  size?: number
  // Cor da borda que separa os avatares — combina com o fundo onde a pilha aparece.
  borderTone?: 'surface' | 'base'
}

export default function MemberStack({ members, total, size = 26, borderTone = 'surface' }: Props) {
  const shown = members.slice(0, 4)
  const overflow = total - shown.length
  const borderClass = borderTone === 'base' ? 'border-base' : 'border-surface'

  return (
    <div className="flex items-center">
      {shown.map((m, i) => (
        <div
          key={m.id}
          className={cn('overflow-hidden rounded-full border-2', borderClass, i > 0 && '-ml-[7px]')}
        >
          <Avatar src={m.image} name={m.nickname ?? 'U'} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{ width: size, height: size }}
          className={cn(
            'flex items-center justify-center rounded-full border-2 -ml-[7px] bg-[#2a2a44] font-inter text-[10px] font-semibold text-secondary',
            borderClass
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
