'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X } from '@phosphor-icons/react'
import { removeMember } from '@/actions/groups'
import { useConfirm } from '@/components/ui/ConfirmDialog'

type RemoveMemberButtonProps = {
  groupId: string
  targetUserId: string
  targetName: string
}

export default function RemoveMemberButton({
  groupId,
  targetUserId,
  targetName,
}: RemoveMemberButtonProps) {
  const router = useRouter()
  const confirm = useConfirm()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleRemove() {
    const ok = await confirm({
      title: 'Remover membro?',
      description: `${targetName} sairá do grupo. Pode voltar depois com o código de convite.`,
      confirmLabel: 'Remover',
      variant: 'danger',
    })
    if (!ok) return
    setError(null)
    startTransition(async () => {
      const result = await removeMember(groupId, targetUserId)
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md p-1 text-secondary transition-colors hover:bg-elevated hover:text-error disabled:opacity-50"
        aria-label={`Remover ${targetName}`}
        title={`Remover ${targetName}`}
      >
        <X size={16} weight="bold" />
      </button>
      {error && <span className="font-inter text-xs text-error">{error}</span>}
    </>
  )
}
