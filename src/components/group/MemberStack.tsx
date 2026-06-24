import Avatar from '@/components/ui/Avatar'

type StackMember = {
  id: string
  nickname: string | null
  image: string | null
}

type MemberStackProps = {
  members: StackMember[]
  total: number
  size?: number
  /** Cor do anel que separa os avatares — combine com o fundo do container. */
  ring?: string
}

export default function MemberStack({
  members,
  total,
  size = 28,
  ring = 'ring-surface',
}: MemberStackProps) {
  const shown = members.slice(0, 4)
  const rest = total - shown.length

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((m) => (
          <div key={m.id} className={`rounded-full ring-2 ${ring}`}>
            <Avatar src={m.image} name={m.nickname ?? 'U'} size={size} />
          </div>
        ))}
      </div>
      {rest > 0 && (
        <span className="ml-2 font-inter text-xs text-secondary">+{rest}</span>
      )}
    </div>
  )
}
