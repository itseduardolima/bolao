'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import LogoCopa from '@/assets/images/logo-copa.png'
import { useOnboarding } from './useOnboarding'

export default function OnboardingPage() {
  const { value, setValue, status, error, isSaving, canSubmit, handleSubmit } = useOnboarding()

  const borderClass = status === 'available'
    ? 'border-accent'
    : status === 'unavailable' || status === 'invalid'
    ? 'border-[#ef4444]'
    : 'border-white/[14%]'

  const hintClass = status === 'available'
    ? 'text-accent'
    : status === 'unavailable'
    ? 'text-[#ef4444]'
    : 'text-white/[42%]'

  const hintText = status === 'checking'
    ? 'Verificando…'
    : status === 'available'
    ? '✓ Disponível'
    : status === 'unavailable'
    ? '✕ Já está em uso'
    : status === 'invalid'
    ? 'Entre 3 e 20 caracteres'
    : ''

  return (
    <main className="flex min-h-[calc(100vh-62px)] items-center justify-center px-[24px] py-[80px]">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center justify-center gap-[9px] mb-[48px]">
          <Image src={LogoCopa} alt="Bolão 2026" width={24} height={24} className="shrink-0" />
          <span className="font-barlow text-[17px] font-black text-primary leading-none">
            Bolão - Copa do mundo <span className="text-accent">2026</span>
          </span>
        </div>

        <h1 className="font-barlow text-[34px] font-extrabold text-primary leading-[1.05] text-center">
          Escolha seu apelido
        </h1>
        <p className="font-inter text-[14px] leading-[1.6] text-white/[55%] text-center mt-[10px]">
          É como você vai aparecer no ranking e nas ligas. Escolha com carinho — não dá para mudar depois.
        </p>

        <form onSubmit={handleSubmit} className="mt-[30px]">
          <div className="relative">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="seuapelido"
              maxLength={20}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className={cn(
                'w-full h-[54px] px-[16px] pr-[46px] bg-base-dark text-primary font-inter text-[16px] font-semibold outline-none rounded-[12px] border transition-colors',
                borderClass
              )}
            />

            {status === 'checking' && (
              <Spinner tone="light" className="absolute right-[16px] top-[19px] h-4 w-4" />
            )}

            {status === 'available' && (
              <span className="absolute right-[14px] top-[16px] w-[22px] h-[22px] rounded-full bg-accent/15 text-accent flex items-center justify-center font-inter text-[12px] font-bold">
                ✓
              </span>
            )}

            {(status === 'unavailable' || status === 'invalid') && (
              <span className="absolute right-[14px] top-[16px] w-[22px] h-[22px] rounded-full bg-[#ef4444]/15 text-error flex items-center justify-center font-inter text-[12px] font-bold">
                ✕
              </span>
            )}
          </div>

          {hintText && (
            <div className={cn('font-inter text-[12.5px] font-medium mt-[10px] px-[2px]', hintClass)}>
              {hintText}
            </div>
          )}

          {error && (
            <p className="font-inter text-[13px] text-error mt-[10px]">{error}</p>
          )}

          <Button
            type="submit"
            variant="cta"
            size="lg"
            fullWidth
            loading={isSaving}
            disabled={!canSubmit}
            className="mt-[20px]"
          >
            {isSaving ? 'Salvando…' : 'Confirmar apelido'}
          </Button>
        </form>
      </div>
    </main>
  )
}
