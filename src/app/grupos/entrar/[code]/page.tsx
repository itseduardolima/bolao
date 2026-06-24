import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import LogoCopa from '@/assets/images/logo-copa.png'
import { prisma } from '@/lib/prisma'
import { normalizeInviteCode } from '@/lib/group-constants'
import MemberStack from '@/components/group/MemberStack'
import JoinGroupButton from '@/components/group/JoinGroupButton'
import SignInToJoinButton from '@/components/group/SignInToJoinButton'

export const dynamic = 'force-dynamic'

function InvalidInvite() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
      {/* logo */}
      <div className="flex items-center justify-center gap-[9px] mb-10">
        <Image src={LogoCopa} alt="Bolão 2026" width={28} height={28} />
        <span className="font-barlow text-[18px] font-black text-primary">
          Bolão - Copa do Mundo<span className="text-accent ml-2">2026</span>
        </span>
      </div>
      {/* error circle */}
      <div className="w-14 h-14 rounded-full bg-error/[.13] flex items-center justify-center font-barlow text-[28px] font-bold text-error">!</div>
      <h1 className="font-barlow text-[32px] font-black uppercase text-primary mt-[18px]">Convite não encontrado</h1>
      <p className="font-inter text-[14px] leading-relaxed text-secondary/70 max-w-[380px] mt-3">
        Este código não existe ou foi renovado pelo administrador da liga. Peça um link novo para quem te convidou.
      </p>
      <Link href="/grupos" className="inline-flex items-center gap-2 font-inter text-[13px] font-semibold text-accent mt-[22px] hover:opacity-80 transition-opacity">
        {/* CSS chevron left */}
        <span className="inline-block w-[7px] h-[7px] border-l-2 border-b-2 border-current rotate-45" />
        Voltar para Ligas
      </Link>
    </div>
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
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-8 py-[72px]">
      {/* logo */}
      <div className="flex items-center justify-center gap-[9px] mb-[40px]">
        <Image src={LogoCopa} alt="Bolão 2026" width={28} height={28} />
        <span className="font-barlow text-[18px] font-black text-primary">
          Bolão - Copa do Mundo<span className="text-accent ml-1">2026</span>
        </span>
      </div>
      {/* eyebrow */}
      <div className="font-barlow text-[12px] font-semibold uppercase tracking-[.22em] text-[rgba(255,255,255,.42)]">
        Você foi convidado para
      </div>
      {/* group name */}
      <h1 className="font-barlow text-[46px] font-black uppercase text-primary leading-none mt-[10px]">
        {group.name}
      </h1>
      {/* avatar stack + count */}
      <div className="flex items-center justify-center gap-[10px] mt-[18px]">
        {previews.length > 0 && (
          <MemberStack members={previews} total={memberCount} size={30} borderColor="#0f0f1a" />
        )}
        <span className="font-inter text-[13px] font-medium text-secondary/70">
          {memberCount} {memberCount === 1 ? 'amigo competindo' : 'amigos já estão competindo'}
        </span>
      </div>
      {/* CTA area */}
      <div className="mt-[34px]">
        {!user ? (
          <>
            <SignInToJoinButton code={code} />
            <p className="font-inter text-[12px] text-[rgba(255,255,255,.42)] mt-[14px]">
              Você volta para esta liga assim que entrar.
            </p>
          </>
        ) : user.hasNickname ? (
          <>
            <JoinGroupButton code={code} />
            <p className="font-inter text-[12px] text-[rgba(255,255,255,.42)] mt-[14px]">
              Entrando como <span className="text-primary font-semibold">{user.name ?? 'você'}</span>.
            </p>
          </>
        ) : (
          <>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center h-[48px] px-[28px] bg-accent text-black rounded-xl font-inter text-[15px] font-bold transition-opacity hover:opacity-85"
            >
              Escolher apelido para participar
            </Link>
            <p className="font-inter text-[12px] text-[rgba(255,255,255,.42)] mt-[14px]">
              Escolha um apelido para aparecer no ranking.
            </p>
          </>
        )}
      </div>
      {/* fine print */}
      <p className="font-inter text-[12px] text-[rgba(255,255,255,.42)] max-w-[420px] mt-8">
        Entrando, você passa a disputar o ranking desta liga. Seus palpites continuam os mesmos do bolão geral.
      </p>
    </div>
  )
}
