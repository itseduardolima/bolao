'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatCountdown } from '@/lib/utils'
import { savePrediction } from '@/actions/predictions'

const COUNTDOWN_THRESHOLD_MS = 5 * 60 * 1000

type PredictionFormProps = {
  gameId: string
  homeTeam: string
  awayTeam: string
  startsAt: string
  initialHomeScore?: number | null
  initialAwayScore?: number | null
}

export default function PredictionForm({
  gameId,
  homeTeam,
  awayTeam,
  startsAt,
  initialHomeScore,
  initialAwayScore,
}: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState(
    initialHomeScore != null ? String(initialHomeScore) : ''
  )
  const [awayScore, setAwayScore] = useState(
    initialAwayScore != null ? String(initialAwayScore) : ''
  )
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const startsAtMs = new Date(startsAt).getTime()
  const [msLeft, setMsLeft] = useState(() => startsAtMs - Date.now())

  useEffect(() => {
    if (startsAtMs - Date.now() <= 0) return
    const id = setInterval(() => {
      const remaining = startsAtMs - Date.now()
      setMsLeft(remaining)
      if (remaining <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [startsAtMs])

  const isLocked = msLeft <= 0

  if (isLocked) {
    return (
      <p className="font-inter text-sm text-secondary">Palpites encerrados para este jogo.</p>
    )
  }

  const isCountdown = msLeft < COUNTDOWN_THRESHOLD_MS

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const home = parseInt(homeScore, 10)
    const away = parseInt(awayScore, 10)
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setFeedback({ type: 'error', message: 'Palpite inválido' })
      return
    }
    setFeedback(null)
    startTransition(async () => {
      const result = await savePrediction(gameId, home, away)
      if ('success' in result) {
        setFeedback({ type: 'success', message: 'Palpite salvo!' })
        router.refresh()
      } else {
        setFeedback({ type: 'error', message: result.error })
      }
    })
  }

  return (
    <div>
      {isCountdown && (
        <p className="font-inter text-[12px] text-warning mt-[6px] mb-[12px]">
          Encerra em {formatCountdown(Math.max(0, msLeft))}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-center gap-[20px] mt-[16px]">
          <input
            value={homeScore}
            onChange={e => setHomeScore(e.target.value)}
            inputMode="numeric"
            placeholder="0"
            disabled={isPending}
            className="w-[72px] h-[72px] text-center bg-base-dark border border-[rgba(255,255,255,.14)] rounded-[14px] text-primary font-barlow text-[34px] font-extrabold outline-none focus:border-accent transition-colors"
          />
          <span className="font-barlow text-[24px] font-bold text-[rgba(255,255,255,.3)]">×</span>
          <input
            value={awayScore}
            onChange={e => setAwayScore(e.target.value)}
            inputMode="numeric"
            placeholder="0"
            disabled={isPending}
            className="w-[72px] h-[72px] text-center bg-base-dark border border-[rgba(255,255,255,.14)] rounded-[14px] text-primary font-barlow text-[34px] font-extrabold outline-none focus:border-accent transition-colors"
          />
        </div>

        {feedback?.type === 'error' && (
          <div className="text-center font-inter text-[12px] text-error mt-[12px]">
            {feedback.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-[48px] mt-[18px] bg-accent text-black rounded-[12px] font-inter text-[14px] font-bold flex items-center justify-center gap-[8px] disabled:opacity-70 transition-opacity"
        >
          {isPending && (
            <span className="w-[15px] h-[15px] border-2 border-[rgba(0,0,0,.3)] border-t-black rounded-full inline-block animate-spin" />
          )}
          {isPending ? 'Salvando...' : (initialHomeScore != null ? 'Atualizar palpite' : 'Salvar palpite')}
        </button>

        {feedback?.type === 'success' && (
          <p className="text-center font-inter text-[12px] text-accent mt-[10px]">
            {feedback.message}
          </p>
        )}

        <div className="text-center font-inter text-[11px] text-[rgba(255,255,255,.35)] mt-[12px]">
          Vale o placar do tempo normal. Você pode editar até o apito inicial.
        </div>
      </form>
    </div>
  )
}
