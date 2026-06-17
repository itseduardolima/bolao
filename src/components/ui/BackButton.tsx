'use client'

import { useRouter } from 'next/navigation'
import { CaretLeft } from '@phosphor-icons/react'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="mb-4 inline-flex items-center gap-1 font-inter text-sm text-secondary transition-colors hover:text-primary"
    >
      <CaretLeft size={16} weight="bold" />
      Voltar
    </button>
  )
}
