import Link from 'next/link'
import { Trophy } from '@phosphor-icons/react/dist/ssr'
import Container from './Container'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#0a0a14]">
      <Container className="flex h-14 items-center justify-between py-0">
        <Link
          href="/"
          className="flex items-center gap-2 font-barlow text-[22px] font-black uppercase tracking-wide text-accent"
        >
          <Trophy size={22} weight="fill" />
          Bolão 2026
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/jogos"
            className="font-inter text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            Jogos
          </Link>
          <Link
            href="/perfil"
            className="font-inter text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            Meu perfil
          </Link>
        </nav>
      </Container>
    </header>
  )
}
