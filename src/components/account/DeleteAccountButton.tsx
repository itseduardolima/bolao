'use client'

import { useState, useTransition } from 'react'
import { signOut } from 'next-auth/react'
import { deleteAccount } from '@/actions/account'
import { useConfirm } from '@/components/ui/ConfirmDialog'

export default function DeleteAccountButton() {
  const confirm = useConfirm()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    const ok = await confirm({
      title: 'Excluir sua conta?',
      description:
        'Esta ação é permanente. Seus palpites, pontos e participações em ligas serão apagados e não podem ser recuperados.',
      confirmLabel: 'Excluir conta',
      variant: 'danger',
    })
    if (!ok) return
    setError(null)
    startTransition(async () => {
      const result = await deleteAccount()
      if ('error' in result) {
        setError(result.error)
        return
      }
      // Conta apagada no servidor: limpa o cookie de sessão e volta para a home.
      await signOut({ callbackUrl: '/' })
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="bg-transparent border border-error/40 text-error px-[18px] py-[10px] rounded-[10px] font-inter text-[13px] font-semibold cursor-pointer transition-colors hover:bg-error/10 disabled:opacity-50"
      >
        {isPending ? 'Excluindo…' : 'Excluir minha conta'}
      </button>
      {error && <p className="font-inter text-[13px] text-error mt-[10px]">{error}</p>}
    </div>
  )
}
