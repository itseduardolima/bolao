import { defineConfig } from 'prisma/config'
import { readFileSync } from 'fs'

// Prisma CLI doesn't load .env.local — parse it manually so CLI commands
// (db push, migrate, studio) pick up the right database URL in development.
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

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
})
