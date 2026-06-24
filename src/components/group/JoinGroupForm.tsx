'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinGroup } from '@/actions/groups'
import { INVITE_CODE_LENGTH, normalizeInviteCode } from '@/lib/group-constants'

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
    <div className="bg-surface border border-border rounded-xl p-[18px] pb-5">
      <div className="font-barlow text-[11px] font-semibold uppercase tracking-[.2em] text-[rgba(255,255,255,.42)]">
        Entrar com código
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 mt-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={INVITE_CODE_LENGTH}
            placeholder="A1B2C3D4"
            className="flex-1 min-w-0 h-[42px] px-[14px] bg-base border border-white/10 rounded-[10px] text-primary font-mono text-[14px] tracking-[.18em] uppercase outline-none focus:border-white/25 transition-colors placeholder:text-muted placeholder:tracking-normal placeholder:normal-case"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="shrink-0 h-[42px] px-[22px] bg-elevated border border-white/14 text-primary rounded-[10px] font-inter text-[14px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-80"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
        {error && (
          <div className="font-inter text-[12px] text-error mt-2">{error}</div>
        )}
      </form>
    </div>
  )
}
