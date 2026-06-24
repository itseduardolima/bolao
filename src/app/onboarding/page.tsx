'use client'

import Image from 'next/image'
import LogoCopa from '@/assets/images/logo-copa.png'
import { useOnboarding } from './useOnboarding'

export default function OnboardingPage() {
  const { value, setValue, status, error, isSaving, canSubmit, handleSubmit } = useOnboarding()

  const borderColor = status === 'available'
    ? '#00ff87'
    : status === 'unavailable' || status === 'invalid'
    ? '#ef4444'
    : 'rgba(255,255,255,.14)'

  const hintColor = status === 'available'
    ? '#00ff87'
    : status === 'unavailable'
    ? '#ef4444'
    : 'rgba(255,255,255,.42)'

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
        <p className="font-inter text-[14px] leading-[1.6] text-[rgba(255,255,255,.55)] text-center mt-[10px]">
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
              className="w-full h-[54px] px-[16px] pr-[46px] bg-base-dark text-primary font-inter text-[16px] font-semibold outline-none rounded-[12px] transition-colors"
              style={{ border: `1px solid ${borderColor}`, boxSizing: 'border-box' }}
            />

            {status === 'checking' && (
              <span className="absolute right-[16px] top-[19px] w-[16px] h-[16px] border-2 border-[rgba(255,255,255,.2)] border-t-white rounded-full inline-block animate-spin" />
            )}

            {status === 'available' && (
              <span className="absolute right-[14px] top-[16px] w-[22px] h-[22px] rounded-full bg-[rgba(0,255,135,.15)] text-accent flex items-center justify-center font-inter text-[12px] font-bold">
                ✓
              </span>
            )}

            {(status === 'unavailable' || status === 'invalid') && (
              <span className="absolute right-[14px] top-[16px] w-[22px] h-[22px] rounded-full bg-[rgba(239,68,68,.15)] text-error flex items-center justify-center font-inter text-[12px] font-bold">
                ✕
              </span>
            )}
          </div>

          {hintText && (
            <div className="font-inter text-[12.5px] font-medium mt-[10px] px-[2px]" style={{ color: hintColor }}>
              {hintText}
            </div>
          )}

          {error && (
            <p className="font-inter text-[13px] text-error mt-[10px]">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || isSaving}
            className="w-full h-[48px] mt-[20px] bg-accent text-black rounded-[12px] font-inter text-[15px] font-bold flex items-center justify-center gap-[8px] disabled:opacity-50 transition-opacity cursor-pointer disabled:cursor-not-allowed"
          >
            {isSaving && (
              <span className="w-[15px] h-[15px] border-2 border-[rgba(0,0,0,.3)] border-t-black rounded-full inline-block animate-spin" />
            )}
            {isSaving ? 'Salvando…' : 'Confirmar apelido'}
          </button>
        </form>
      </div>
    </main>
  )
}
