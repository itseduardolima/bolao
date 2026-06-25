import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getInviteGroupPreview } from '@/lib/groups'

export const alt = 'Convite para uma liga do Bolão Copa 2026'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Preview de Open Graph personalizado por convite: mostra o nome da liga e
// quantos amigos já estão competindo. Gerado por requisição (dados do grupo).
export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const group = await getInviteGroupPreview(code)

  const logo = await readFile(
    join(process.cwd(), 'src/assets/images/logo-copa.png')
  )
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  const groupName = group?.name ?? 'Bolão Copa 2026'
  const memberLine =
    group == null
      ? 'Palpite e dispute o ranking com os amigos'
      : group.memberCount === 1
        ? '1 amigo já está competindo'
        : `${group.memberCount} amigos já estão competindo`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '72px 80px',
          background: '#0f0f1a',
          backgroundImage:
            'radial-gradient(900px 560px at 50% -20%, rgba(0,255,135,0.20), rgba(0,255,135,0))',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* marca */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 44,
          }}
        >
          <img src={logoSrc} width={52} height={52} alt="" />
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 800 }}>
            Bolão Copa 2026
          </div>
        </div>

        {/* eyebrow */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 6,
            color: '#00ff87',
          }}
        >
          VOCÊ FOI CONVIDADO PARA A LIGA
        </div>

        {/* nome da liga */}
        <div
          style={{
            display: 'flex',
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -1,
            marginTop: 18,
            maxWidth: 1040,
          }}
        >
          {groupName}
        </div>

        {/* contagem de membros */}
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: '#ffffffaa',
            marginTop: 28,
          }}
        >
          {memberLine}
        </div>
      </div>
    ),
    { ...size }
  )
}
