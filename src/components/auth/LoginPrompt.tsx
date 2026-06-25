'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { X } from '@phosphor-icons/react'
import Button from '@/components/ui/Button'

// Modal de login disparado pelo proxy ao mandar um deslogado para `/?login=1`.
// O `from` carrega o destino pretendido (ex.: /grupos), para onde o usuário volta
// assim que autentica.
export default function LoginPrompt() {
  const router = useRouter()
  const params = useSearchParams()

  if (params.get('login') !== '1') return null

  const from = params.get('from') || '/jogos'
  const close = () => router.replace('/', { scroll: false })

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-[24px] bg-black/70 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative w-full max-w-[400px] bg-surface border border-border rounded-[16px] p-[32px] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Fechar"
          className="absolute top-[14px] right-[14px] text-white/[42%] hover:text-primary transition-colors"
        >
          <X size={18} weight="bold" />
        </button>

        <h2 className="font-barlow text-[26px] font-extrabold uppercase text-primary leading-none">
          Entre para continuar
        </h2>
        <p className="font-inter text-[14px] leading-[1.6] text-white/[55%] mt-[10px]">
          Você precisa estar logado para acessar suas ligas e registrar palpites.
        </p>

        <Button
          variant="cta"
          size="lg"
          fullWidth
          onClick={() => signIn('google', { callbackUrl: from })}
          className="mt-[22px]"
        >
          Entrar com Google
        </Button>
      </div>
    </div>
  )
}
