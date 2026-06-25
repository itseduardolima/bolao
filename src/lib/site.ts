// Constantes públicas do site usadas por metadata/SEO e Open Graph.
// `NEXT_PUBLIC_SITE_URL` deve ser definido na Vercel (e em .env.local p/ dev);
// o fallback garante que metadataBase nunca fique relativo se a env faltar.

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const url = raw && raw.length > 0 ? raw : 'https://bolao-conectados.vercel.app'
  return url.replace(/\/+$/, '') // sem barra final
}

export const SITE_URL = resolveSiteUrl()
export const SITE_HOST = new URL(SITE_URL).host
export const SITE_NAME = 'Bolão Copa 2026'
export const SITE_TITLE = 'Bolão Copa do Mundo 2026 — Palpites e Ranking'
export const SITE_DESCRIPTION =
  'Dê seus palpites em todos os jogos da Copa do Mundo 2026, dispute ligas com os amigos e acompanhe o ranking ao vivo.'
