'use client'

import { useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { buildInvitePath } from '@/lib/group-constants'

export default function SignInToJoinButton({ code }: { code: string }) {
  const [isPending, startTransition] = useTransition()

  function handleSignIn() {
    startTransition(() => {
      signIn('google', { callbackUrl: buildInvitePath(code) })
    })
  }

  return (
    <button
      onClick={handleSignIn}
      className="inline-flex items-center gap-[10px] h-[48px] px-[24px] bg-white text-[#1a1a1a] border-none rounded-xl font-inter text-[15px] font-semibold cursor-pointer hover:opacity-90 transition-opacity"
    >
      <span className="w-5 h-5 rounded-full bg-[#0f0f1a] text-white inline-flex items-center justify-center font-barlow text-[12px] font-bold">G</span>
      {isPending ? 'Entrando...' : 'Entrar com Google'}
    </button>
  )
}
