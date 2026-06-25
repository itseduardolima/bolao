import { prisma } from '@/lib/prisma'

/**
 * Expurgo de retenção (LGPD — princípios de necessidade e de armazenamento pelo
 * tempo estritamente necessário). Remove cobranças PIX PENDENTES já expiradas —
 * checkouts abandonados que nunca viraram pagamento.
 *
 * NÃO toca em pagamentos PAID: esses têm retenção fiscal/legal e são mantidos.
 * Linhas com `expiresAt` nulo também são preservadas (o filtro `lt` não casa
 * com null). Idempotente e não-fatal: seguro para rodar no cron diário.
 */
export async function cleanupExpiredPayments(now = new Date()): Promise<number> {
  const res = await prisma.groupPayment.deleteMany({
    where: {
      status: 'PENDING',
      expiresAt: { lt: now },
    },
  })
  return res.count
}
