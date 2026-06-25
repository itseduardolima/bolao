import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/site'

// Regerado no máximo a cada hora — os jogos chegam por sync/cron, então uma
// foto de build ficaria desatualizada.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const games = await prisma.game.findMany({ select: { id: true, updatedAt: true } })
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/jogos`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/pontuacao`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/termos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacidade`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const gameRoutes: MetadataRoute.Sitemap = games.map((game) => ({
    url: `${SITE_URL}/jogos/${game.id}`,
    lastModified: game.updatedAt,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [...staticRoutes, ...gameRoutes]
}
