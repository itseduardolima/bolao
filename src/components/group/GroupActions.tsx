'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SignOut, Trash } from '@phosphor-icons/react'
import { leaveGroup, deleteGroup } from '@/actions/groups'
import { useConfirm } from '@/components/ui/ConfirmDialog'

type GroupActionsProps = {
  groupId: string
  isOwner: boolean
}

export default function GroupActions({ groupId, isOwner }: GroupActionsProps) {
  const router = useRouter()
  const confirm = useConfirm()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleLeave() {
    const ok = await confirm({
      title: 'Sair do grupo?',
      description: 'Você deixará de aparecer no ranking desta liga. Pode entrar de novo com o código de convite.',
      confirmLabel: 'Sair',
      variant: 'danger',
    })
    if (!ok) return
    setError(null)
    startTransition(async () => {
      const result = await leaveGroup(groupId)
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.push('/grupos')
    })
  }

  async function handleDelete() {
    const ok = await confirm({
      title: 'Excluir grupo?',
      description: 'Esta ação é permanente. O grupo e todos os seus membros serão removidos.',
      confirmLabel: 'Excluir',
      variant: 'danger',
    })
    if (!ok) return
    setError(null)
    startTransition(async () => {
      const result = await deleteGroup(groupId)
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.push('/grupos')
    })
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {isOwner ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 font-inter text-sm text-error transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          <Trash size={16} weight="bold" />
          {isPending ? 'Excluindo...' : 'Excluir grupo'}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleLeave}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 font-inter text-sm text-secondary transition-colors hover:text-error disabled:opacity-50"
        >
          <SignOut size={16} weight="bold" />
          {isPending ? 'Saindo...' : 'Sair do grupo'}
        </button>
      )}
      {error && <p className="font-inter text-sm text-error">{error}</p>}
    </div>
  )
}
