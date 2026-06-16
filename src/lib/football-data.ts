const API_BASE = 'https://api.football-data.org/v4'
const COMPETITION = 'WC'

export type ApiMatch = {
  id: number
  utcDate: string
  status: string
  stage: string
  group: string | null
  venue: string | null
  homeTeam: { name: string; crest: string }
  awayTeam: { name: string; crest: string }
  score: {
    fullTime: {
      home: number | null
      away: number | null
    }
  }
}

type ApiResponse = {
  matches: ApiMatch[]
}

const STATUS_MAP: Record<string, string> = {
  SCHEDULED: 'SCHEDULED',
  TIMED: 'SCHEDULED',
  IN_PLAY: 'LIVE',
  PAUSED: 'LIVE',
  FINISHED: 'FINISHED',
  SUSPENDED: 'SCHEDULED',
  POSTPONED: 'SCHEDULED',
  CANCELLED: 'SCHEDULED',
}

const STAGE_MAP: Record<string, string> = {
  GROUP_STAGE: 'Fase de Grupos',
  ROUND_OF_16: 'Oitavas de Final',
  QUARTER_FINALS: 'Quartas de Final',
  SEMI_FINALS: 'Semifinal',
  THIRD_PLACE: 'Disputa de Terceiro Lugar',
  FINAL: 'Final',
}

export function mapStatus(apiStatus: string): string {
  return STATUS_MAP[apiStatus] ?? 'SCHEDULED'
}

export function mapStage(apiStage: string): string {
  return STAGE_MAP[apiStage] ?? apiStage
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchMatches(): Promise<ApiMatch[]> {
  const delays = [0, 1000, 2000, 4000]
  let lastError: Error | null = null

  for (const delay of delays) {
    if (delay > 0) await sleep(delay)
    try {
      const res = await fetch(
        `${API_BASE}/competitions/${COMPETITION}/matches`,
        {
          headers: {
            'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY ?? '',
          },
          cache: 'no-store',
        }
      )
      if (!res.ok) {
        throw new Error(`football-data.org responded ${res.status}: ${res.statusText}`)
      }
      const data = (await res.json()) as ApiResponse
      return data.matches
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError ?? new Error('Failed to fetch matches after retries')
}
