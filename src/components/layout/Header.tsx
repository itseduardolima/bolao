import Link from 'next/link'
import { Trophy, CalendarBlank, ListNumbers } from '@phosphor-icons/react/dist/ssr'
import { auth } from '@/lib/auth'
import Avatar from '@/components/ui/Avatar'
import Container from './Container'
import SignInButton from './SignInButton'
import SignOutButton from './SignOutButton'

export default async function Header() {
  const session = await auth()
  const user = session?.user

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-base-dark">
      <Container className="flex h-14 items-center justify-between py-0">
        {/* Logo: short on mobile, full on desktop */}
        <Link
          href="/"
          className="flex items-center gap-2 font-barlow text-[20px] font-black uppercase tracking-wide text-accent sm:text-[22px]"
        >
          <Trophy size={20} weight="fill" className="shrink-0" />
          <span className="sm:hidden">Bolão 2026</span>
          <span className="hidden sm:inline">Bolão - Copa do mundo 2026</span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          {/* Jogos: icon on mobile, text on desktop */}
          <Link
            href="/jogos"
            className="flex items-center gap-1.5 font-inter text-sm font-medium text-secondary transition-colors hover:text-primary"
            aria-label="Jogos"
          >
            <CalendarBlank size={18} weight="bold" className="sm:hidden" />
            <span className="hidden sm:inline">Jogos</span>
          </Link>

          {/* Pontuação: icon on mobile, text on desktop */}
          <Link
            href="/pontuacao"
            className="flex items-center gap-1.5 font-inter text-sm font-medium text-secondary transition-colors hover:text-primary"
            aria-label="Pontuação"
          >
            <ListNumbers size={18} weight="bold" className="sm:hidden" />
            <span className="hidden sm:inline">Pontuação</span>
          </Link>

          {user ? (
            <>
              {/* Perfil: avatar only on mobile, avatar+name on desktop */}
              <Link
                href="/perfil"
                className="flex items-center gap-2 font-inter text-sm font-medium text-secondary transition-colors hover:text-primary"
              >
                <Avatar src={user.image ?? null} name={user.nickname ?? user.name ?? 'U'} size={28} />
                <span className="hidden sm:inline">{user.nickname ?? user.name}</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <SignInButton />
          )}
        </nav>
      </Container>
    </header>
  )
}
