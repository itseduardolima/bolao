'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowsClockwise } from '@phosphor-icons/react'

export default function SyncGamesButton() {
  const [syncing, setSyncing] = useState(false)
  const router = useRouter()

  const handleSync = async () => {
    setSyncing(true)
    try {
      await fetch('/api/games/sync', { method: 'POST' })
      router.refresh()
    } finally {
      setSyncing(false)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-1 font-inter text-xs text-secondary transition-colors hover:text-accent disabled:opacity-50"
    >
      <ArrowsClockwise
        size={12}
        weight="bold"
        className={syncing ? 'animate-spin' : ''}
      />
      {syncing ? 'Sincronizando...' : 'Atualizar placar'}
    </button>
  )
}
