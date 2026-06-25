import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGroupRanking } from '@/lib/ranking'
import CreateGroupForm from '@/components/group/CreateGroupForm'
import JoinGroupForm from '@/components/group/JoinGroupForm'
import MemberStack from '@/components/group/MemberStack'

export const dynamic = 'force-dynamic'

// Página privada (requer login) — fora do índice de busca.
export const metadata = {
  robots: { index: false, follow: false },
}

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
    <div className="mx-auto max-w-5xl px-4 sm:px-8 py-9">
      {/* Header */}
      <div className="font-barlow text-[12px] font-semibold uppercase tracking-[.22em] text-white/[42%]">
        Suas ligas
      </div>
      <h1 className="font-barlow text-[38px] font-black uppercase text-primary leading-none mt-[6px]">
        Ligas
      </h1>
      <p className="font-inter text-[14px] leading-relaxed text-white/[67%] max-w-[560px] mt-[10px]">
        Rankings privados entre amigos, só por convite. Seu palpite no bolão geral vale automaticamente em todas as ligas — elas são lentes do mesmo jogo, não palpites separados.
      </p>

      {/* Forms grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px] mt-[26px]">
        <CreateGroupForm />
        <JoinGroupForm />
      </div>

      {/* Cards section title */}
      <h3 className="mt-[26px] mb-[14px] font-barlow text-[11px] font-semibold uppercase tracking-[.22em] text-white/[42%]">
        {cards.length > 0 && `${cards.length} ${cards.length === 1 ? 'liga' : 'ligas'}`}
      </h3>

      {cards.length === 0 ? (
        <div className="mt-[40px] border border-dashed border-white/[.14] rounded-[14px] py-[48px] px-[40px] text-center">
          <div className="font-barlow text-[26px] font-bold uppercase text-primary">
            Você ainda não está em nenhuma liga
          </div>
          <p className="font-inter text-[14px] leading-relaxed text-white/[67%] max-w-[440px] mx-auto mt-3">
            Crie uma liga e convide a galera, ou entre numa existente com um código de convite. Seu palpite no bolão geral já conta automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          {cards.map((g) => (
            <Link
              key={g.id}
              href={`/grupos/${g.id}`}
              className="block bg-surface border border-white/[.06] rounded-xl p-[18px] cursor-pointer transition-all duration-150 hover:bg-elevated hover:border-white/[.14] hover:-translate-y-0.5"
            >
              {/* top row: name + owner badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="font-barlow text-[20px] font-bold uppercase text-primary leading-[1.05]">
                  {g.name}
                </div>
                {g.isOwner && (
                  <span className="flex-shrink-0 font-barlow text-[9px] font-semibold uppercase tracking-[.14em] text-accent bg-accent/[.13] rounded-[4px] px-[7px] py-[3px]">
                    Dono
                  </span>
                )}
              </div>

              {/* avatars + member count */}
              <div className="flex items-center gap-[10px] mt-[14px]">
                <MemberStack members={g.top} total={g.memberCount} size={26} borderTone="surface" />
                <span className="font-inter text-[12px] font-medium text-white/[42%]">
                  {g.memberCount} {g.memberCount === 1 ? 'membro' : 'membros'}
                </span>
              </div>

              {/* footer: position + points */}
              <div className="flex items-end justify-between mt-[16px] pt-[14px] border-t border-white/[.06]">
                <div>
                  <div className="font-barlow text-[10px] font-medium uppercase tracking-[.16em] text-white/[42%]">
                    Sua posição
                  </div>
                  <div className="font-barlow text-[24px] font-black leading-none text-primary mt-[2px]">
                    {g.myRank ? `${g.myRank}º` : '—'}
                    <span className="font-medium text-[14px] text-white/[42%]"> de {g.memberCount}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-barlow text-[10px] font-medium uppercase tracking-[.16em] text-white/[42%]">
                    Pontos
                  </div>
                  <div className="font-barlow text-[24px] font-black leading-none text-primary mt-[2px]">
                    {g.myPoints}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
