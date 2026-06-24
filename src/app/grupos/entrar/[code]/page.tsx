import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { normalizeInviteCode } from '@/lib/group-constants'
import Container from '@/components/layout/Container'
import MemberStack from '@/components/group/MemberStack'
import JoinGroupButton from '@/components/group/JoinGroupButton'
import SignInToJoinButton from '@/components/group/SignInToJoinButton'

export const dynamic = 'force-dynamic'

function InvalidInvite() {
  return (
    <Container className="max-w-md py-20">
      <p className="font-inter text-[11px] uppercase tracking-widest text-secondary">
        Convite
      </p>
      <h1 className="mt-2 font-barlow text-section uppercase leading-none text-primary">
        Link inválido
      </h1>
      <p className="mt-3 font-inter text-sm text-secondary">
        Este convite não existe ou foi renovado pelo dono do grupo. Peça um link novo
        para quem te convidou.
      </p>
      <Link
        href="/grupos"
        className="mt-6 inline-block font-inter text-sm font-semibold text-accent transition-opacity hover:opacity-80"
      >
        Ir para meus grupos →
      </Link>
    </Container>
  )
}

export default async function JoinInvitePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code: rawCode } = await params
  const code = normalizeInviteCode(rawCode)
  if (!code) return <InvalidInvite />

  const group = await prisma.group.findUnique({
    where: { inviteCode: code },
    select: {
      id: true,
      name: true,
      _count: { select: { members: true } },
      members: {
        take: 5,
        orderBy: { joinedAt: 'asc' },
        select: { user: { select: { id: true, nickname: true, image: true } } },
      },
    },
  })
  if (!group) return <InvalidInvite />

  const session = await auth()
  const user = session?.user

  // Já é membro → vai direto pro grupo. (redirect lança; fora de try/catch.)
  if (user?.id) {
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId: user.id } },
      select: { id: true },
    })
    if (existing) redirect(`/grupos/${group.id}`)
  }

  const memberCount = group._count.members
  const previews = group.members.map((m) => m.user)

  return (
    <Container className="max-w-lg py-16">
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <p className="font-inter text-[11px] uppercase tracking-widest text-secondary">
          Você foi convidado para
        </p>
        <h1 className="mt-2 font-barlow text-section uppercase leading-none text-primary">
          {group.name}
        </h1>

        <div className="mt-5 flex items-center gap-3">
          {previews.length > 0 && (
            <MemberStack members={previews} total={memberCount} ring="ring-surface" />
          )}
          <span className="font-inter text-sm text-secondary">
            {memberCount} {memberCount === 1 ? 'pessoa competindo' : 'pessoas competindo'}
          </span>
        </div>

        <div className="mt-8">
          {!user ? (
            <SignInToJoinButton code={code} />
          ) : user.hasNickname ? (
            <JoinGroupButton code={code} />
          ) : (
            <Link
              href="/onboarding"
              className="inline-flex w-full items-center justify-center rounded-md bg-accent px-6 py-2.5 font-barlow text-base font-bold uppercase tracking-wide text-black transition-opacity hover:opacity-85"
            >
              Escolher apelido para participar
            </Link>
          )}
        </div>
      </div>

      <p className="mt-4 font-inter text-xs text-muted">
        Entrando, você passa a disputar o ranking desta liga. Seus palpites continuam
        os mesmos do bolão geral.
      </p>
    </Container>
  )
}
