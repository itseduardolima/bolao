import Link from 'next/link'
import { Trophy } from '@phosphor-icons/react/dist/ssr'
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
        <Link
          href="/"
          className="flex items-center gap-2 font-barlow text-[22px] font-black uppercase tracking-wide text-accent"
        >
          <Trophy size={22} weight="fill" />
          Bolão - Copa do mundo 2026
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/jogos"
            className="font-inter text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            Jogos
          </Link>

          <Link
            href="/pontuacao"
            className="font-inter text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            Pontuação
          </Link>

          {user ? (
            <>
              <Link
                href="/perfil"
                className="flex items-center gap-2 font-inter text-sm font-medium text-secondary transition-colors hover:text-primary"
              >
                <Avatar src={user.image ?? null} name={user.nickname ?? user.name ?? 'U'} size={28} />
                {user.nickname ?? user.name}
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
