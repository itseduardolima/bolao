'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const NICKNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

type CheckStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'

export function useOnboarding() {
  const { update } = useSession()
  const router = useRouter()

  const [value, setValue] = useState('')
  const [status, setStatus] = useState<CheckStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value) {
      setStatus('idle')
      return
    }

    if (!NICKNAME_REGEX.test(value)) {
      setStatus('invalid')
      return
    }

    setStatus('checking')
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/nickname/check?value=${encodeURIComponent(value)}`)
        const data = await res.json() as { available: boolean }
        setStatus(data.available ? 'available' : 'unavailable')
      } catch {
        setStatus('idle')
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status !== 'available' || isSaving) return

    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: value }),
      })
      const data = await res.json() as { success?: boolean; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Erro ao salvar nickname')
        if (res.status === 409) setStatus('unavailable')
        return
      }

      await update()
      router.push('/jogos')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const canSubmit = status === 'available' && !isSaving

  return { value, setValue, status, error, isSaving, canSubmit, handleSubmit }
}
