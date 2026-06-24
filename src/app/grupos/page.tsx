import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGroupRanking } from '@/lib/ranking'
import Container from '@/components/layout/Container'
import SectionTitle from '@/components/layout/SectionTitle'
import CreateGroupForm from '@/components/group/CreateGroupForm'
import JoinGroupForm from '@/components/group/JoinGroupForm'
import MemberStack from '@/components/group/MemberStack'

export const dynamic = 'force-dynamic'

export default async function GruposPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/?login=1')
  const userId = session.user.id

  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { group: { select: { id: true, name: true, ownerId: true } } },
    orderBy: { joinedAt: 'desc' },
  })

  const groups = memberships.map((m) => m.group)
  // Ranking por grupo (poucos grupos por usuário) — em paralelo. Dá posição,
  // pontos e os primeiros colocados para os avatares de cada card.
  const rankings = await Promise.all(groups.map((g) => getGroupRanking(g.id)))

  const cards = groups.map((g, i) => {
    const entries = rankings[i]
    const myIndex = entries.findIndex((e) => e.id === userId)
    return {
      id: g.id,
      name: g.name,
      isOwner: g.ownerId === userId,
      memberCount: entries.length,
      myRank: myIndex >= 0 ? myIndex + 1 : null,
      myPoints: myIndex >= 0 ? entries[myIndex].totalPoints : 0,
      top: entries.slice(0, 4).map((e) => ({ id: e.id, nickname: e.nickname, image: e.image })),
    }
  })

  return (
    <Container>
      <SectionTitle className="mb-2">Grupos</SectionTitle>
      <p className="mb-6 max-w-xl font-inter text-sm text-secondary">
        Ligas privadas para disputar com seus amigos. Seu palpite no bolão vale em
        todas elas — aqui muda só com quem você compete.
      </p>

      <CreateGroupForm />
      <div className="mb-10 mt-4">
        <JoinGroupForm />
      </div>

      <h3 className="mb-3 flex items-baseline gap-2 border-b border-border pb-2 font-barlow text-sm font-bold uppercase tracking-widest text-secondary">
        Suas ligas
        {cards.length > 0 && <span className="text-muted">{cards.length}</span>}
      </h3>

      {cards.length === 0 ? (
        <p className="max-w-md font-inter text-sm text-secondary">
          Você ainda não está em nenhuma liga. Crie a sua acima ou cole um código de
          convite para entrar na de um amigo.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.map((g) => (
            <Link
              key={g.id}
              href={`/grupos/${g.id}`}
              className="block rounded-xl border border-border bg-surface p-5 transition-transform hover:-translate-y-0.5 hover:shadow-[0_4px_20px_#00ff8715]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="truncate font-barlow text-xl font-bold uppercase text-primary">
                    {g.name}
                  </h4>
                  <p className="mt-0.5 font-inter text-xs text-secondary">
                    {g.isOwner && <span className="font-semibold text-accent">Dono</span>}
                    {g.isOwner && ' · '}
                    {g.memberCount} {g.memberCount === 1 ? 'membro' : 'membros'}
                  </p>
                </div>
                <MemberStack members={g.top} total={g.memberCount} />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="font-inter text-xs text-secondary">
                  Sua posição{' '}
                  <span className="font-barlow text-base font-bold text-primary">
                    {g.myRank ? `${g.myRank}º` : '—'}
                  </span>{' '}
                  de {g.memberCount}
                </span>
                <span className="font-inter text-xs text-secondary">
                  <span className="font-barlow text-base font-bold text-accent">
                    {g.myPoints}
                  </span>{' '}
                  pts
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  )
}
