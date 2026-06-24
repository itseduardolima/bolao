import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { CaretLeft } from '@phosphor-icons/react/dist/ssr'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGroupRanking } from '@/lib/ranking'
import { GROUP_ROLE } from '@/lib/group-constants'
import Container from '@/components/layout/Container'
import Avatar from '@/components/ui/Avatar'
import RankingTable from '@/components/ranking/RankingTable'
import GroupTabs from '@/components/group/GroupTabs'
import InviteLink from '@/components/group/InviteLink'
import GroupActions from '@/components/group/GroupActions'
import RemoveMemberButton from '@/components/group/RemoveMemberButton'

export const dynamic = 'force-dynamic'

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
          <li
            key={user.id}
            className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar src={user.image} name={user.nickname ?? 'U'} size={32} />
              <span className="truncate font-inter text-sm text-primary">
                {user.nickname ?? 'Sem apelido'}
                {isGroupOwner && (
                  <span className="ml-2 text-xs uppercase tracking-widest text-secondary">
                    dono
                  </span>
                )}
              </span>
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
    <Container>
      <Link
        href="/grupos"
        className="mb-5 inline-flex items-center gap-1 font-inter text-sm text-secondary transition-colors hover:text-primary"
      >
        <CaretLeft size={16} weight="bold" />
        Grupos
      </Link>

      {/* Cabeçalho */}
      <h1 className="font-barlow text-section uppercase leading-none tracking-wide text-primary">
        {group.name}
      </h1>
      <p className="mt-2 font-inter text-sm text-secondary">
        {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
        {leader && (
          <>
            {' · '}líder <span className="text-primary">{leader}</span>
          </>
        )}
        {isOwner && <span className="ml-2 align-middle text-xs uppercase tracking-widest text-accent">você é o dono</span>}
      </p>

      {/* Convite */}
      <div className="mt-8">
        <InviteLink groupId={group.id} code={group.inviteCode} isOwner={isOwner} />
      </div>

      {/* Abas: ranking livre + gestão de membros separada */}
      <div className="mt-10">
        <GroupTabs
          tabs={[
            { id: 'ranking', label: 'Classificação', content: <RankingTable entries={ranking} /> },
            { id: 'membros', label: 'Membros', content: membersPanel },
          ]}
        />
      </div>

      {/* Zona de risco */}
      <div className="mt-12 border-border pt-5">
        <GroupActions groupId={group.id} isOwner={isOwner} />
      </div>
    </Container>
  )
}
