'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { GameStatus } from '@/types'

// Teto do setTimeout (~24,8 dias); acima disso o delay estoura e dispararia na hora.
const MAX_TIMEOUT_MS = 2_147_483_647

// Quando o jogo está agendado e o apito chega com a página aberta, força um
// re-render do servidor para revelar os palpites dos participantes (e o status
// real) sem esperar o cron — espelha o flip "Ao vivo" do GameDetailHeader.
export default function KickoffRefresh({
  status,
  startsAt,
}: {
  status: GameStatus
  startsAt: string
}) {
  const router = useRouter()

  useEffect(() => {
    if (status !== 'SCHEDULED') return
    const remaining = new Date(startsAt).getTime() - Date.now()
    if (remaining < 0 || remaining >= MAX_TIMEOUT_MS) return
    // +500ms de folga para garantir que o servidor já veja `agora >= startsAt`.
    const timer = setTimeout(() => router.refresh(), remaining + 500)
    return () => clearTimeout(timer)
  }, [status, startsAt, router])

  return null
}
