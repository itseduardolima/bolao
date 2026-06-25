'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { removeMember } from '@/actions/groups'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import Spinner from '@/components/ui/Spinner'

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
  const [, setError] = useState<string | null>(null)
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
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      className="bg-transparent border-none font-inter text-[12px] font-semibold text-error cursor-pointer px-2 py-1.5 rounded-md transition-colors hover:bg-error/10 disabled:opacity-50"
    >
      {isPending ? (
        <span className="inline-flex items-center gap-1.5">
          <Spinner tone="error" className="h-[13px] w-[13px]" />
          Removendo
        </span>
      ) : (
        'Remover'
      )}
    </button>
  )
}
