'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const INTERVAL_MS = 60_000

export default function LiveRefresh({ active }: { active: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => router.refresh(), INTERVAL_MS)
    return () => clearInterval(id)
  }, [active, router])

  return null
}
