'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GROUP_NAME_MIN, GROUP_NAME_MAX } from '@/lib/group-constants'

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
    <div style={{ background: '#16162a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: 18 }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '.2em', color: 'rgba(255,255,255,.42)', textTransform: 'uppercase' }}>
          Criar nova liga
        </div>

        {step === 1 ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da liga"
              maxLength={GROUP_NAME_MAX}
              style={{
                flex: 1, minWidth: 0, height: 42, padding: '0 14px',
                background: '#0f0f1a',
                border: `1px solid ${nameValid ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.1)'}`,
                borderRadius: 10, color: '#fff',
                font: '500 14px Inter,sans-serif', outline: 'none',
                fontSize: 16
              }}
            />
            <button
              type="button"
              disabled={!nameValid}
              onClick={() => { setError(null); setStep(2) }}
              style={{
                flexShrink: 0, height: 42, padding: '0 20px', border: 'none',
                borderRadius: 12, fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 700,
                background: '#00ff87', color: '#0f0f1a',
                opacity: nameValid ? 1 : 0.4,
                cursor: nameValid ? 'pointer' : 'not-allowed',
              }}
            >
              Próximo
            </button>
          </div>
        ) : (
          <>
            <div
              onClick={() => { setStep(1); setError(null) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.42)', cursor: 'pointer', marginTop: 13 }}
            >
              <span style={{ display: 'inline-block', width: 6, height: 6, borderLeft: '2px solid currentColor', borderBottom: '2px solid currentColor', transform: 'rotate(45deg)' }} />
              {trimmedName}
            </div>

            <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.55)', marginTop: 14 }}>
              CPF do pagador
            </div>
            <input
              value={cpf}
              onChange={(e) => setCpf(maskCpf(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box', height: 42, padding: '0 14px', marginTop: 7,
                background: '#0f0f1a',
                border: `1px solid ${cpfValid ? 'rgba(0,255,135,.4)' : 'rgba(255,255,255,.1)'}`,
                borderRadius: 10, color: '#fff',
                font: '500 14px Inter,sans-serif', outline: 'none', letterSpacing: '.02em',
                fontSize: 16
              }}
            />
            <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 11, lineHeight: 1.4, color: 'rgba(255,255,255,.3)', fontStyle: 'italic', marginTop: 8 }}>
              Usado apenas para emissão da cobrança PIX. Não armazenamos seu CPF.
            </div>

            <button
              type="button"
              disabled={!cpfValid || loading}
              onClick={handlePay}
              style={{
                width: '100%', height: 44, marginTop: 16, border: 'none',
                borderRadius: 12, fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                background: '#00ff87', color: '#0f0f1a',
                opacity: (!cpfValid || loading) ? (loading ? 0.8 : 0.4) : 1,
                cursor: loading ? 'wait' : cpfValid ? 'pointer' : 'not-allowed',
              }}
            >
              {loading && (
                <span className="animate-spin inline-block w-[15px] h-[15px] rounded-full border-2 border-[rgba(15,15,26,.35)] border-t-[#0f0f1a]" />
              )}
              {loading ? 'Gerando cobrança…' : `Pagar ${PRICE_DISPLAY} via PIX`}
            </button>

            {error && (
              <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, color: '#ff4d6d', marginTop: 8 }}>
                {error}
              </div>
            )}
          </>
        )}
    </div>
  )
}
