import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createGroupWithUniqueCode } from '@/lib/groups'

interface AsaasWebhookPayload {
  event: string
  payment?: {
    id: string
    externalReference?: string
    status: string
  }
}

export async function POST(req: Request) {
  const WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN
  if (!WEBHOOK_TOKEN || req.headers.get('asaas-access-token') !== WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: AsaasWebhookPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const { event, payment } = payload

  if (event !== 'PAYMENT_RECEIVED' && event !== 'PAYMENT_CONFIRMED') {
    return NextResponse.json({ ok: true })
  }

  if (!payment?.externalReference) {
    return NextResponse.json({ ok: true })
  }

  const gpayId = payment.externalReference

  const gpay = await prisma.groupPayment.findUnique({
    where: { id: gpayId },
    select: { id: true, userId: true, groupName: true, status: true },
  })

  if (!gpay) return NextResponse.json({ ok: true })

  // Atomic lock: only proceed if we successfully transition PENDING → PAID.
  // If another webhook retry already flipped the status, count = 0 and we stop.
  const locked = await prisma.groupPayment.updateMany({
    where: { id: gpayId, status: 'PENDING' },
    data: { status: 'PAID' },
  })
  if (locked.count === 0) return NextResponse.json({ ok: true })

  let group: { id: string } | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      group = await createGroupWithUniqueCode(gpay.groupName, gpay.userId)
      break
    } catch (err) {
      if (attempt === 2) console.error('[webhook] Failed to create group after 3 attempts (payment PAID, groupId null — manual recovery needed):', err)
      else await new Promise(r => setTimeout(r, 600 * (attempt + 1)))
    }
  }
  if (group) {
    await prisma.groupPayment.update({ where: { id: gpayId }, data: { groupId: group.id } })
  }

  return NextResponse.json({ ok: true })
}
