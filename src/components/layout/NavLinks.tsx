'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function NavLinks() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Ranking' },
    { href: '/jogos', label: 'Jogos' },
    { href: '/grupos', label: 'Grupos' },
    { href: '/pontuacao', label: 'Pontuação' },
  ]

  return (
    <div className="flex items-center gap-[26px]">
      {links.map(({ href, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'font-inter text-[13px] font-semibold',
              active
                ? 'text-primary font-semibold'
                : 'text-[rgba(255,255,255,.55)] font-semibold hover:text-primary',
            )}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
