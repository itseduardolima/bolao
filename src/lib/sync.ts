import { prisma } from '@/lib/prisma'
import { fetchMatches, mapStatus, mapStage, translateTeamName } from '@/lib/football-data'
import { calculatePoints } from '@/lib/scoring'

export type SyncResult =
  | { skipped: true }
  | { updated: number; created: number; skipped: number; errors: number }
  | { error: true; message: string }

async function hasGameNearby(): Promise<boolean> {
  const now = new Date()

  const yesterday = new Date(now)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  yesterday.setUTCHours(0, 0, 0, 0)

  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)

  const count = await prisma.game.count({
    where: {
      startsAt: {
        gte: yesterday,
        lt: tomorrow,
      },
    },
  })

  return count > 0
}

async function recalculatePoints(
  gameId: string,
  homeScore: number,
  awayScore: number
): Promise<void> {
  const predictions = await prisma.prediction.findMany({
    where: { gameId },
    select: { id: true, homeScore: true, awayScore: true },
  })

  for (const pred of predictions) {
    const points = calculatePoints(
      { homeScore: pred.homeScore, awayScore: pred.awayScore },
      { homeScore, awayScore }
    )
    await prisma.prediction.update({
      where: { id: pred.id },
      data: { points },
    })
  }
}

export async function syncGames(force = false): Promise<SyncResult> {
  if (!force) {
    const nearby = await hasGameNearby()
    if (!nearby) return { skipped: true }
  }

  let matches: Awaited<ReturnType<typeof fetchMatches>>
  try {
    matches = await fetchMatches()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { error: true, message }
  }

  let updated = 0
  let created = 0
  let skipped = 0
  let errors = 0

  for (const match of matches) {
    if (!match.homeTeam.name || !match.awayTeam.name) {
      skipped++
      continue
    }

    try {
      const externalId = String(match.id)
      const status = mapStatus(match.status)
      const phase = mapStage(match.stage)
      // Pontuação e placar exibido valem SEMPRE o tempo normal (90 min):
      // em mata-mata a football-data.org soma os pênaltis no `fullTime`
      // (ex.: 1-1 + pênaltis 3-4 → fullTime 4-5). `regularTime` traz o placar
      // de 90 min e só existe quando houve prorrogação/pênaltis; em jogos
      // normais usamos `fullTime`, que aí já é o placar de 90 min.
      const homeScore =
        match.score.regularTime?.home ??
        match.score.fullTime.home ??
        null
      const awayScore =
        match.score.regularTime?.away ??
        match.score.fullTime.away ??
        null
      const halfTimeHome = match.score.halfTime?.home ?? null
      const halfTimeAway = match.score.halfTime?.away ?? null
      const duration = match.score.duration ?? null
      const extraTimeHome = match.score.extraTime?.home ?? null
      const extraTimeAway = match.score.extraTime?.away ?? null
      const penaltiesHome = match.score.penalties?.home ?? null
      const penaltiesAway = match.score.penalties?.away ?? null

      const homeTeamPT = translateTeamName(match.homeTeam.name)
      const awayTeamPT = translateTeamName(match.awayTeam.name)

      const existing = await prisma.game.findUnique({
        where: { externalId },
        select: { id: true, status: true, homeScore: true, awayScore: true, homeTeam: true, awayTeam: true, halfTimeHome: true, halfTimeAway: true, duration: true },
      })

      if (!existing) {
        await prisma.game.create({
          data: {
            externalId,
            homeTeam: homeTeamPT,
            awayTeam: awayTeamPT,
            homeFlag: match.homeTeam.crest,
            awayFlag: match.awayTeam.crest,
            startsAt: new Date(match.utcDate),
            venue: match.venue,
            phase,
            groupName: match.group,
            status,
            homeScore,
            awayScore,
            halfTimeHome,
            halfTimeAway,
            duration,
            extraTimeHome,
            extraTimeAway,
            penaltiesHome,
            penaltiesAway,
          },
        })
        created++
        continue
      }

      const scoreChanged =
        existing.homeScore !== homeScore ||
        existing.awayScore !== awayScore ||
        existing.halfTimeHome !== halfTimeHome ||
        existing.halfTimeAway !== halfTimeAway ||
        existing.duration !== duration
      const statusChanged = existing.status !== status
      const nameChanged =
        existing.homeTeam !== homeTeamPT || existing.awayTeam !== awayTeamPT

      if (!scoreChanged && !statusChanged && !nameChanged) {
        skipped++
        continue
      }

      await prisma.game.update({
        where: { externalId },
        data: {
          status,
          homeScore,
          awayScore,
          halfTimeHome,
          halfTimeAway,
          duration,
          extraTimeHome,
          extraTimeAway,
          penaltiesHome,
          penaltiesAway,
          homeTeam: translateTeamName(match.homeTeam.name),
          awayTeam: translateTeamName(match.awayTeam.name),
        },
      })
      updated++

      if (
        status === 'FINISHED' &&
        homeScore !== null &&
        awayScore !== null &&
        (statusChanged || scoreChanged)
      ) {
        await recalculatePoints(existing.id, homeScore, awayScore)
      }
    } catch {
      errors++
    }
  }

  return { updated, created, skipped, errors }
}
