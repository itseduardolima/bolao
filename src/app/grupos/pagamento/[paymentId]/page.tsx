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
  const [status, setStatus] = useState<'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED'>('PENDING')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expireRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    params.then(({ paymentId: pid }) => {
      setPaymentId(pid)
      const raw = sessionStorage.getItem(`gp_${pid}`)
      if (raw) {
        try {
          setData(JSON.parse(raw))
        } catch {}
      }
    })
  }, [params])

  useEffect(() => {
    if (!paymentId) return

    function poll() {
      fetch(`/api/asaas/status/${paymentId}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.status === 'PAID') {
            setStatus('PAID')
            clearInterval(pollRef.current!)
            clearTimeout(expireRef.current!)
            sessionStorage.removeItem(`gp_${paymentId}`)
            router.push(`/grupos/${json.groupId}`)
          } else if (json.status === 'EXPIRED' || json.status === 'CANCELLED') {
            setStatus(json.status)
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

    return () => {
      clearInterval(pollRef.current!)
      clearTimeout(expireRef.current!)
    }
  }, [paymentId, router])

  function copyCode() {
    if (!data?.pixCode) return
    navigator.clipboard.writeText(data.pixCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#00ff87] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-[#16162a] border border-white/[.08] rounded-[16px] p-[32px] max-w-[400px] w-full text-center">
          <div className="text-[32px] mb-[8px]">⏱</div>
          <div className="font-barlow text-[22px] font-bold text-primary">PIX expirado</div>
          <p className="font-inter text-[14px] text-[rgba(255,255,255,.55)] mt-[10px] leading-relaxed">
            O tempo para pagamento expirou. Volte e tente criar a liga novamente.
          </p>
          <button
            onClick={() => router.push('/grupos')}
            className="mt-[20px] h-[46px] px-[28px] bg-[#00ff87] text-black rounded-[12px] font-inter text-[14px] font-bold cursor-pointer"
          >
            Voltar para Ligas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-[#16162a] border border-white/[.08] rounded-[16px] p-[32px] max-w-[400px] w-full">
        <div className="font-[Barlow_Condensed] text-[11px] font-semibold tracking-[.2em] text-[rgba(255,255,255,.42)] uppercase">
          Criando liga
        </div>
        <h1 className="font-barlow text-[26px] font-extrabold text-primary mt-[4px] leading-tight">
          {data.groupName}
        </h1>
        <div className="font-barlow text-[15px] font-semibold text-[#00ff87] mt-[2px]">
          R$ {data.amount.toFixed(2).replace('.', ',')}
        </div>

        <div className="mt-[24px] flex justify-center">
          {data.pixQrCodeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${data.pixQrCodeImage}`}
              alt="QR Code PIX"
              width={200}
              height={200}
              className="rounded-[10px]"
            />
          ) : (
            <div className="w-[200px] h-[200px] rounded-[10px] bg-[#0f0f1a] flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-[#00ff87] border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        <button
          onClick={copyCode}
          className="mt-[18px] w-full h-[48px] border border-white/[.12] rounded-[12px] font-inter text-[14px] font-semibold text-primary cursor-pointer hover:border-white/[.25] transition-colors flex items-center justify-center gap-[8px]"
        >
          {copied ? (
            <>
              <span className="text-[#00ff87]">✓</span> Código copiado!
            </>
          ) : (
            'Copiar código PIX'
          )}
        </button>

        <div className="mt-[22px] flex items-center gap-[10px]">
          <div className="w-5 h-5 rounded-full border-2 border-[#00ff87] border-t-transparent animate-spin flex-shrink-0" />
          <span className="font-inter text-[13px] text-[rgba(255,255,255,.55)]">
            Aguardando confirmação do pagamento…
          </span>
        </div>

        <p className="font-inter text-[12px] text-[rgba(255,255,255,.3)] mt-[14px] leading-relaxed">
          Após o pagamento, a liga é criada automaticamente em instantes.
          Não feche esta página.
        </p>
      </div>
    </div>
  )
}
