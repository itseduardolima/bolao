import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Export dos dados pessoais do usuário autenticado (LGPD art. 18 — acesso e
// portabilidade). Devolve um JSON legível para download. A autorização é feita
// aqui (o ator vem da sessão); a rota está liberada no middleware apenas para
// que chamadas não autenticadas recebam 401 limpo em vez de redirect.
export async function GET() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      nickname: true,
      createdAt: true,
    },
  })
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const [predictions, ownedGroups, memberships, payments] = await Promise.all([
    prisma.prediction.findMany({
      where: { userId },
      orderBy: { game: { startsAt: 'asc' } },
      select: {
        homeScore: true,
        awayScore: true,
        points: true,
        createdAt: true,
        updatedAt: true,
        game: {
          select: {
            homeTeam: true,
            awayTeam: true,
            startsAt: true,
            phase: true,
            status: true,
            homeScore: true,
            awayScore: true,
          },
        },
      },
    }),
    prisma.group.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
      select: {
        name: true,
        inviteCode: true,
        createdAt: true,
        _count: { select: { members: true } },
      },
    }),
    prisma.groupMember.findMany({
      where: { userId },
      orderBy: { joinedAt: 'asc' },
      select: { role: true, joinedAt: true, group: { select: { name: true } } },
    }),
    prisma.groupPayment.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { groupName: true, status: true, createdAt: true },
    }),
  ])

  const payload = {
    exportadoEm: new Date().toISOString(),
    perfil: user,
    palpites: predictions.map((p) => ({
      jogo: `${p.game.homeTeam} x ${p.game.awayTeam}`,
      fase: p.game.phase,
      inicio: p.game.startsAt,
      statusDoJogo: p.game.status,
      placarReal:
        p.game.homeScore !== null && p.game.awayScore !== null
          ? `${p.game.homeScore} - ${p.game.awayScore}`
          : null,
      meuPalpite: `${p.homeScore} - ${p.awayScore}`,
      pontos: p.points,
      enviadoEm: p.createdAt,
      atualizadoEm: p.updatedAt,
    })),
    ligasCriadas: ownedGroups.map((g) => ({
      nome: g.name,
      codigoConvite: g.inviteCode,
      membros: g._count.members,
      criadaEm: g.createdAt,
    })),
    participacoes: memberships.map((m) => ({
      liga: m.group.name,
      funcao: m.role,
      entrouEm: m.joinedAt,
    })),
    pagamentos: payments.map((pay) => ({
      liga: pay.groupName,
      status: pay.status,
      criadoEm: pay.createdAt,
    })),
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="meus-dados-bolao.json"',
      'Cache-Control': 'no-store',
    },
  })
}
