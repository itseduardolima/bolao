'use client'

import { signIn } from 'next-auth/react'
import { buildInvitePath } from '@/lib/group-constants'
import Button from '@/components/ui/Button'

export default function SignInToJoinButton({ code }: { code: string }) {
  return (
    <Button
      type="button"
      variant="primary"
      size="md"
      onClick={() => signIn('google', { callbackUrl: buildInvitePath(code) })}
      className="w-full"
    >
      Entrar com Google para participar
    </Button>
  )
}
