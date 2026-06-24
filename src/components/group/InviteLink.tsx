'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, ArrowsClockwise } from '@phosphor-icons/react'
import { regenerateInviteCode } from '@/actions/groups'
import { buildInvitePath } from '@/lib/group-constants'
import { useConfirm } from '@/components/ui/ConfirmDialog'

type InviteLinkProps = {
  groupId: string
  code: string
  isOwner: boolean
}

export default function InviteLink({ groupId, code: initialCode, isOwner }: InviteLinkProps) {
  const router = useRouter()
  const confirm = useConfirm()
  const [code, setCode] = useState(initialCode)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const path = buildInvitePath(code)

  async function handleCopy() {
    // origin lido no handler (cliente) — evita hydration mismatch e efeitos.
    const url = `${window.location.origin}${path}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Não foi possível copiar. Copie o código manualmente.')
    }
  }

  async function handleRegenerate() {
    const ok = await confirm({
      title: 'Gerar novo código?',
      description: 'O link de convite atual deixará de funcionar. Quem já é membro continua no grupo.',
      confirmLabel: 'Gerar novo',
    })
    if (!ok) return
    setError(null)
    startTransition(async () => {
      const result = await regenerateInviteCode(groupId)
      if ('error' in result) {
        setError(result.error)
        return
      }
      setCode(result.inviteCode)
      setCopied(false)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-inter text-[11px] uppercase tracking-widest text-secondary">
          Convite
        </span>
        {isOwner && (
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isPending}
            className="inline-flex items-center gap-1 font-inter text-[11px] text-secondary transition-colors hover:text-primary disabled:opacity-50"
          >
            <ArrowsClockwise size={12} weight="bold" className={isPending ? 'animate-spin' : ''} />
            {isPending ? 'Gerando' : 'Novo código'}
          </button>
        )}
      </div>

      <div className="flex items-stretch overflow-hidden rounded-xl border border-border bg-elevated">
        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
          <span className="font-barlow text-2xl font-black tracking-[0.3em] text-accent">
            {code}
          </span>
          <span className="mt-0.5 truncate font-inter text-xs text-muted">{path}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1.5 border-l border-border px-4 font-inter text-sm font-semibold text-secondary transition-colors hover:bg-surface hover:text-primary"
          aria-label="Copiar link de convite"
        >
          {copied ? (
            <>
              <Check size={16} weight="bold" className="text-accent" />
              <span className="text-accent">Copiado</span>
            </>
          ) : (
            <>
              <Copy size={16} weight="bold" />
              Copiar
            </>
          )}
        </button>
      </div>

      {error && <p className="mt-2 font-inter text-sm text-error">{error}</p>}
    </div>
  )
}
