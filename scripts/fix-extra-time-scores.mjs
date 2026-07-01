// One-off: corrige jogos cujo homeScore/awayScore foi salvo com o placar
// pós-prorrogação (bug corrigido em src/lib/sync.ts) e recalcula os pontos
// das predictions afetadas.
//
// Uso:
//   DATABASE_URL="..." DATABASE_AUTH_TOKEN="..." node scripts/fix-extra-time-scores.mjs
//   (sem env vars, usa o dev.db local via .env.local)

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
for (const file of ['.env.local', '.env']) {
  try {
    const content = readFileSync(path.join(rootDir, file), 'utf8')
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^"|"$/g, '')
      }
    }
  } catch {}
}

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

function calculatePoints(prediction, game) {
  if (prediction.homeScore === game.homeScore && prediction.awayScore === game.awayScore) {
    return 3
  }
  const predResult = Math.sign(prediction.homeScore - prediction.awayScore)
  const gameResult = Math.sign(game.homeScore - game.awayScore)
  return predResult === gameResult ? 1 : 0
}

async function main() {
  const affected = await prisma.game.findMany({
    where: {
      extraTimeHome: { not: null },
      extraTimeAway: { not: null },
      homeScore: { not: null },
      awayScore: { not: null },
    },
  })

  console.log(`Jogos com prorrogação encontrados: ${affected.length}`)

  for (const game of affected) {
    const correctedHome = game.homeScore - game.extraTimeHome
    const correctedAway = game.awayScore - game.extraTimeAway

    if (correctedHome === game.homeScore && correctedAway === game.awayScore) {
      console.log(`- ${game.homeTeam} x ${game.awayTeam}: já correto (${game.homeScore}-${game.awayScore}), pulando`)
      continue
    }

    console.log(
      `- ${game.homeTeam} x ${game.awayTeam}: ${game.homeScore}-${game.awayScore} -> ${correctedHome}-${correctedAway}`
    )

    await prisma.game.update({
      where: { id: game.id },
      data: { homeScore: correctedHome, awayScore: correctedAway },
    })

    const predictions = await prisma.prediction.findMany({
      where: { gameId: game.id },
      select: { id: true, homeScore: true, awayScore: true, points: true },
    })

    for (const pred of predictions) {
      const points = calculatePoints(
        { homeScore: pred.homeScore, awayScore: pred.awayScore },
        { homeScore: correctedHome, awayScore: correctedAway }
      )
      if (points !== pred.points) {
        console.log(`  prediction ${pred.id}: ${pred.points} -> ${points} pontos`)
        await prisma.prediction.update({ where: { id: pred.id }, data: { points } })
      }
    }
  }

  console.log('Concluído.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
