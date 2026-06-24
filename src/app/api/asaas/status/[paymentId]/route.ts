import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { paymentId } = await params

  const gpay = await prisma.groupPayment.findUnique({
    where: { id: paymentId },
    select: { userId: true, status: true, groupId: true },
  })

  if (!gpay || gpay.userId !== session.user.id) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    status: gpay.status,
    groupId: gpay.groupId ?? null,
  })
}
