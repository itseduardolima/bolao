'use client'

import { useState, useEffect, useTransition } from 'react'
import { Timer, CheckCircle, XCircle } from '@phosphor-icons/react'
import { InputScore } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
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
      <p className="font-inter text-sm text-muted">Palpites encerrados para este jogo.</p>
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
      } else {
        setFeedback({ type: 'error', message: result.error })
      }
    })
  }

  return (
    <div>
      {isCountdown && (
        <p className="mb-4 flex items-center gap-1.5 font-inter text-sm text-warning">
          <Timer size={15} weight="bold" />
          Palpites encerram em {formatCountdown(Math.max(0, msLeft))}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-end justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="font-barlow text-sm font-bold uppercase tracking-wide text-secondary">
              {homeTeam}
            </span>
            <InputScore
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              disabled={isPending}
              aria-label={`Gols ${homeTeam}`}
            />
          </div>

          <span className="mb-4 font-barlow text-2xl font-bold text-muted">×</span>

          <div className="flex flex-col items-center gap-2">
            <span className="font-barlow text-sm font-bold uppercase tracking-wide text-secondary">
              {awayTeam}
            </span>
            <InputScore
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              disabled={isPending}
              aria-label={`Gols ${awayTeam}`}
            />
          </div>
        </div>

        <Button type="submit" variant="primary" disabled={isPending} className="w-full">
          {isPending ? 'Salvando...' : 'Salvar palpite'}
        </Button>
      </form>

      {feedback && (
        <p
          className={`mt-3 flex items-center gap-1.5 font-inter text-sm ${
            feedback.type === 'success' ? 'text-accent' : 'text-error'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle size={15} weight="fill" />
          ) : (
            <XCircle size={15} weight="fill" />
          )}
          {feedback.message}
        </p>
      )}
    </div>
  )
}
