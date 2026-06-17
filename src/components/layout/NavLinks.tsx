'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/jogos', label: 'Jogos' },
  { href: '/pontuacao', label: 'Pontuação' },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <>
      {links.map(({ href, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'font-inter text-sm font-medium transition-colors',
              active
                ? 'border-b-2 border-accent pb-0.5 text-primary'
                : 'text-secondary hover:text-primary',
            )}
          >
            {label}
          </Link>
        )
      })}
    </>
  )
}
