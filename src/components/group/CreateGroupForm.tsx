'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Eyebrow from '@/components/ui/Eyebrow'
import Button from '@/components/ui/Button'
import { GROUP_NAME_MIN, GROUP_NAME_MAX } from '@/lib/group-constants'

const INPUT_BASE =
  'flex-1 min-w-0 h-[42px] px-[14px] bg-base rounded-[10px] text-primary font-inter text-[16px] font-medium outline-none transition-colors border'

const PRICE_DISPLAY = process.env.NEXT_PUBLIC_GROUP_PRICE_DISPLAY ?? 'R$ 6,00'

function maskCpf(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length > 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9)
  if (d.length > 6) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6)
  if (d.length > 3) return d.slice(0, 3) + '.' + d.slice(3)
  return d
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
  const cpfDigits = cpf.replace(/\D/g, '')
  const cpfValid = cpfDigits.length === 11

  async function handlePay() {
    if (!cpfValid || loading) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/asaas/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName: trimmedName, cpf: cpfDigits }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao criar cobrança'); return }
      sessionStorage.setItem(`gp_${data.paymentId}`, JSON.stringify({
        pixCode: data.pixCode,
        pixQrCodeImage: data.pixQrCodeImage,
        amount: data.amount,
        groupName: trimmedName,
      }))
      router.push(`/grupos/pagamento/${data.paymentId}`)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl p-[18px]">
      <Eyebrow>Criar nova liga</Eyebrow>

      {step === 1 ? (
        <div className="flex gap-2 mt-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da liga"
            maxLength={GROUP_NAME_MAX}
            className={cn(INPUT_BASE, nameValid ? 'border-white/25' : 'border-white/10')}
          />
          <Button
            type="button"
            variant="cta"
            disabled={!nameValid}
            onClick={() => { setError(null); setStep(2) }}
            className="shrink-0 h-[42px] px-5 text-[14px]"
          >
            Próximo
          </Button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => { setStep(1); setError(null) }}
            className="inline-flex items-center gap-[7px] mt-[13px] font-inter text-[12px] font-medium text-white/[42%] cursor-pointer"
          >
            <span className="inline-block w-[6px] h-[6px] border-l-2 border-b-2 border-current rotate-45" />
            {trimmedName}
          </button>

          <div className="font-inter text-[12px] font-medium text-white/55 mt-[14px]">
            CPF do pagador
          </div>
          <input
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
            placeholder="000.000.000-00"
            inputMode="numeric"
            autoFocus
            className={cn(
              'w-full h-[42px] px-[14px] mt-[7px] bg-base rounded-[10px] text-primary font-inter text-[16px] font-medium tracking-[.02em] outline-none transition-colors border',
              cpfValid ? 'border-accent/40' : 'border-white/10'
            )}
          />
          <div className="font-inter text-[11px] leading-[1.4] italic text-white/30 mt-2">
            Usado apenas para emissão da cobrança PIX. Não armazenamos seu CPF.
          </div>

          <Button
            type="button"
            variant="cta"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!cpfValid}
            onClick={handlePay}
            className="h-11 mt-4 text-[14px]"
          >
            {loading ? 'Gerando cobrança…' : `Pagar ${PRICE_DISPLAY} via PIX`}
          </Button>

          {error && (
            <div className="font-inter text-[12px] text-error mt-2">{error}</div>
          )}
        </>
      )}
    </Card>
  )
}
