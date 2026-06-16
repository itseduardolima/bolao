'use client'

import { signOut } from 'next-auth/react'
import { SignOut } from '@phosphor-icons/react'
import Button from '@/components/ui/Button'

export default function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center gap-1.5"
      aria-label="Sair"
    >
      <SignOut size={16} weight="bold" />
      <span className="hidden sm:inline">Sair</span>
    </Button>
  )
}
