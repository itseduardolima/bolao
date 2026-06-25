'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

function IconRanking() {
  return (
    <div className="flex items-end gap-[2px] h-[16px]">
      <span className="w-[3px] h-[8px] bg-current rounded-[1px]" />
      <span className="w-[3px] h-[12px] bg-current rounded-[1px]" />
      <span className="w-[3px] h-[16px] bg-current rounded-[1px]" />
    </div>
  )
}

function IconJogos() {
  return (
    <div className="grid gap-[2px] grid-cols-[7px_7px]">
      <span className="w-[7px] h-[7px] rounded-[2px] bg-current" />
      <span className="w-[7px] h-[7px] rounded-[2px] bg-current" />
      <span className="w-[7px] h-[7px] rounded-[2px] bg-current" />
      <span className="w-[7px] h-[7px] rounded-[2px] bg-current" />
    </div>
  )
}

function IconPontuacao() {
  return (
    <div className="w-[16px] h-[16px] border-2 border-current rounded-full flex items-center justify-center box-border">
      <span className="w-[5px] h-[5px] rounded-full bg-current" />
    </div>
  )
}

function IconGrupos() {
  return (
    <div className="w-[18px] h-[14px] relative">
      <span className="absolute top-0 left-[6px] w-[5px] h-[5px] rounded-full bg-current" />
      <span className="absolute bottom-0 left-[2px] w-[12px] h-[7px] bg-current rounded-t-[6px]" />
      <span className="absolute top-[1px] left-[12px] w-[4px] h-[4px] rounded-full bg-current opacity-70" />
      <span className="absolute bottom-0 left-[10px] w-[8px] h-[6px] bg-current opacity-70 rounded-t-[4px]" />
    </div>
  )
}

function IconPerfil() {
  return (
    <div className="w-[16px] h-[16px] relative">
      <span className="absolute top-0 left-[5px] w-[6px] h-[6px] rounded-full bg-current" />
      <span className="absolute bottom-0 left-[1px] w-[14px] h-[8px] bg-current rounded-t-[7px]" />
    </div>
  )
}

const items = [
  { href: '/', label: 'Ranking', icon: IconRanking },
  { href: '/jogos', label: 'Jogos', icon: IconJogos },
  { href: '/grupos', label: 'Grupos', icon: IconGrupos },
  { href: '/pontuacao', label: 'Pontuação', icon: IconPontuacao },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-border px-[6px] pb-[10px] pt-[8px] bg-[#121220]">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn('flex flex-1 flex-col items-center gap-[6px]', active ? 'text-accent' : 'text-white/40')}
          >
            <Icon />
            <span className="font-inter text-[10px] font-semibold leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
