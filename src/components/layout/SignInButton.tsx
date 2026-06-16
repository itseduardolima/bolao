'use client'

import { signIn } from 'next-auth/react'
import Button from '@/components/ui/Button'

export default function SignInButton() {
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={() => signIn('google', { callbackUrl: '/jogos' })}
    >
      Entrar com Google
    </Button>
  )
}
