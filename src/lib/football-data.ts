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
    fullTime: { home: number | null; away: number | null }
    regularTime?: { home: number | null; away: number | null }
    halfTime?: { home: number | null; away: number | null }
    extraTime?: { home: number | null; away: number | null }
    penalties?: { home: number | null; away: number | null }
    duration?: string
  }
}

type ApiResponse = {
  matches: ApiMatch[]
}

const TEAM_NAMES_PT: Record<string, string> = {
  // Europa
  England: 'Inglaterra',
  Germany: 'Alemanha',
  France: 'França',
  Spain: 'Espanha',
  Netherlands: 'Holanda',
  Belgium: 'Bélgica',
  Switzerland: 'Suíça',
  Croatia: 'Croácia',
  Denmark: 'Dinamarca',
  Poland: 'Polônia',
  Austria: 'Áustria',
  Turkey: 'Turquia',
  Serbia: 'Sérvia',
  Hungary: 'Hungria',
  Slovakia: 'Eslováquia',
  Slovenia: 'Eslovênia',
  Sweden: 'Suécia',
  Norway: 'Noruega',
  Greece: 'Grécia',
  Scotland: 'Escócia',
  Wales: 'País de Gales',
  Ukraine: 'Ucrânia',
  Albania: 'Albânia',
  Czechia: 'República Tcheca',
  'Czech Republic': 'República Tcheca',
  Romania: 'Romênia',
  // Américas
  Brazil: 'Brasil',
  Argentina: 'Argentina',
  Colombia: 'Colômbia',
  Uruguay: 'Uruguai',
  Ecuador: 'Equador',
  Paraguay: 'Paraguai',
  Bolivia: 'Bolívia',
  Chile: 'Chile',
  Peru: 'Peru',
  Venezuela: 'Venezuela',
  'United States': 'Estados Unidos',
  Mexico: 'México',
  Canada: 'Canadá',
  Panama: 'Panamá',
  'Costa Rica': 'Costa Rica',
  Honduras: 'Honduras',
  Jamaica: 'Jamaica',
  'El Salvador': 'El Salvador',
  // África
  Morocco: 'Marrocos',
  Nigeria: 'Nigéria',
  Egypt: 'Egito',
  'South Africa': 'África do Sul',
  Ghana: 'Gana',
  Tunisia: 'Tunísia',
  Cameroon: 'Camarões',
  "Ivory Coast": 'Costa do Marfim',
  "Côte d'Ivoire": 'Costa do Marfim',
  Algeria: 'Argélia',
  Mali: 'Mali',
  Senegal: 'Senegal',
  'DR Congo': 'Congo RD',
  'Congo DR': 'Congo RD',
  Kenya: 'Quênia',
  Tanzania: 'Tanzânia',
  Mozambique: 'Moçambique',
  Angola: 'Angola',
  // Ásia
  Japan: 'Japão',
  'South Korea': 'Coreia do Sul',
  Australia: 'Austrália',
  Iran: 'Irã',
  'Saudi Arabia': 'Arábia Saudita',
  Qatar: 'Catar',
  Jordan: 'Jordânia',
  Uzbekistan: 'Uzbequistão',
  Iraq: 'Iraque',
  Indonesia: 'Indonésia',
  China: 'China',
  'United Arab Emirates': 'Emirados Árabes',
  // Oceania
  'New Zealand': 'Nova Zelândia',
}

export function translateTeamName(name: string): string {
  return TEAM_NAMES_PT[name] ?? name
}

const STATUS_MAP: Record<string, string> = {
  SCHEDULED: 'SCHEDULED',
  TIMED: 'SCHEDULED',
  IN_PLAY: 'LIVE',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  SUSPENDED: 'SCHEDULED',
  POSTPONED: 'SCHEDULED',
  CANCELLED: 'SCHEDULED',
}

const STAGE_MAP: Record<string, string> = {
  GROUP_STAGE: 'Fase de Grupos',
  // Copa 2026 tem 48 seleções: a API usa LAST_32 (16-avos) e LAST_16 (oitavas).
  LAST_32: '16 Avos de Final',
  LAST_16: 'Oitavas de Final',
  ROUND_OF_16: 'Oitavas de Final', // formato antigo (32 seleções), mantido por segurança
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
          signal: AbortSignal.timeout(10_000),
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
