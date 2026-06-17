import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { readFileSync } from 'fs'

// Load .env.local (same pattern as prisma.config.ts)
try {
  const lines = readFileSync('.env.local', 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !process.env[key]) process.env[key] = val
  }
} catch {}

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
})
const prisma = new PrismaClient({ adapter })

// --- football-data helpers (inlined to avoid path alias) ---

const TEAM_NAMES_PT: Record<string, string> = {
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
  Senegal: 'Senegal',
  Japan: 'Japão',
  'South Korea': 'Coreia do Sul',
  Australia: 'Austrália',
  Iran: 'Irã',
  'Saudi Arabia': 'Arábia Saudita',
  Qatar: 'Catar',
}

function translate(name: string): string {
  return TEAM_NAMES_PT[name] ?? name
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

// --- scoring (inlined) ---

function calculatePoints(
  prediction: { homeScore: number; awayScore: number },
  game: { homeScore: number; awayScore: number },
): number {
  if (prediction.homeScore === game.homeScore && prediction.awayScore === game.awayScore) return 3
  const predResult = Math.sign(prediction.homeScore - prediction.awayScore)
  const gameResult = Math.sign(game.homeScore - game.awayScore)
  if (predResult === gameResult) return 1
  return 0
}

// --- test users ---

const TEST_USERS = [
  { name: 'Eduardo Lima',  email: 'marcoserik00@gmail.com',  nickname: 'Eduardo',  image: 'https://i.pravatar.cc/150?u=eduardo' },
  { name: 'Ana Souza',     email: 'ana.souza@dev.local',     nickname: 'AnaSouza', image: 'https://i.pravatar.cc/150?u=ana' },
  { name: 'Carlos Silva',  email: 'carlos.silva@dev.local',  nickname: 'Carlao',   image: 'https://i.pravatar.cc/150?u=carlos' },
  { name: 'Juliana Ramos', email: 'juliana.ramos@dev.local', nickname: 'Juli',     image: 'https://i.pravatar.cc/150?u=juliana' },
  { name: 'Rodrigo Melo',  email: 'rodrigo.melo@dev.local',  nickname: 'Rod',      image: 'https://i.pravatar.cc/150?u=rodrigo' },
]

// Deterministic "random" score — varies by user index + game id chars
function fakePrediction(userIdx: number, gameId: string): { homeScore: number; awayScore: number } {
  const seed = gameId.charCodeAt(0) + gameId.charCodeAt(gameId.length - 1) + userIdx * 7
  return {
    homeScore: seed % 4,
    awayScore: (seed + userIdx * 3) % 4,
  }
}

// --- main ---

async function main() {
  console.log('Fetching WC 2026 matches from football-data.org…')
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY ?? '' },
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
  const { matches } = (await res.json()) as {
    matches: Array<{
      id: number
      utcDate: string
      status: string
      stage: string
      group: string | null
      venue: string | null
      homeTeam: { name: string; crest: string }
      awayTeam: { name: string; crest: string }
      score: { fullTime: { home: number | null; away: number | null } }
    }>
  }
  console.log(`  ${matches.length} partidas recebidas.`)

  // Upsert games
  let created = 0
  let updated = 0
  for (const m of matches.filter((m) => m.homeTeam?.name && m.awayTeam?.name)) {
    const status = STATUS_MAP[m.status] ?? 'SCHEDULED'
    const phase = STAGE_MAP[m.stage] ?? m.stage
    const homeScore = m.score.fullTime.home
    const awayScore = m.score.fullTime.away
    const existing = await prisma.game.findUnique({ where: { externalId: String(m.id) } })
    if (!existing) {
      await prisma.game.create({
        data: {
          externalId: String(m.id),
          homeTeam: translate(m.homeTeam.name),
          awayTeam: translate(m.awayTeam.name),
          homeFlag: m.homeTeam.crest,
          awayFlag: m.awayTeam.crest,
          startsAt: new Date(m.utcDate),
          venue: m.venue,
          phase,
          groupName: m.group,
          status,
          homeScore,
          awayScore,
        },
      })
      created++
    } else {
      await prisma.game.update({
        where: { externalId: String(m.id) },
        data: { status, homeScore, awayScore, homeTeam: translate(m.homeTeam.name), awayTeam: translate(m.awayTeam.name) },
      })
      updated++
    }
  }
  console.log(`  Jogos: ${created} criados, ${updated} atualizados.`)

  // Upsert users
  const users = []
  for (const u of TEST_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, nickname: u.nickname, hasNickname: true, image: u.image },
    })
    users.push(user)
  }
  console.log(`  ${users.length} usuários prontos.`)

  // Create predictions for all games
  const games = await prisma.game.findMany()
  let preds = 0
  for (const game of games) {
    for (let i = 0; i < users.length; i++) {
      const pred = fakePrediction(i, game.id)
      const points =
        game.status === 'FINISHED' && game.homeScore !== null && game.awayScore !== null
          ? calculatePoints(pred, { homeScore: game.homeScore, awayScore: game.awayScore })
          : null
      await prisma.prediction.upsert({
        where: { userId_gameId: { userId: users[i].id, gameId: game.id } },
        update: { points },
        create: { userId: users[i].id, gameId: game.id, ...pred, points },
      })
      preds++
    }
  }
  console.log(`  ${preds} palpites inseridos.`)
  console.log('Seed concluído!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
