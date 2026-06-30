import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatGameDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Manaus',
  }).format(d)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatGameTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Manaus',
  }).format(d)
}

export type MatchDecider =
  | { type: 'penalties'; home: number; away: number }
  | { type: 'extratime'; home: number; away: number }
  | null

/**
 * Como um mata-mata foi decidido além dos 90 min — apenas para EXIBIÇÃO.
 * A pontuação usa sempre o placar do tempo normal (homeScore/awayScore).
 * - `penalties`: placar da disputa de pênaltis.
 * - `extratime`: placar acumulado após a prorrogação (90 min + gols da prorrogação).
 * Retorna `null` para jogos normais (decididos nos 90 min) ou não finalizados.
 */
export function getMatchDecider(game: {
  status: string
  homeScore: number | null
  awayScore: number | null
  extraTimeHome?: number | null
  extraTimeAway?: number | null
  penaltiesHome?: number | null
  penaltiesAway?: number | null
}): MatchDecider {
  if (game.status !== 'FINISHED') return null

  if (game.penaltiesHome != null && game.penaltiesAway != null) {
    return { type: 'penalties', home: game.penaltiesHome, away: game.penaltiesAway }
  }

  const { extraTimeHome, extraTimeAway } = game
  if (extraTimeHome != null && extraTimeAway != null && extraTimeHome + extraTimeAway > 0) {
    return {
      type: 'extratime',
      home: (game.homeScore ?? 0) + extraTimeHome,
      away: (game.awayScore ?? 0) + extraTimeAway,
    }
  }

  return null
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
