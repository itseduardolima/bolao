import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { getGlobalRanking } from '@/lib/ranking'
import Container from '@/components/layout/Container'
import RankingTable from '@/components/ranking/RankingTable'
import LoginPrompt from '@/components/auth/LoginPrompt'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [session, ranking] = await Promise.all([auth(), getGlobalRanking()])

  return (
    <Container>
      <Suspense fallback={null}>
        <LoginPrompt />
      </Suspense>
      <div className="font-barlow text-[12px] font-semibold uppercase tracking-[.22em] text-white/[42%]">
        Bolão geral
      </div>
      <h1 className="font-barlow text-[38px] font-extrabold text-primary mt-[6px]">
        Ranking Geral
      </h1>
      <p className="font-inter text-[14px] leading-[1.6] text-white/[55%] max-w-[540px] mt-[8px]">
        Classificação de todos os participantes. Sua pontuação no bolão geral vale também em cada liga que você joga.
      </p>
      <RankingTable entries={ranking} currentUserId={session?.user?.id} />
    </Container>
  )
}
