import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// IMPORTANTE: não bloquear `/grupos/entrar` nem as rotas `*/opengraph-image` —
// o crawler do WhatsApp/Facebook respeita robots.txt e precisa buscar o preview
// do convite. As páginas privadas abaixo também são protegidas por auth/redirect
// (e por `noindex` nas que renderizam), o robots aqui é só reforço + crawl budget.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/onboarding', '/perfil', '/grupos/pagamento'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
