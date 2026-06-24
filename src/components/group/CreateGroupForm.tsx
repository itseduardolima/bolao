'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup } from '@/actions/groups'
import { GROUP_NAME_MIN, GROUP_NAME_MAX } from '@/lib/group-constants'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

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
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da nova liga"
          maxLength={GROUP_NAME_MAX}
          autoComplete="off"
          disabled={isPending}
          aria-label="Nome da nova liga"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!canSubmit}
          className="shrink-0"
        >
          {isPending ? 'Criando...' : 'Criar liga'}
        </Button>
      </div>
      {error && <p className="mt-2 font-inter text-sm text-error">{error}</p>}
    </form>
  )
}
