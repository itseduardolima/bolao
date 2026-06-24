'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { joinGroup } from '@/actions/groups'
import Button from '@/components/ui/Button'

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
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={handleJoin}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? 'Entrando...' : 'Entrar no grupo'}
      </Button>
      {error && <p className="font-inter text-sm text-error">{error}</p>}
    </div>
  )
}
