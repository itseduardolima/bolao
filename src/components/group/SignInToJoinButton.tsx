'use client'

import { useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { buildInvitePath } from '@/lib/group-constants'
import { GoogleIcon } from '@/assets/icons/GoogleIcon'

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
      <GoogleIcon />
      {isPending ? 'Entrando...' : 'Entrar com Google'}
    </button>
  )
}
