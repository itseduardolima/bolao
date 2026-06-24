'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
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
  const [open, setOpen] = useState(false)
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full bg-surface border border-border px-5 py-3 flex items-center justify-between gap-3 hover:border-white/20 transition-colors ${open ? 'rounded-t-xl' : 'rounded-xl'}`}
      >
        <span className="font-barlow text-[11px] font-semibold uppercase tracking-[.2em] text-[rgba(255,255,255,.42)]">
          Código de convite
        </span>
        {open
          ? <CaretUp size={14} weight="bold" className="text-[rgba(255,255,255,.35)]" />
          : <CaretDown size={14} weight="bold" className="text-[rgba(255,255,255,.35)]" />
        }
      </button>

      {open && (
        <div className="bg-surface border border-border border-t-0 rounded-b-xl px-5 pb-5 pt-4 flex items-center justify-between gap-6 flex-wrap -mt-px">
          {/* Left side: code block */}
          <div>
            <div className="font-barlow text-[34px] font-black leading-none tracking-[.16em] text-accent">
              {code}
            </div>
            <div className="font-mono text-[12px] text-[rgba(255,255,255,.27)] mt-2">
              {path}
            </div>
          </div>

          {/* Right side: action buttons */}
          <div className="flex sm:flex-row flex-col gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="h-[40px] px-4 bg-elevated border border-border text-primary rounded-[10px] font-inter text-[13px] font-semibold transition-colors hover:border-white/20"
              aria-label="Copiar link de convite"
            >
              {copied ? <span className="text-accent">✓ Copiado</span> : 'Copiar link'}
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isPending}
                className="h-[40px] px-4 bg-transparent border border-error/40 text-error rounded-[10px] font-inter text-[13px] font-semibold transition-colors hover:bg-error/10 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <span className="inline-block w-3 h-3 rounded-full border-2 border-white/20 border-t-error animate-spin" />
                    {' '}Gerando…
                  </>
                ) : (
                  'Novo código'
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 font-inter text-[12px] text-error">{error}</p>
      )}
    </div>
  )
}
