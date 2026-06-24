'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface PaymentData {
  pixCode: string
  pixQrCodeImage: string
  amount: number
  groupName: string
}

export default function PagamentoPage({
  params,
}: {
  params: Promise<{ paymentId: string }>
}) {
  const router = useRouter()
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [data, setData] = useState<PaymentData | null>(null)
  const [copied, setCopied] = useState(false)
  const [expired, setExpired] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expireRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const copyRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    params.then(({ paymentId: pid }) => {
      setPaymentId(pid)
      const raw = sessionStorage.getItem(`gp_${pid}`)
      if (raw) { try { setData(JSON.parse(raw)) } catch {} }
    })
  }, [params])

  useEffect(() => {
    if (!paymentId) return
    function poll() {
      fetch(`/api/asaas/status/${paymentId}`)
        .then((r) => r.json())
        .then((json: { status: string; groupId?: string }) => {
          if (json.status === 'PAID') {
            if (!json.groupId) return // webhook still writing groupId — keep polling
            clearInterval(pollRef.current!)
            clearTimeout(expireRef.current!)
            sessionStorage.removeItem(`gp_${paymentId}`)
            router.push(`/grupos/${json.groupId}`)
          } else if (json.status === 'EXPIRED' || json.status === 'CANCELLED') {
            setExpired(true)
            clearInterval(pollRef.current!)
          }
        })
        .catch(() => {})
    }
    poll()
    pollRef.current = setInterval(poll, 3000)
    expireRef.current = setTimeout(() => {
      setExpired(true)
      clearInterval(pollRef.current!)
    }, 30 * 60 * 1000)
    return () => { clearInterval(pollRef.current!); clearTimeout(expireRef.current!) }
  }, [paymentId, router])

  function copyCode() {
    if (!data?.pixCode) return
    navigator.clipboard.writeText(data.pixCode).then(() => {
      setCopied(true)
      clearTimeout(copyRef.current!)
      copyRef.current = setTimeout(() => setCopied(false), 1800)
    })
  }

  // Loading state
  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="animate-spin inline-block w-5 h-5 rounded-full border-2 border-[rgba(0,255,135,.3)] border-t-[#00ff87]" />
      </div>
    )
  }

  // 2C — Expired
  if (expired) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 18px' }}>
            <div style={{ width: 336, background: '#16162a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '40px 32px', boxSizing: 'border-box', textAlign: 'center' }}>
            {/* Clock icon */}
            <div style={{ width: 64, height: 64, margin: '0 auto', border: '2px solid rgba(255,255,255,.18)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ position: 'absolute', width: 2, height: 18, background: 'rgba(255,255,255,.4)', borderRadius: 1, transformOrigin: 'bottom center', transform: 'translateY(-9px) rotate(20deg)' }} />
              <span style={{ position: 'absolute', width: 2, height: 13, background: 'rgba(255,255,255,.4)', borderRadius: 1, transformOrigin: 'bottom center', transform: 'translateY(-6.5px) rotate(-90deg)' }} />
              <span style={{ position: 'absolute', top: -7, left: '50%', width: 8, height: 5, border: '2px solid rgba(255,255,255,.18)', borderBottom: 'none', borderRadius: '3px 3px 0 0', transform: 'translateX(-50%)' }} />
            </div>
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 700, color: '#fff', textTransform: 'uppercase', marginTop: 20 }}>
              PIX expirado
            </div>
            <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,.55)', maxWidth: 300, margin: '10px auto 0' }}>
              O tempo para pagamento expirou. Volte e tente criar a liga novamente.
            </div>
            <button
              onClick={() => router.push('/grupos')}
              style={{ height: 46, padding: '0 28px', marginTop: 24, background: '#00ff87', color: '#0f0f1a', border: 'none', borderRadius: 12, fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Voltar para Ligas
            </button>
          </div>
      </div>
    )
  }

  // 2A / 2B — Awaiting payment
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 18px' }}>
        <div style={{ width: 336, background: '#16162a', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: 32, boxSizing: 'border-box' }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '.2em', color: 'rgba(255,255,255,.42)', textTransform: 'uppercase' }}>
            Criando liga
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 800, lineHeight: 1.05, color: '#fff', marginTop: 6, textTransform: 'uppercase' }}>
            {data.groupName}
          </div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 15, fontWeight: 600, color: '#00ff87', marginTop: 4 }}>
            R$ {data.amount.toFixed(2).replace('.', ',')}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '18px 0' }} />

          {/* QR code */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 200, height: 200, borderRadius: 10, background: '#0f0f1a', boxShadow: '0 0 24px rgba(0,255,135,.08)', padding: 16, boxSizing: 'border-box' }}>
              {data.pixQrCodeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/png;base64,${data.pixQrCodeImage}`}
                  alt="QR Code PIX"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 4 }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="animate-spin inline-block w-5 h-5 rounded-full border-2 border-[rgba(0,255,135,.3)] border-t-[#00ff87]" />
                </div>
              )}
            </div>
          </div>

          {/* Copy button — 2A default / 2B copied */}
          <button
            onClick={copyCode}
            style={{
              width: '100%', height: 48, marginTop: 18,
              background: copied ? 'rgba(0,255,135,.06)' : 'transparent',
              border: `1px solid ${copied ? 'rgba(0,255,135,.4)' : 'rgba(255,255,255,.12)'}`,
              borderRadius: 12,
              color: copied ? '#00ff87' : '#fff',
              fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            }}
          >
            {copied ? (
              <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 14, fontWeight: 700 }}>✓</span>
            ) : (
              <span style={{ display: 'inline-block', width: 14, height: 16, border: '1.5px solid rgba(255,255,255,.45)', borderRadius: 3, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -4, left: 3, width: 6, height: 4, border: '1.5px solid rgba(255,255,255,.45)', borderBottom: 'none', borderRadius: '2px 2px 0 0', background: '#16162a' }} />
              </span>
            )}
            {copied ? 'Código copiado!' : 'Copiar código PIX'}
          </button>

          {/* Spinner + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
            <span className="animate-spin inline-block shrink-0 w-5 h-5 rounded-full border-2 border-[rgba(0,255,135,.3)] border-t-[#00ff87]" />
            <span style={{ fontFamily: 'Inter,sans-serif', fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
              Aguardando confirmação do pagamento…
            </span>
          </div>

          <div style={{ fontFamily: 'Inter,sans-serif', fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,.3)', marginTop: 16 }}>
            Após o pagamento, a liga é criada automaticamente em instantes. Não feche esta página.
          </div>
        </div>
    </div>
  )
}
