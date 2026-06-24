import { getGlobalRanking } from '@/lib/ranking'
import Container from '@/components/layout/Container'
import SectionTitle from '@/components/layout/SectionTitle'
import RankingTable from '@/components/ranking/RankingTable'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const ranking = await getGlobalRanking()

  return (
    <Container>
      <SectionTitle className="mb-6">Ranking</SectionTitle>
      <RankingTable entries={ranking} />
    </Container>
  )
}
