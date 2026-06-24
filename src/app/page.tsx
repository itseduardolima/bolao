import { auth } from '@/lib/auth'
import { getGlobalRanking } from '@/lib/ranking'
import Container from '@/components/layout/Container'
import RankingTable from '@/components/ranking/RankingTable'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [session, ranking] = await Promise.all([auth(), getGlobalRanking()])

  return (
    <Container>
      <div className="font-[Barlow_Condensed] text-[12px] font-semibold uppercase tracking-[.22em] text-[rgba(255,255,255,.42)]">
        Bolão geral
      </div>
      <h1 className="font-barlow text-[38px] font-extrabold text-primary mt-[6px]">
        Ranking
      </h1>
      <p className="font-inter text-[14px] leading-[1.6] text-[rgba(255,255,255,.55)] max-w-[540px] mt-[8px]">
        Classificação de todos os participantes. Sua pontuação no bolão geral vale também em cada liga que você joga.
      </p>
      <RankingTable entries={ranking} currentUserId={session?.user?.id} />
    </Container>
  )
}
