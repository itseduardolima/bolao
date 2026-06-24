'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup } from '@/actions/groups'
import { GROUP_NAME_MIN, GROUP_NAME_MAX } from '@/lib/group-constants'

export default function CreateGroupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const trimmedLength = name.trim().length
  const canSubmit =
    trimmedLength >= GROUP_NAME_MIN && trimmedLength <= GROUP_NAME_MAX && !isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    startTransition(async () => {
      const result = await createGroup(name)
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
        Criar nova liga
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 mt-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
            placeholder="Nome da liga"
            maxLength={GROUP_NAME_MAX}
            className="flex-1 h-[42px] px-[14px] bg-base border border-white/10 rounded-[10px] text-primary font-inter text-[14px] font-medium outline-none focus:border-white/25 transition-colors placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-[42px] px-[22px] bg-accent text-black border-none rounded-[10px] font-inter text-[14px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-85"
          >
            {isPending ? 'Criando...' : 'Criar'}
          </button>
        </div>
        {error && (
          <div className="font-inter text-[12px] text-error mt-2">{error}</div>
        )}
      </form>
    </div>
  )
}
