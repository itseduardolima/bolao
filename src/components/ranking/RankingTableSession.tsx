'use client'

import { useSession } from 'next-auth/react'
import RankingTable from './RankingTable'
import type { RankingEntry } from '@/lib/ranking'

// A lista de entradas vem do server, cacheada e igual para todos; só o
// destaque da linha do usuário logado depende da sessão, então isolamos essa
// dependência aqui para o restante da página poder ser servido estático.
export default function RankingTableSession({ entries }: { entries: RankingEntry[] }) {
  const { data: session } = useSession()
  return <RankingTable entries={entries} currentUserId={session?.user?.id} />
}
