import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { normalizeGroupName, MAX_GROUPS_OWNED } from '@/lib/groups'
import { upsertCustomer, createPixCharge, getPixQrCode } from '@/lib/asaas'

const PRICE_CENTS = parseInt(process.env.GROUP_PRICE_CENTS ?? '600', 10)

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email || !session.user.name) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { groupName, cpf } = body as { groupName?: unknown; cpf?: unknown }

  const name = normalizeGroupName(groupName)
  if (!name) {
    return NextResponse.json(
      { error: 'Nome do grupo inválido (3–30 caracteres)' },
      { status: 400 }
    )
  }

  const cpfClean = typeof cpf === 'string' ? cpf.replace(/\D/g, '') : ''
  if (cpfClean.length !== 11) {
    return NextResponse.json({ error: 'CPF inválido' }, { status: 400 })
  }

  const userId = session.user.id

  const [profile, ownedCount, pendingCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { hasNickname: true } }),
    prisma.group.count({ where: { ownerId: userId } }),
    prisma.groupPayment.count({ where: { userId, status: 'PENDING' } }),
  ])

  if (!profile?.hasNickname) {
    return NextResponse.json({ error: 'Complete seu perfil antes de criar uma liga' }, { status: 422 })
  }

  if (ownedCount + pendingCount >= MAX_GROUPS_OWNED) {
    return NextResponse.json(
      { error: `Limite de ${MAX_GROUPS_OWNED} grupos criados atingido` },
      { status: 422 }
    )
  }

  try {
    const gpayId = randomUUID()
    const customer = await upsertCustomer(session.user.email, session.user.name, cpfClean)
    const payment = await createPixCharge(
      customer.id,
      PRICE_CENTS,
      `Criar liga "${name}" — Bolão 2026`,
      gpayId
    )
    const qr = await getPixQrCode(payment.id)

    await prisma.groupPayment.create({
      data: {
        id: gpayId,
        userId,
        groupName: name,
        asaasId: payment.id,
        status: 'PENDING',
        pixCode: qr.payload,
        expiresAt: qr.expirationDate ? new Date(qr.expirationDate) : null,
      },
    })

    return NextResponse.json({
      paymentId: gpayId,
      pixCode: qr.payload,
      pixQrCodeImage: qr.encodedImage,
      amount: PRICE_CENTS / 100,
    })
  } catch (err) {
    console.error('[checkout] Asaas error:', err)
    return NextResponse.json(
      { error: 'Erro ao criar cobrança. Tente novamente.' },
      { status: 502 }
    )
  }
}
