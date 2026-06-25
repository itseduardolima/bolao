import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

// Ícone do app (favicon PNG + base do ícone do manifest/PWA). Logo da Copa
// centralizada (~60%) sobre o fundo da marca — seguro para máscara (maskable).
export default async function Icon() {
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
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0f1a',
        }}
      >
        <img src={logoSrc} width={300} height={300} alt="" />
      </div>
    ),
    { ...size }
  )
}
