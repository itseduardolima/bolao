'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinGroup } from '@/actions/groups'

export default function JoinGroupButton({ code }: { code: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleJoin() {
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
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleJoin}
        disabled={isPending}
        className="inline-flex items-center justify-center h-[48px] px-[36px] bg-accent text-black border-none rounded-xl font-inter text-[15px] font-bold cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
      >
        {isPending ? 'Entrando...' : 'Entrar na liga'}
      </button>
      {error && <p className="font-inter text-sm text-error">{error}</p>}
    </div>
  )
}
