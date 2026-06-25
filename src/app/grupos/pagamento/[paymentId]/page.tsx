'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Copy, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Eyebrow from '@/components/ui/Eyebrow'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner tone="accent" className="h-5 w-5" />
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center px-[18px]">
        <Card className="w-[336px] rounded-2xl py-10 px-8 text-center">
          <Clock size={64} weight="bold" className="mx-auto text-white/[18%]" />
          <div className="font-barlow text-[22px] font-bold uppercase text-white mt-5">
            PIX expirado
          </div>
          <p className="font-inter text-[14px] leading-[1.6] text-white/55 max-w-[300px] mx-auto mt-[10px]">
            O tempo para pagamento expirou. Volte e tente criar a liga novamente.
          </p>
          <Button
            variant="cta"
            onClick={() => router.push('/grupos')}
            className="h-[46px] px-7 mt-6 text-[14px]"
          >
            Voltar para Ligas
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-[18px]">
      <Card className="w-[336px] rounded-2xl p-8">
        <Eyebrow>Criando liga</Eyebrow>
        <div className="font-barlow text-[26px] font-extrabold uppercase leading-[1.05] text-white mt-[6px]">
          {data.groupName}
        </div>
        <div className="font-barlow text-[15px] font-semibold text-accent mt-1">
          R$ {data.amount.toFixed(2).replace('.', ',')}
        </div>

        <div className="h-px bg-white/[6%] my-[18px]" />

        <div className="flex justify-center">
          <div className="w-[200px] h-[200px] rounded-[10px] bg-base p-4 shadow-[0_0_24px_rgba(0,255,135,.08)]">
            {data.pixQrCodeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/png;base64,${data.pixQrCodeImage}`}
                alt="QR Code PIX"
                className="w-full h-full object-contain rounded-[4px]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Spinner tone="accent" className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={copyCode}
          className={cn(
            'w-full h-12 mt-[18px] rounded-xl border flex items-center justify-center gap-[9px] font-inter text-[14px] font-semibold cursor-pointer transition-colors',
            copied ? 'bg-accent/[6%] border-accent/40 text-accent' : 'bg-transparent border-white/[12%] text-white'
          )}
        >
          {copied ? (
            <Check size={16} weight="bold" />
          ) : (
            <Copy size={16} weight="bold" className="text-white/45" />
          )}
          {copied ? 'Código copiado!' : 'Copiar código PIX'}
        </button>

        <div className="flex items-center gap-[10px] mt-[18px]">
          <Spinner tone="accent" className="h-5 w-5 shrink-0" />
          <span className="font-inter text-[13px] text-white/55">
            Aguardando confirmação do pagamento…
          </span>
        </div>

        <p className="font-inter text-[12px] leading-[1.5] text-white/30 mt-4">
          Após o pagamento, a liga é criada automaticamente em instantes. Não feche esta página.
        </p>
      </Card>
    </div>
  )
}
