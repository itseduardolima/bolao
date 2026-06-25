import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Ícone para a tela inicial do iOS (apple-touch-icon).
export default async function AppleIcon() {
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
        <img src={logoSrc} width={108} height={108} alt="" />
      </div>
    ),
    { ...size }
  )
}
