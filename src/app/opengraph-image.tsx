import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { SITE_HOST } from '@/lib/site'

export const alt = 'Bolão Copa do Mundo 2026 — Palpites e Ranking'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Imagem de Open Graph padrão do site (preview de link em WhatsApp/redes).
export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), 'src/assets/images/logo-copa.png')
  )
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#0f0f1a',
          backgroundImage:
            'radial-gradient(900px 520px at 82% -12%, rgba(0,255,135,0.18), rgba(0,255,135,0))',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <img src={logoSrc} width={64} height={64} alt="" />
          <div style={{ display: 'flex', fontSize: 30, fontWeight: 800 }}>
            Bolão Copa 2026
          </div>
        </div>

        {/* manchete */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.05,
              maxWidth: 920,
              letterSpacing: -1,
            }}
          >
            Palpites e ranking da Copa do Mundo 2026
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 30,
              width: 128,
              height: 8,
              background: '#00ff87',
              borderRadius: 4,
            }}
          />
        </div>

        {/* rodapé */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', fontSize: 30, color: '#ffffffaa' }}>
            Palpite · Dispute ligas · Suba no ranking
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              fontWeight: 700,
              color: '#00ff87',
            }}
          >
            {SITE_HOST}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
