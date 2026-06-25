import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGroupRanking } from '@/lib/ranking'
import { GROUP_ROLE } from '@/lib/group-constants'
import Avatar from '@/components/ui/Avatar'
import RankingTable from '@/components/ranking/RankingTable'
import GroupTabs from '@/components/group/GroupTabs'
import InviteLink from '@/components/group/InviteLink'
import GroupActions from '@/components/group/GroupActions'
import RemoveMemberButton from '@/components/group/RemoveMemberButton'

export const dynamic = 'force-dynamic'

// Página privada (requer login) — fora do índice de busca.
export const metadata = {
  robots: { index: false, follow: false },
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/?login=1')
  const userId = session.user.id

  // Porta de acesso: precisa ser MEMBRO. notFound() (não 403) para não revelar
  // a existência do grupo a quem não participa.
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
    select: { id: true },
  })
  if (!membership) notFound()

  const group = await prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      inviteCode: true,
      ownerId: true,
      members: {
        select: {
          role: true,
          user: { select: { id: true, nickname: true, image: true } },
        },
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      },
    },
  })
  if (!group) notFound()

  const isOwner = group.ownerId === userId
  const ranking = await getGroupRanking(group.id)

  const memberCount = ranking.length
  const leader = ranking[0]?.nickname ?? null

  const membersPanel = (
    <ul className="flex flex-col">
      {group.members.map(({ role, user }) => {
        const isGroupOwner = role === GROUP_ROLE.OWNER
        return (
          <li key={user.id} className="flex items-center justify-between gap-3 py-3 px-[14px] rounded-[10px] last:border-b-0">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={user.image} name={user.nickname ?? 'U'} size={32} />
              <span className="font-inter text-[14px] font-semibold text-primary truncate">
                {user.nickname ?? 'Sem apelido'}
              </span>
              {isGroupOwner && (
                <span className="font-barlow text-[9px] font-semibold uppercase tracking-[.14em] text-accent bg-accent/[.13] rounded-[4px] px-[7px] py-[3px]">
                  Dono
                </span>
              )}
            </div>
            {isOwner && !isGroupOwner && (
              <RemoveMemberButton
                groupId={group.id}
                targetUserId={user.id}
                targetName={user.nickname ?? 'este membro'}
              />
            )}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-6">
      {/* Breadcrumb */}
      <Link
        href="/grupos"
        className="inline-flex items-center gap-[7px] font-inter text-[12px] font-medium text-white/[42%] hover:text-secondary transition-colors"
      >
        <span className="inline-block w-[7px] h-[7px] border-l-2 border-b-2 border-current rotate-45" />
        Ligas
        <span className="text-white/[27%]">/</span>
        <span className="text-white/[67%]">{group.name}</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mt-[18px]">
        <div>
          <div className="flex items-center gap-[10px] flex-wrap">
            <h1 className="font-barlow text-[40px] font-black uppercase text-primary leading-none m-0">
              {group.name}
            </h1>
            {isOwner && (
              <span className="font-barlow text-[10px] font-semibold uppercase tracking-[.14em] text-accent bg-accent/[.13] rounded-[5px] px-[9px] py-[4px]">
                Você é o dono
              </span>
            )}
          </div>
          <div className="font-inter text-[14px] text-white/[67%] mt-2">
            {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
            {leader && (
              <> · liderado por <span className="text-primary font-semibold">{leader}</span></>
            )}
          </div>
        </div>
      </div>

      {/* Convite */}
      <div className="mt-[22px]">
        <InviteLink groupId={group.id} code={group.inviteCode} isOwner={isOwner} />
      </div>

      {/* Abas: ranking livre + gestão de membros separada */}
      <div className="mt-[26px]">
        <GroupTabs
          tabs={[
            { id: 'ranking', label: 'Classificação', content: <RankingTable entries={ranking} currentUserId={userId} /> },
            { id: 'membros', label: 'Membros', content: membersPanel },
          ]}
        />
      </div>

      {/* Zona de risco */}
      <div className="mt-[30px] pt-5 border-white/[.06] flex justify-end">
        <GroupActions groupId={group.id} isOwner={isOwner} />
      </div>
    </div>
  )
}
