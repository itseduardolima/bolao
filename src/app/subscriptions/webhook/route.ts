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
  const token = req.headers.get('asaas-access-token')

  if (WEBHOOK_TOKEN) {
    // Token configured → enforce validation
    if (token !== WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else {
    // Token not configured → allow but warn (set ASAAS_WEBHOOK_TOKEN in production)
    console.warn('[webhook] ASAAS_WEBHOOK_TOKEN não configurado — endpoint desprotegido')
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

  try {
    const group = await createGroupWithUniqueCode(gpay.groupName, gpay.userId)
    await prisma.groupPayment.update({
      where: { id: gpayId },
      data: { groupId: group.id },
    })
  } catch (err) {
    console.error('[webhook] Failed to create group after payment lock:', err)
    // Payment is already marked PAID — log for manual recovery rather than
    // returning non-2xx (which would cause Asaas to retry and hit count=0).
  }

  return NextResponse.json({ ok: true })
}
