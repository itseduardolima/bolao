'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GROUP_NAME_MIN, GROUP_NAME_MAX } from '@/lib/group-constants'

const PRICE_DISPLAY = process.env.NEXT_PUBLIC_GROUP_PRICE_DISPLAY ?? 'R$ 6,00'

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function CreateGroupForm() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedName = name.trim()
  const nameValid = trimmedName.length >= GROUP_NAME_MIN && trimmedName.length <= GROUP_NAME_MAX
  const cpfValid = cpf.replace(/\D/g, '').length === 11

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCpf(formatCpf(e.target.value))
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!nameValid || !cpfValid || loading) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/asaas/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName: trimmedName, cpf: cpf.replace(/\D/g, '') }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao criar cobrança')
        return
      }
      sessionStorage.setItem(
        `gp_${data.paymentId}`,
        JSON.stringify({
          pixCode: data.pixCode,
          pixQrCodeImage: data.pixQrCodeImage,
          amount: data.amount,
          groupName: trimmedName,
        })
      )
      router.push(`/grupos/pagamento/${data.paymentId}`)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-[18px] pb-5">
      <div className="font-barlow text-[11px] font-semibold uppercase tracking-[.2em] text-[rgba(255,255,255,.42)]">
        Criar nova liga
      </div>

      {step === 1 ? (
        <div className="flex gap-2 mt-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da liga"
            maxLength={GROUP_NAME_MAX}
            className="flex-1 h-[42px] px-[14px] bg-base border border-white/10 rounded-[10px] text-primary font-inter text-[14px] font-medium outline-none focus:border-white/25 transition-colors placeholder:text-muted"
          />
          <button
            type="button"
            disabled={!nameValid}
            onClick={() => { setError(null); setStep(2) }}
            className="h-[42px] px-[20px] bg-accent text-black border-none rounded-[10px] font-inter text-[14px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-85"
          >
            Próximo →
          </button>
        </div>
      ) : (
        <form onSubmit={handlePay}>
          <button
            type="button"
            onClick={() => { setStep(1); setError(null) }}
            className="mt-[10px] font-inter text-[12px] text-[rgba(255,255,255,.42)] hover:text-[rgba(255,255,255,.7)] transition-colors cursor-pointer"
          >
            ← {trimmedName}
          </button>

          <div className="mt-[10px]">
            <label className="font-inter text-[12px] font-medium text-[rgba(255,255,255,.55)]">
              CPF do pagador
            </label>
            <input
              value={cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              inputMode="numeric"
              autoFocus
              className="mt-[6px] w-full h-[42px] px-[14px] bg-base border border-white/10 rounded-[10px] text-primary font-inter text-[14px] font-medium outline-none focus:border-white/25 transition-colors placeholder:text-muted"
            />
          </div>

          <div className="mt-[4px] font-inter text-[11px] text-[rgba(255,255,255,.3)]">
            Usado apenas para emissão da cobrança PIX. Não armazenamos seu CPF.
          </div>

          <button
            type="submit"
            disabled={!cpfValid || loading}
            className="mt-[14px] w-full h-[44px] bg-accent text-black border-none rounded-[10px] font-inter text-[14px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-85"
          >
            {loading ? 'Gerando cobrança...' : `Pagar ${PRICE_DISPLAY} via PIX`}
          </button>

          {error && (
            <div className="font-inter text-[12px] text-error mt-2">{error}</div>
          )}
        </form>
      )}
    </div>
  )
}
