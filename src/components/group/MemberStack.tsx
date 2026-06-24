'use client'
import Avatar from '@/components/ui/Avatar'

type Member = { id: string; nickname: string | null; image: string | null }
type Props = { members: Member[]; total: number; size?: number; borderColor?: string }

export default function MemberStack({ members, total, size = 26, borderColor = '#16162a' }: Props) {
  const shown = members.slice(0, 4)
  const overflow = total - shown.length
  const borderStyle = { border: `2px solid ${borderColor}` }

  return (
    <div className="flex items-center">
      {shown.map((m, i) => (
        <div
          key={m.id}
          style={{ marginLeft: i === 0 ? 0 : -7, ...borderStyle, borderRadius: '9999px' }}
          className="overflow-hidden"
        >
          <Avatar src={m.image} name={m.nickname ?? 'U'} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{ width: size, height: size, marginLeft: -7, ...borderStyle }}
          className="flex items-center justify-center rounded-full bg-[#2a2a44] font-inter text-[10px] font-semibold text-secondary"
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
