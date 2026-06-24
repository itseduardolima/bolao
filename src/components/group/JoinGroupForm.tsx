'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinGroup } from '@/actions/groups'
import { INVITE_CODE_LENGTH, normalizeInviteCode } from '@/lib/group-constants'
import Input from '@/components/ui/Input'

export default function JoinGroupForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canSubmit = normalizeInviteCode(code) !== null && !isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    startTransition(async () => {
      const result = await joinGroup(code)
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.push(`/grupos/${result.groupId}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="font-inter text-sm text-secondary">Tem um convite?</span>
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="CÓDIGO"
        maxLength={INVITE_CODE_LENGTH}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-label="Código de convite"
        className="h-9 w-36 py-0 font-barlow text-base font-bold tracking-[0.25em] placeholder:tracking-normal placeholder:font-inter placeholder:text-muted"
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={!canSubmit}
        className="font-inter text-sm font-semibold text-accent transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {isPending ? 'Entrando...' : 'Entrar'}
      </button>
      {error && <p className="w-full font-inter text-sm text-error">{error}</p>}
    </form>
  )
}
