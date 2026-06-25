import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getGameSummary } from '@/lib/games'

export const alt = 'Jogo da Copa do Mundo 2026'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Manaus',
})

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const game = await getGameSummary(id)

  const logo = await readFile(
    join(process.cwd(), 'src/assets/images/logo-copa.png')
  )
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  const home = game?.homeTeam ?? 'Bolão'
  const away = game?.awayTeam ?? 'Copa 2026'
  const finished =
    game?.status === 'FINISHED' && game.homeScore != null && game.awayScore != null
  const middle = finished ? `${game!.homeScore} - ${game!.awayScore}` : 'VS'
  const subline = game
    ? finished
      ? 'Resultado final · veja os palpites'
      : `${dateFmt.format(game.startsAt)} · horário de Brasília/AM`
    : 'Palpites e ranking da Copa 2026'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          background: '#0f0f1a',
          backgroundImage:
            'radial-gradient(900px 520px at 50% -20%, rgba(0,255,135,0.16), rgba(0,255,135,0))',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={logoSrc} width={52} height={52} alt="" />
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 800 }}>
            Bolão Copa 2026
          </div>
        </div>

        {/* confronto */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'flex-end',
              textAlign: 'right',
              fontSize: 60,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            {home}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: finished ? 72 : 40,
              fontWeight: 800,
              color: '#00ff87',
            }}
          >
            {middle}
          </div>
          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'flex-start',
              fontSize: 60,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            {away}
          </div>
        </div>

        {/* rodapé */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: 28,
            color: '#ffffffaa',
          }}
        >
          {subline}
        </div>
      </div>
    ),
    { ...size }
  )
}
