import type { MetadataRoute } from 'next'
import { SITE_DESCRIPTION } from '@/lib/site'

// Web App Manifest (instalável / PWA). `/icon` é o ícone 512² gerado por
// `app/icon.tsx` (cobre o critério de instalação do Chrome: ≥192 e ≥512).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bolão Copa do Mundo 2026',
    short_name: 'Bolão Copa 2026',
    description: SITE_DESCRIPTION,
    lang: 'pt-BR',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f1a',
    theme_color: '#0f0f1a',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
